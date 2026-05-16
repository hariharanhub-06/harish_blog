"use client";

import { useEffect, useRef } from "react";

// Particle-based fire simulation
// Each particle rises from the bottom, shifts slightly, dims as it ages.
// Canvas sits fixed behind all content at very low opacity so text stays crisp.

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;      // 0–1, starts at 1 and decays
    decay: number;     // life lost per frame
    size: number;
}

const PARTICLE_COUNT = 220;
const SPAWN_BAND = 0.55; // particles spawn across middle 55% of width

function spawnParticle(W: number, H: number): Particle {
    return {
        x: W * (0.5 - SPAWN_BAND / 2) + Math.random() * W * SPAWN_BAND,
        y: H + Math.random() * 40,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -(1.8 + Math.random() * 3.2),
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 6 + Math.random() * 18,
    };
}

// Map life (0–1) to fire colour: white-yellow → orange → red → transparent
function fireColor(life: number, alpha: number): string {
    if (life > 0.75) {
        // White-yellow core
        const t = (life - 0.75) / 0.25;
        const r = 255;
        const g = Math.round(200 + t * 55);
        const b = Math.round(t * 120);
        return `rgba(${r},${g},${b},${alpha})`;
    } else if (life > 0.45) {
        // Orange
        const t = (life - 0.45) / 0.30;
        return `rgba(255,${Math.round(80 + t * 120)},0,${alpha})`;
    } else if (life > 0.15) {
        // Deep red
        const t = (life - 0.15) / 0.30;
        return `rgba(${Math.round(160 + t * 95)},${Math.round(t * 40)},0,${alpha})`;
    } else {
        // Dark red → fade out
        return `rgba(100,0,0,${alpha * (life / 0.15)})`;
    }
}

export function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let W = 0, H = 0;
        let rafId: number;

        const resize = () => {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialise particles spread across their lifecycle
        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
            const p = spawnParticle(W, H);
            p.life = Math.random();          // start at random life stage
            p.y = H - (1 - p.life) * H * 0.7;
            return p;
        });

        function draw() {
            // Fade trail — very dark semi-transparent wipe so fire has a trailing glow
            ctx!.fillStyle = "rgba(10,5,0,0.18)";
            ctx!.fillRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Turbulence: gentle horizontal drift
                p.vx += (Math.random() - 0.5) * 0.25;
                p.vx *= 0.96;

                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                // Respawn dead particles at the bottom
                if (p.life <= 0) {
                    particles[i] = spawnParticle(W, H);
                    continue;
                }

                // Shrink as particle ages
                const currentSize = p.size * p.life;
                const alpha = Math.min(p.life * 0.55, 0.45);

                // Outer glow
                const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 2.5);
                grad.addColorStop(0, fireColor(p.life, alpha));
                grad.addColorStop(1, fireColor(p.life, 0));

                ctx!.beginPath();
                ctx!.arc(p.x, p.y, currentSize * 2.5, 0, Math.PI * 2);
                ctx!.fillStyle = grad;
                ctx!.fill();

                // Bright core
                ctx!.beginPath();
                ctx!.arc(p.x, p.y, currentSize * 0.6, 0, Math.PI * 2);
                ctx!.fillStyle = fireColor(p.life, alpha * 1.4);
                ctx!.fill();
            }

            rafId = requestAnimationFrame(draw);
        }

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
            style={{ mixBlendMode: "screen" }}
        />
    );
}
