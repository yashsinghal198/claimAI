"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Volume2,
  RefreshCw,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { InterviewMessage, InterviewResponse } from "@/types";

interface AIAssistantWidgetProps {
  currentStatement: string;
  onUpdateStatement: (statement: string) => void;
  isAnalyzing?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://claimai-backend.onrender.com";

const GREETINGS = new Set(["hi", "hio", "hello", "hey", "hola", "sup", "good morning", "good evening", "hi there"]);
const COMPLIMENTS = new Set(["you are good", "you're good", "good job", "nice", "thanks", "thank you", "awesome", "great", "cool", "perfect", "amazing", "love it"]);
const YES_VARIANTS = new Set(["yes", "yeah", "yep", "sure", "yup", "indeed"]);
const NO_VARIANTS = new Set(["no", "nope", "nah", "negative", "no liquid"]);

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  currentStatement,
  onUpdateStatement,
  isAnalyzing = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [statement, setStatement] = useState(currentStatement);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<"liquid" | "case" | "location" | "general">("general");

  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your ClaimAI Assistant. 🤖 Tell me what happened to your device or ask me anything about your claim!",
    },
  ]);

  const [chips, setChips] = useState<string[]>([
    "I dropped my laptop on the floor",
    "Liquid spilled on my keyboard",
    "How does ClaimAI work?",
    "What documents do I need?",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatement(currentStatement);
  }, [currentStatement]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const streamBotResponse = (fullText: string) => {
    let currentIdx = 0;
    const chunkSize = 3;
    setIsTyping(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      const partial = fullText.slice(0, currentIdx);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: partial };
        return updated;
      });

      if (currentIdx >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  const generateStatefulHumanReply = (
    userText: string
  ): { reply: string; newChips: string[]; shouldUpdateStatement: boolean; statementAddition?: string; nextQuestion: "liquid" | "case" | "location" | "general" } => {
    const lower = userText.toLowerCase().trim().replace(/[!.,?]/g, "");

    // 1. Compliments & Friendly Remarks
    if (COMPLIMENTS.has(lower) || lower.includes("you are good") || lower.includes("thank you")) {
      return {
        reply: "Thank you so much! 😊 I'm happy to help. Let me know if you want to add any details or test your claim evidence!",
        newChips: ["I dropped my device", "How does ClaimAI work?", "What documents do I need?"],
        shouldUpdateStatement: false,
        nextQuestion: "general",
      };
    }

    // 2. Greetings
    if (GREETINGS.has(lower)) {
      return {
        reply: "Hey there! 👋 What happened to your device? Feel free to describe the incident or select a quick option below!",
        newChips: ["Dropped laptop on floor", "Screen cracked after fall", "Liquid spilled on keyboard"],
        shouldUpdateStatement: false,
        nextQuestion: "general",
      };
    }

    // 3. Small Talk ("how are you", "who are you")
    if (lower.includes("how are you") || lower.includes("how r u")) {
      return {
        reply: "I'm doing great, thanks for asking! 😊 I'm here to help analyze your claim, check for document errors, or refine your incident narrative. How can I help you today?",
        newChips: ["I need help with my claim", "How does ClaimAI work?", "What documents do I need?"],
        shouldUpdateStatement: false,
        nextQuestion: "general",
      };
    }

    // 4. Handle "Yes" / "No" responses based on previous question context
    if (YES_VARIANTS.has(lower)) {
      if (lastAskedQuestion === "liquid") {
        return {
          reply: "Got it, liquid exposure noted. 💧 Was it water, coffee, or another beverage, and was the device powered on at the time?",
          newChips: ["Water splash, device was off", "Coffee spill, device was on", "Beverage spill on keyboard"],
          shouldUpdateStatement: true,
          statementAddition: "Liquid exposure occurred during incident",
          nextQuestion: "general",
        };
      } else if (lastAskedQuestion === "case") {
        return {
          reply: "Great! Having a protective case installed helps demonstrate reasonable care. 🛡️ Is the outer casing damaged or the screen display only?",
          newChips: ["Screen cracked only", "Outer body dented", "Both screen & body damaged"],
          shouldUpdateStatement: true,
          statementAddition: "Device was inside a protective case during fall",
          nextQuestion: "general",
        };
      } else {
        return {
          reply: "Understood! Could you clarify a bit more details about what happened to your device?",
          newChips: ["Dropped on floor", "Screen shattered", "Liquid spilled"],
          shouldUpdateStatement: false,
          nextQuestion: "general",
        };
      }
    }

    if (NO_VARIANTS.has(lower) || lower === "no liquid" || lower.includes("no liquid")) {
      if (lastAskedQuestion === "liquid" || lower.includes("no liquid")) {
        return {
          reply: "Understood! Dry impact only with no liquid exposure. 🛡️ Was the device inside a protective case or cover when it fell?",
          newChips: ["Protective case was installed", "No case, bare device", "Screen protector was on"],
          shouldUpdateStatement: true,
          statementAddition: "No liquid exposure involved (dry impact)",
          nextQuestion: "case",
        };
      } else if (lastAskedQuestion === "case") {
        return {
          reply: "Noted, no protective case installed. Is there any physical crack on the screen or outer housing?",
          newChips: ["Screen display cracked", "Outer housing dented", "Port bent"],
          shouldUpdateStatement: true,
          statementAddition: "Device was bare without protective case",
          nextQuestion: "general",
        };
      } else {
        return {
          reply: "Understood! Let me know what specific details or questions you'd like to address.",
          newChips: ["I dropped my device", "How to fix model mismatch", "Export carrier PDF"],
          shouldUpdateStatement: false,
          nextQuestion: "general",
        };
      }
    }

    // 5. Specific claim fact answers
    if (lower.includes("no liquid") || lower.includes("dry impact")) {
      return {
        reply: "Great! I've noted dry impact with no liquid exposure. 🛡️ Was the device in a protective case or cover when it fell?",
        newChips: ["Protective case was installed", "No case, bare device", "Screen protector installed"],
        shouldUpdateStatement: true,
        statementAddition: "No liquid exposure involved (dry impact)",
        nextQuestion: "case",
      };
    }

    if (lower.includes("dropped") || lower.includes("fall") || lower.includes("fell") || lower.includes("crack")) {
      return {
        reply: "Understood! I've updated your claim statement with the drop incident. 💧 Was there any liquid or moisture involved during or after the fall?",
        newChips: ["No liquid involved, dry impact", "Water splash occurred", "Coffee/beverage spill"],
        shouldUpdateStatement: true,
        statementAddition: userText,
        nextQuestion: "liquid",
      };
    }

    // 6. Generic conversational reply for open-ended text
    return {
      reply: `Thanks for clarifying! I've updated your narrative with: "${userText}". Is there any other detail regarding location or warranty you'd like to add?`,
      newChips: ["Add location details", "Check model numbers", "All details complete"],
      shouldUpdateStatement: true,
      statementAddition: userText,
      nextQuestion: "general",
    };
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const newMessages: InterviewMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInputVal("");
    setIsTyping(true);

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
        if (data.enhanced_statement && data.enhanced_statement !== statement) {
          setStatement(data.enhanced_statement);
          onUpdateStatement(data.enhanced_statement);
        }
        if (data.clarifying_chips && data.clarifying_chips.length > 0) {
          setChips(data.clarifying_chips);
        }
        streamBotResponse(data.assistant_reply);
        return;
      }
    } catch {
      // Fallback to local human conversational engine
    }

    const { reply, newChips, shouldUpdateStatement, statementAddition, nextQuestion } =
      generateStatefulHumanReply(userText);

    if (shouldUpdateStatement && statementAddition) {
      const refined = statement
        ? `${statement}. Additional context: ${statementAddition}`
        : `Incident details: ${statementAddition}`;
      setStatement(refined);
      onUpdateStatement(refined);
    }

    setLastAskedQuestion(nextQuestion);
    setChips(newChips);
    streamBotResponse(reply);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 p-3.5 pr-5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-2xl shadow-cyan-500/30 border border-cyan-300/30 group hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>

          <div className="text-left">
            <span className="text-xs font-extrabold tracking-wide block">
              AI Claim Assistant
            </span>
            <span className="text-[10px] text-cyan-100/80 font-mono">
              Online • Live Intake Copilot
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-slate-950/95 border border-cyan-500/40 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? "w-80 h-16"
              : "w-[92vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[85vh]"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  ClaimAI Conversational Assistant
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ask anything about your claim or insurance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="px-4 py-2 bg-cyan-950/20 border-b border-cyan-500/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-cyan-300 truncate max-w-[75%]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-spin" />
                  <span className="truncate font-mono">
                    {statement || "Drafting incident statement in real time..."}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/80">
                  LIVE SYNC
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg, idx) => {
                  const isBot = msg.role === "assistant";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${
                        isBot ? "items-start" : "items-start flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] ${
                          isBot
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {isBot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[82%] shadow-sm whitespace-pre-line ${
                          isBot
                            ? "bg-slate-900 border border-slate-800 text-slate-200"
                            : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                        }`}
                      >
                        {msg.content || (
                          <span className="inline-flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-[11px] text-cyan-400 pl-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Copilot is formulating response...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {chips.length > 0 && (
                <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/50 border border-slate-800 text-slate-300 transition-all flex-shrink-0 font-medium whitespace-nowrap active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-slate-800 bg-slate-900/90">
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
                    placeholder="Type anything here (e.g. 'how are you' or 'dropped my phone')..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    disabled={isTyping || !inputVal.trim()}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
