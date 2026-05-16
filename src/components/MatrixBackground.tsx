"use client";

import { useEffect, useRef } from "react";

interface AuroraCurtain {
    color: string;
    baseYFraction: number;   // 0–1 fraction of canvas height
    ampFraction: number;     // amplitude as fraction of canvas height
    frequency: number;       // waves across the screen
    speed: number;           // phase change per second (radians)
    phaseOffset: number;     // initial phase offset
    alpha: number;           // max fill opacity
}

const CURTAINS: AuroraCurtain[] = [
    { color: "#00ff88", baseYFraction: 0.14, ampFraction: 0.08, frequency: 2.8, speed:  0.40, phaseOffset: 0.0,  alpha: 0.16 },
    { color: "#00e5cc", baseYFraction: 0.21, ampFraction: 0.07, frequency: 2.1, speed:  0.55, phaseOffset: 1.2,  alpha: 0.14 },
    { color: "#7b2fff", baseYFraction: 0.17, ampFraction: 0.10, frequency: 3.4, speed: -0.35, phaseOffset: 2.4,  alpha: 0.13 },
    { color: "#ff6bd6", baseYFraction: 0.27, ampFraction: 0.06, frequency: 1.8, speed:  0.70, phaseOffset: 0.8,  alpha: 0.11 },
    { color: "#00ccff", baseYFraction: 0.11, ampFraction: 0.09, frequency: 2.5, speed: -0.50, phaseOffset: 3.6,  alpha: 0.12 },
];

export function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let rafId: number;

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = (ts: number) => {
            const t = ts / 1000; // seconds
            const W = canvas.width;
            const H = canvas.height;

            ctx.clearRect(0, 0, W, H);

            for (const curtain of CURTAINS) {
                const baseY = curtain.baseYFraction * H;
                const amp   = curtain.ampFraction   * H;
                const phase = t * curtain.speed + curtain.phaseOffset;
                const stripBottom = baseY + amp + H * 0.12; // gradient fades out here

                // Build the wave path across full width
                ctx.beginPath();
                for (let px = 0; px <= W; px += 4) {
                    const angle = (px / W) * Math.PI * 2 * curtain.frequency + phase;
                    const y = baseY + Math.sin(angle) * amp;
                    if (px === 0) ctx.moveTo(px, y);
                    else          ctx.lineTo(px, y);
                }
                // Close the strip downward
                ctx.lineTo(W, stripBottom);
                ctx.lineTo(0, stripBottom);
                ctx.closePath();

                // Vertical gradient: color → transparent
                const grad = ctx.createLinearGradient(0, baseY - amp, 0, stripBottom);
                grad.addColorStop(0,   hexWithAlpha(curtain.color, curtain.alpha * 0.4));
                grad.addColorStop(0.3, hexWithAlpha(curtain.color, curtain.alpha));
                grad.addColorStop(1,   hexWithAlpha(curtain.color, 0));

                // Soft glow
                ctx.shadowBlur  = 50;
                ctx.shadowColor = curtain.color;

                ctx.fillStyle   = grad;
                ctx.globalAlpha = 1;
                ctx.fill();

                ctx.shadowBlur  = 0;
            }

            rafId = requestAnimationFrame(draw);
        };

        rafId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
}

function hexWithAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
