"use client";

import { useEffect, useRef } from "react";

export default function DNAParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: { x: number; y: number; offset: number; speed: number; amplitude: number; color: string }[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                offset: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02,
                amplitude: 30 + Math.random() * 50,
                color: i % 2 === 0 ? "rgba(96, 165, 250, 0.4)" : "rgba(192, 132, 252, 0.4)" // Blue and Purple
            });
        }

        let time = 0;

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            time += 0.01;

            // DNA Helix 1
            ctx.beginPath();
            for (let i = 0; i < width; i += 10) {
                const y = height / 2 + Math.sin(i * 0.01 + time) * 100;
                ctx.fillStyle = "rgba(96, 165, 250, 0.1)";
                ctx.fillRect(i, y, 2, 2);
            }

            // DNA Helix 2 (phase offset)
            for (let i = 0; i < width; i += 10) {
                const y = height / 2 + Math.sin(i * 0.01 + time + Math.PI) * 100;
                ctx.fillStyle = "rgba(192, 132, 252, 0.1)";
                ctx.fillRect(i, y, 2, 2);
            }

            // Random particles following helix-ish paths
            particles.forEach((p, idx) => {
                p.offset += p.speed;
                const helixY = height / 2 + Math.sin(p.x * 0.01 + time + (idx % 2 === 0 ? 0 : Math.PI)) * 100;
                const jitter = Math.sin(p.offset) * p.amplitude;

                ctx.beginPath();
                ctx.arc(p.x, helixY + jitter, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Move across screen
                p.x += 0.5;
                if (p.x > width) p.x = -10;
            });

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        />
    );
}
