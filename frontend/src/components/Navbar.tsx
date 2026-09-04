"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface NavbarProps {
  onReset: () => void;
}

const NAV_LINKS = [
  { label: "How it Works", href: "#trust-marquee" },
  { label: "Live Demo", href: "#evidence-studio" },
  { label: "Features", href: "#demo-presets" },
];

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-black/[0.08] px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-black/[0.06] shadow-sm p-1">
            <img
              src="/logo-icon.png"
              alt="ClaimAI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-bold text-base tracking-tight text-black">
            ClaimAI
          </h1>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-black/55 hover:text-black rounded-lg hover:bg-black/[0.04] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset workspace"
            className="p-2 rounded-lg text-black/40 hover:text-black hover:bg-black/[0.04] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href="#evidence-studio"
            className="hidden sm:flex items-center px-4 py-2 text-[13px] font-semibold text-white bg-black rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
};
