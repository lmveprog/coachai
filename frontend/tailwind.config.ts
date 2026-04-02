import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design system CoachAI
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",  // Primary
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Difficulty colors
        easy: "#22c55e",
        medium: "#f59e0b",
        hard: "#ef4444",
        expert: "#8b5cf6",
        // Rank colors
        rank: {
          rookie: "#6b7280",
          analyst: "#22c55e",
          expert: "#3b82f6",
          master: "#8b5cf6",
          grandmaster: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
  safelist: [
    "text-easy", "text-medium", "text-hard", "text-expert",
    "bg-easy/10", "bg-medium/10", "bg-hard/10", "bg-expert/10",
    "border-easy/30", "border-medium/30", "border-hard/30", "border-expert/30",
  ],
};

export default config;
