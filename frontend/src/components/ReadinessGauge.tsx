"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, Sparkles, PlusCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface ReadinessGaugeProps {
  score: number;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [incrementBadge, setIncrementBadge] = useState<number | null>(null);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    const prev = prevScoreRef.current;
    if (score > prev) {
      const diff = score - prev;
      setIncrementBadge(diff);

      // Hide badge after 3.5s
      const timer = setTimeout(() => {
        setIncrementBadge(null);
      }, 3500);

      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const startScore = animatedScore;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (score - startScore) * eased);
      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (score >= 80 && animatedScore < 80) {
        // Trigger subtle celebration confetti on high readiness transition
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.55 },
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
      className={`claim-panel relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${glowColor}`}
    >
      {/* Floating Animated Increment Badge */}
      {incrementBadge && (
        <div className="claim-reveal absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold shadow-lg shadow-emerald-500/10">
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>+{incrementBadge} PTS RECOVERED</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-purple-900" />
        <span className="text-xs uppercase tracking-wider font-bold text-black/70">
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
            stroke="rgba(0,0,0,0.08)"
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
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
            }}
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-black flex items-baseline">
            {animatedScore}
            <span className="text-lg font-bold text-black/50 ml-0.5">%</span>
          </span>
          <span className="text-[11px] font-medium text-black/50 mt-0.5">
            Readiness Index
          </span>
        </div>
      </div>

      {/* Status Tier Badge */}
      <div className="mt-4">
        {isHigh ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Submission Ready</span>
          </div>
        ) : isMedium ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Remediation Advised</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-semibold">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>High Risk of Denial</span>
          </div>
        )}
      </div>

      <p className="text-xs text-black/50 mt-3 max-w-[280px] leading-relaxed">
        {isHigh
          ? "Evidence consistency, timeline order, and required documentation are verified."
          : isMedium
          ? "Minor discrepancies or missing document angles detected. Follow recommendations below."
          : "Critical contradictions found or required purchase proof is missing."}
      </p>
    </div>
  );
};
