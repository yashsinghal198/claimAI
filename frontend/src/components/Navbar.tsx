"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Sparkles, RefreshCw, Radio } from "lucide-react";
import { checkBackendHealth } from "@/services/api";

interface NavbarProps {
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const online = await checkBackendHealth();
    setIsOnline(online);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                ClaimAI
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Pre-Claim Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              CodeBuild 1.0 • Team Tribit
            </p>
          </div>
        </div>

        {/* Right Action Bar & Health status */}
        <div className="flex items-center gap-3">
          {/* API Connectivity status pill */}
          <button
            onClick={checkStatus}
            title="Click to recheck API status"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isOnline === null
                  ? "text-slate-400 animate-spin"
                  : isOnline
                  ? "text-emerald-400 animate-pulse"
                  : "text-amber-400"
              }`}
            />
            <span className="hidden md:inline text-slate-400">FastAPI Gateway:</span>
            <span
              className={
                isOnline === true
                  ? "text-emerald-400 font-semibold"
                  : isOnline === false
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400"
              }
            >
              {isOnline === null
                ? "Connecting..."
                : isOnline
                ? "Online (Port 8000)"
                : "Simulation Mode"}
            </span>
          </button>

          {/* Reset Workspace button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Model Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPT-4o Vision & Graph</span>
          </div>
        </div>
      </div>
    </header>
  );
};
