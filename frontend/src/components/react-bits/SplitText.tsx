"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SplitTextProps {
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: { opacity?: number; y?: number; rotateX?: number; scale?: number };
  to?: { opacity?: number; y?: number; rotateX?: number; scale?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  tag = "p",
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const el = containerRef.current;
    const Tag = tag;

    const splitText = (text: string): string[] => {
      if (splitType === "chars") return text.split("");
      if (splitType === "words") return text.split(" ");
      if (splitType === "lines") return text.split("\n");
      return text.split(" ");
    };

    const parts = splitText(text);
    el.innerHTML = "";

    parts.forEach((part, i) => {
      const wrapper = document.createElement("span");
      wrapper.style.display = "inline-block";
      wrapper.style.overflow = "hidden";

      const inner = document.createElement("span");
      inner.textContent = splitType === "words" ? part + "\u00A0" : part;
      inner.style.display = "inline-block";
      inner.style.willChange = "transform, opacity";
      inner.className = `split-char-${i}`;

      wrapper.appendChild(inner);
      el.appendChild(wrapper);
    });

    const chars = el.querySelectorAll(`[class^="split-char-"]`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            gsap.fromTo(
              chars,
              {
                opacity: from.opacity ?? 0,
                y: from.y ?? 40,
                rotateX: from.rotateX ?? 0,
                scale: from.scale ?? 1,
              },
              {
                opacity: to.opacity ?? 1,
                y: to.y ?? 0,
                rotateX: to.rotateX ?? 0,
                scale: to.scale ?? 1,
                duration,
                ease,
                stagger: delay / 1000,
                onComplete: onLetterAnimationComplete,
              }
            );

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [text, tag, splitType, delay, duration, ease, from, to, threshold, rootMargin, onLetterAnimationComplete]);

  const Tag = tag;

  return (
    <Tag
      ref={containerRef as any}
      className={className}
      style={{ textAlign, perspective: "600px" }}
    />
  );
}
