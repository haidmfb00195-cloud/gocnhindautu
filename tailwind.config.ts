import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text-primary)",
        surface: "var(--color-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
        },
        border: "var(--color-border)",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        'gradient-dark-card': 'linear-gradient(to bottom right, #0B0B0B, #3A2E00)',
      }
    },
  },
  plugins: [],
};
export default config;
