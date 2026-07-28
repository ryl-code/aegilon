import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
          hover: "var(--surface-hover)",
        },
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        critical: "var(--critical)",
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
      },
      boxShadow: {
        card: "var(--card-shadow)",
        xs: "0 1px 3px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
