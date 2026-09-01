"use client";

import React, { useState } from "react";
import { MessageSquareText, Sparkles, X, Send, Bot, User, CheckCircle2, ArrowRight } from "lucide-react";
import { InterviewMessage, InterviewResponse } from "@/types";

interface InterviewerAgentProps {
  initialStatement: string;
  onApplyStatement: (statement: string) => void;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const InterviewerAgent: React.FC<InterviewerAgentProps> = ({
  initialStatement,
  onApplyStatement,
  onClose,
}) => {
  const [statement, setStatement] = useState(initialStatement);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      role: "assistant",
      content:
        statement.trim().length > 0
          ? `I've analyzed your initial draft: "${statement}". To ensure insurance adjusters don't delay your claim, let's clarify a couple of risk details. Was there any liquid exposure or spillage involved?`
          : "Hello! I am your Pre-Claim AI Intake Assistant. Tell me briefly what happened to your device, and I will help you craft a clear, carrier-ready statement.",
    },
  ]);

  const [chips, setChips] = useState<string[]>([
    "No liquid involved, dry impact only",
    "Dropped from office desk onto floor",
    "Protective case was on during fall",
  ]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const newMessages: InterviewMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInputVal("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_statement: statement,
          messages: newMessages,
          last_user_response: userText,
        }),
      });

      if (res.ok) {
        const data: InterviewResponse = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.assistant_reply },
        ]);
        setStatement(data.enhanced_statement);
        if (data.clarifying_chips && data.clarifying_chips.length > 0) {
          setChips(data.clarifying_chips);
        }
      } else {
        throw new Error("Failed to reach interview endpoint");
      }
    } catch {
      // Local fallback
      const updated = `${statement}. Additional context: ${userText}`.trim();
      setStatement(updated);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Thank you for clarifying! I have incorporated that detail into your official incident statement. Any other context regarding device handling?",
        },
      ]);
      setChips([
        "Device was powered off immediately",
        "Hardware malfunction noted after fall",
        "Ready to apply statement",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Conversational Intake Interviewer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  AI Agent
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Live interactive Q&A to eliminate ambiguous claim narrative risks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Enhanced Statement Preview Bar */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider mb-1">
            Real-Time Refined Incident Narrative
          </span>
          <p className="text-xs text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 leading-relaxed font-mono">
            {statement || "Awaiting intake conversation..."}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isBot ? "items-start" : "items-start flex-row-reverse"}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                    isBot
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200"
                      : "bg-indigo-600/90 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AI Interviewer is formulating clarifying question...</span>
            </div>
          )}
        </div>

        {/* Quick Answer Chips */}
        {chips.length > 0 && (
          <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">
              Suggestions:
            </span>
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700 text-slate-300 transition-all flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar & Apply Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Reply to AI assistant with more context..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                onApplyStatement(statement);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Refined Statement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
