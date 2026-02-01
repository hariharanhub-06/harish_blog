import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
    if (!url) return "";
    if (url.includes("imagekit.io")) {
        // Check if already has query params
        const separator = url.includes("?") ? "&" : "?";
        // Avoid double optimization if already present
        if (url.includes("tr=")) return url;
        return `${url}${separator}tr=w-${width},f-auto,q-80`;
    }
    return url;
}
