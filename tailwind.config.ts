import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Themeable surfaces — driven by CSS vars (see globals.css :root / .light).
        // Token names kept stable across the app; components never change.
        bg: {
          DEFAULT: "#ffffff", // used as `text-bg` (white text on accent buttons)
          soft: "rgb(var(--bg-soft) / <alpha-value>)", // page canvas
          panel: "rgb(var(--bg-panel) / <alpha-value>)", // card / surface
          panel2: "rgb(var(--bg-panel2) / <alpha-value>)", // raised fill / inputs / hover
        },
        line: "rgb(var(--line) / <alpha-value>)", // hairline separators / borders
        // Accent — Apple system blue (reads correctly on light + dark)
        teal: {
          DEFAULT: "#0a84ff",
          dark: "#0066cc",
          light: "#409cff",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)", // primary text
          muted: "rgb(var(--ink-muted) / <alpha-value>)", // secondary text
        },
        pos: "#30d158", // Apple green (income)
        neg: "#ff453a", // Apple red (expense)
        warn: "#ff9f0a", // Apple orange
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.4)",
        glow: "0 6px 18px rgba(10,132,255,.4)",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
