import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1e40af", // Professional Blue
                secondary: "#64748b", // Slate Gray
                accent: "#f59e0b", // Amber
                background: "#f8fafc", // Light Gray
                text: "#1f2937", // Dark Gray
            },
            fontFamily: {
                sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
                mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
            },
        },
    },
    plugins: [],
};
export default config;
