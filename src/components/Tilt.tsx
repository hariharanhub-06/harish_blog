"use client";

import React, { useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";

interface TiltOptions {
    max?: number;
    speed?: number;
    glare?: boolean;
    "max-glare"?: number;
    scale?: number;
    perspective?: number;
    easing?: string;
}

export function Tilt({
    children,
    options,
    className = "",
}: {
    children: React.ReactNode;
    options?: TiltOptions;
    className?: string;
}) {
    const tiltRef = useRef<HTMLDivElement>(null);

    const defaultOptions = {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.02,
        perspective: 1000,
        easing: "cubic-bezier(.03,.98,.52,.99)",
    };

    useEffect(() => {
        if (tiltRef.current) {
            VanillaTilt.init(tiltRef.current, { ...defaultOptions, ...options });
        }

        return () => {
            if (tiltRef.current && (tiltRef.current as any).vanillaTilt) {
                (tiltRef.current as any).vanillaTilt.destroy();
            }
        };
    }, [options]);

    return (
        <div ref={tiltRef} className={className}>
            {children}
        </div>
    );
}
