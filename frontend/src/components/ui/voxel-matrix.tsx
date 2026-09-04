"use client";

import React, { useEffect, useRef } from "react";

export function CubeMatrix() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const mouse = { x: -1000, y: -1000 };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        let time = 0;

        const render = () => {
            time += 0.03;

            // Forced light theme matching ClaimAI
            const bgColor = "#FFFDF2";
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            const size = 28;
            const hSize = size * Math.sqrt(3) / 2;

            const cols = Math.ceil(width / (size * 1.5)) + 4;
            const rows = Math.ceil(height / (hSize * 2)) + 4;

            const drawCube = (x: number, y: number, elevation: number) => {
                const topY = y - elevation;

                // Extremely subtle off-white palette
                const topColor = "#ffffff";
                const leftColor = "#f5f3e8";
                const rightColor = "#ebe9dd";
                const accentTop = "#f4ebff"; // subtle purple for hover state

                const isElevated = elevation > 10;

                ctx.fillStyle = isElevated ? accentTop : topColor;
                ctx.beginPath();
                ctx.moveTo(x, topY - size / 2);
                ctx.lineTo(x + hSize, topY - size / 4);
                ctx.lineTo(x, topY);
                ctx.lineTo(x - hSize, topY - size / 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = leftColor;
                ctx.beginPath();
                ctx.moveTo(x - hSize, topY - size / 4);
                ctx.lineTo(x, topY);
                ctx.lineTo(x, topY + size / 2);
                ctx.lineTo(x - hSize, topY + size / 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = rightColor;
                ctx.beginPath();
                ctx.moveTo(x + hSize, topY - size / 4);
                ctx.lineTo(x, topY);
                ctx.lineTo(x, topY + size / 2);
                ctx.lineTo(x + hSize, topY + size / 4);
                ctx.closePath();
                ctx.fill();
            };

            for (let r = -2; r < rows; r++) {
                for (let c = -2; c < cols; c++) {
                    const x = c * size * 1.5;
                    const y = r * hSize * 2 + (c % 2 === 0 ? 0 : hSize);

                    const wave = Math.sin(c * 0.3 + r * 0.3 + time) * 8;

                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let mouseElevation = 0;
                    if (dist < 180) {
                        mouseElevation = (1 - dist / 180) * 35;
                    }

                    drawCube(x, y, wave + mouseElevation);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto" style={{ zIndex: 0, opacity: 0.9 }}>
            <canvas ref={canvasRef} className="absolute inset-0 block cursor-default" />
        </div>
    );
}
