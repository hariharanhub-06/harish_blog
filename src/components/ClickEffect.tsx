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
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (style === "none") return;

        const spawnParticle = (x: number, y: number) => {
            const p: Particle = { id: nextId++, x, y, style };
            setParticles((prev) => [...prev, p]);
            setTimeout(() => setParticles((prev) => prev.filter((q) => q.id !== p.id)), 1100);
        };

        const onClick = (e: MouseEvent) => spawnParticle(e.clientX, e.clientY);

        // Mobile: track touchstart position, spawn on touchend only if it was a tap (not scroll)
        const onTouchStart = (e: TouchEvent) => {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const onTouchEnd = (e: TouchEvent) => {
            const t = e.changedTouches[0];
            const start = touchStartRef.current;
            if (!start) return;
            const dx = Math.abs(t.clientX - start.x);
            const dy = Math.abs(t.clientY - start.y);
            // Only spawn if touch didn't move much (tap, not scroll)
            if (dx < 12 && dy < 12) spawnParticle(t.clientX, t.clientY);
            touchStartRef.current = null;
        };

        // Cursor trail for sparkle only
        let trailTimer: ReturnType<typeof setInterval> | null = null;
        if (style === "sparkle") {
            let mx = 0, my = 0;
            const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
            document.addEventListener("mousemove", onMove);
            trailTimer = setInterval(() => {
                const dot = document.createElement("div");
                dot.style.cssText = `position:fixed;left:${mx}px;top:${my}px;width:4px;height:4px;border-radius:50%;background:#f97316;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);animation:ceTrailFade 0.35s ease-out forwards`;
                document.body.appendChild(dot);
                setTimeout(() => dot.remove(), 380);
            }, 40);
            document.addEventListener("click", onClick);
            document.addEventListener("touchstart", onTouchStart, { passive: true });
            document.addEventListener("touchend", onTouchEnd);
            return () => {
                document.removeEventListener("mousemove", onMove);
                if (trailTimer) clearInterval(trailTimer);
                document.removeEventListener("click", onClick);
                document.removeEventListener("touchstart", onTouchStart);
                document.removeEventListener("touchend", onTouchEnd);
            };
        }

        document.addEventListener("click", onClick);
        document.addEventListener("touchstart", onTouchStart, { passive: true });
        document.addEventListener("touchend", onTouchEnd);
        return () => {
            document.removeEventListener("click", onClick);
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, [style]);

    if (style === "none") return null;

    return (
        <>
            <style>{`
                @keyframes ceEmojiPop {
                    0%   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
                    100% { transform: translate(-50%,-130px) scale(1.3); opacity: 0; }
                }
                @keyframes ceWaterRipple {
                    0%   { transform: scale(0); opacity: 0.85; }
                    60%  { opacity: 0.5; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @keyframes ceTrailFade {
                    0%   { opacity: 0.8; transform: translate(-50%,-50%) scale(1); }
                    100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2); }
                }
                @keyframes ceSparklePop {
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
                                fontSize: "26px",
                                pointerEvents: "none",
                                zIndex: 9999,
                                userSelect: "none",
                                animation: "ceEmojiPop 0.8s ease-out forwards",
                            }}
                        >
                            {emoji}
                        </div>
                    );
                }

                if (p.style === "ripple") {
                    // 4 rings staggered to simulate water ripple physics
                    const rings = [
                        { size: 50,  delay: 0,    dur: 0.5,  color: "rgba(249,115,22,1)",   width: 3 },
                        { size: 100, delay: 0.08, dur: 0.65, color: "rgba(249,115,22,0.6)", width: 2 },
                        { size: 170, delay: 0.17, dur: 0.82, color: "rgba(255,200,100,0.4)", width: 1.5 },
                        { size: 250, delay: 0.28, dur: 1.0,  color: "rgba(255,255,255,0.2)", width: 1 },
                    ];
                    return (
                        <div key={p.id} style={{ position: "fixed", left: p.x, top: p.y, pointerEvents: "none", zIndex: 9999 }}>
                            {rings.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        left: -(r.size / 2),
                                        top: -(r.size / 2),
                                        width: r.size,
                                        height: r.size,
                                        borderRadius: "50%",
                                        border: `${r.width}px solid ${r.color}`,
                                        animation: `ceWaterRipple ${r.dur}s cubic-bezier(0.05, 0.5, 0.4, 1) ${r.delay}s forwards`,
                                    }}
                                />
                            ))}
                        </div>
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
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: "absolute",
                                            width: size,
                                            height: size,
                                            borderRadius: "50%",
                                            background: colors[i % colors.length],
                                            // @ts-ignore
                                            "--tx": `${tx}px`,
                                            "--ty": `${ty}px`,
                                            animation: "ceSparklePop 0.65s ease-out forwards",
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
