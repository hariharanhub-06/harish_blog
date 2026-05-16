"use client";

import { useEffect, useRef, useState } from "react";

type Style = "none" | "emoji" | "sparkle" | "ripple";

interface Particle {
    id: number;
    x: number;
    y: number;
    style: Style;
}

const EMOJIS = ["🌟", "✨", "💫", "🎉", "😊", "💖", "🚀", "👍", "🔥", "💥", "🎊", "⚡"];

let nextId = 0;

export default function ClickEffect({ style }: { style: Style }) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const trailRef = useRef<{ el: HTMLDivElement; born: number }[]>([]);

    useEffect(() => {
        if (style === "none") return;

        const onClick = (e: MouseEvent) => {
            const p: Particle = { id: nextId++, x: e.clientX, y: e.clientY, style };
            setParticles((prev) => [...prev, p]);
            setTimeout(() => setParticles((prev) => prev.filter((q) => q.id !== p.id)), 900);
        };

        // Cursor trail for sparkle only
        let trailTimer: ReturnType<typeof setInterval> | null = null;
        if (style === "sparkle") {
            let mx = 0, my = 0;
            const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
            document.addEventListener("mousemove", onMove);

            trailTimer = setInterval(() => {
                const dot = document.createElement("div");
                dot.style.cssText = `position:fixed;left:${mx}px;top:${my}px;width:4px;height:4px;border-radius:50%;background:#f97316;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);animation:trailFade 0.35s ease-out forwards`;
                document.body.appendChild(dot);
                setTimeout(() => dot.remove(), 380);
            }, 40);

            return () => {
                document.removeEventListener("mousemove", onMove);
                if (trailTimer) clearInterval(trailTimer);
                document.removeEventListener("click", onClick);
            };
        }

        document.addEventListener("click", onClick);
        return () => {
            document.removeEventListener("click", onClick);
            if (trailTimer) clearInterval(trailTimer);
        };
    }, [style]);

    // Also attach click for sparkle separately (outside the trail block)
    useEffect(() => {
        if (style !== "sparkle") return;
        const onClick = (e: MouseEvent) => {
            const p: Particle = { id: nextId++, x: e.clientX, y: e.clientY, style };
            setParticles((prev) => [...prev, p]);
            setTimeout(() => setParticles((prev) => prev.filter((q) => q.id !== p.id)), 800);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [style]);

    if (style === "none") return null;

    return (
        <>
            <style>{`
                @keyframes emojiPop {
                    0%   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
                    100% { transform: translate(-50%,-120px) scale(1.3); opacity: 0; }
                }
                @keyframes ripple1 {
                    0%   { r: 0;  opacity: 0.7; }
                    100% { r: 50; opacity: 0; }
                }
                @keyframes ripple2 {
                    0%   { r: 0;  opacity: 0.5; }
                    100% { r: 75; opacity: 0; }
                }
                @keyframes trailFade {
                    0%   { opacity: 0.8; transform: translate(-50%,-50%) scale(1); }
                    100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2); }
                }
                @keyframes sparklePop {
                    0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
                    100% { opacity: 0; transform: translate(var(--tx),var(--ty)) scale(0); }
                }
            `}</style>

            {particles.map((p) => {
                if (p.style === "emoji") {
                    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                    return (
                        <div
                            key={p.id}
                            style={{
                                position: "fixed",
                                left: p.x,
                                top: p.y,
                                fontSize: "24px",
                                pointerEvents: "none",
                                zIndex: 9999,
                                userSelect: "none",
                                animation: "emojiPop 0.75s ease-out forwards",
                            }}
                        >
                            {emoji}
                        </div>
                    );
                }

                if (p.style === "ripple") {
                    return (
                        <svg
                            key={p.id}
                            style={{
                                position: "fixed",
                                left: p.x - 80,
                                top: p.y - 80,
                                width: 160,
                                height: 160,
                                pointerEvents: "none",
                                zIndex: 9999,
                                overflow: "visible",
                            }}
                        >
                            <circle
                                cx="80" cy="80" r="0"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2"
                                style={{ animation: "ripple1 0.55s ease-out forwards" }}
                            />
                            <circle
                                cx="80" cy="80" r="0"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.5"
                                style={{ animation: "ripple2 0.75s ease-out 0.1s forwards" }}
                            />
                        </svg>
                    );
                }

                if (p.style === "sparkle") {
                    return (
                        <div key={p.id} style={{ position: "fixed", left: p.x, top: p.y, pointerEvents: "none", zIndex: 9999 }}>
                            {Array.from({ length: 8 }).map((_, i) => {
                                const angle = (i / 8) * 360;
                                const dist = 35 + Math.random() * 30;
                                const tx = Math.cos((angle * Math.PI) / 180) * dist;
                                const ty = Math.sin((angle * Math.PI) / 180) * dist;
                                const size = 4 + Math.random() * 5;
                                const colors = ["#f97316", "#fbbf24", "#ffffff", "#fb923c"];
                                const color = colors[i % colors.length];
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: "absolute",
                                            width: size,
                                            height: size,
                                            borderRadius: "50%",
                                            background: color,
                                            // @ts-ignore
                                            "--tx": `${tx}px`,
                                            "--ty": `${ty}px`,
                                            animation: `sparklePop 0.65s ease-out forwards`,
                                            animationDelay: `${i * 20}ms`,
                                        } as React.CSSProperties}
                                    />
                                );
                            })}
                        </div>
                    );
                }

                return null;
            })}
        </>
    );
}
