"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

interface ReadinessGaugeProps {
  score: number;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth score animation
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(eased * score);
      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (score >= 80) {
        // Trigger subtle celebration confetti on high readiness
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#06b6d4", "#6366f1"],
        });
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Radius and circumference for circular SVG
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const isHigh = score >= 80;
  const isMedium = score >= 50 && score < 80;

  const strokeColor = isHigh
    ? "#10b981" // emerald-500
    : isMedium
    ? "#f59e0b" // amber-500
    : "#f43f5e"; // rose-500

  const glowColor = isHigh
    ? "shadow-emerald-500/20"
    : isMedium
    ? "shadow-amber-500/20"
    : "shadow-rose-500/20";

  return (
    <div
      className={`relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center transition-all ${glowColor}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
          Claim Evidence Readiness
        </span>
      </div>

      {/* SVG Circular Progress Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background track circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
            }}
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-white flex items-baseline">
            {animatedScore}
            <span className="text-lg font-bold text-slate-400 ml-0.5">%</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400 mt-0.5">
            Readiness Index
          </span>
        </div>
      </div>

      {/* Status Tier Badge */}
      <div className="mt-4">
        {isHigh ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Submission Ready</span>
          </div>
        ) : isMedium ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Remediation Advised</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>High Risk of Denial</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3 max-w-[280px] leading-relaxed">
        {isHigh
          ? "Evidence consistency, timeline order, and required documentation are verified."
          : isMedium
          ? "Minor discrepancies or missing document angles detected. Follow recommendations below."
          : "Critical contradictions found or required purchase proof is missing."}
      </p>
    </div>
  );
};
