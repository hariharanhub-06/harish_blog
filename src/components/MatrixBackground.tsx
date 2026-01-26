"use client";

import { useEffect, useRef } from "react";

export function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Matrix characters
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`";
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);

        // Array of y-positions for each column
        const drops: number[] = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        function draw() {
            if (!ctx || !canvas) return;

            // Semi-transparent black for fade effect
            ctx.fillStyle = "rgba(14, 14, 14, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Green text
            ctx.fillStyle = "#0f0";
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(text, x, y);

                // Reset drop to top randomly
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }

        const interval = setInterval(draw, 33); // ~30 FPS

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-[0.08]"
            style={{ mixBlendMode: "screen" }}
        />
    );
}
