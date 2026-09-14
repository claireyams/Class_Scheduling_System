import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF7",
        ink: "#1A1F1C",
        muted: "#6B7268",
        line: "#E4E2DA",
        forest: {
          50: "#EEF5EF",
          100: "#D6E7D9",
          300: "#7FAE87",
          500: "#2F6B3C",
          600: "#245530",
          700: "#1B4023",
          900: "#0F2615",
        },
        gold: {
          100: "#FCF0CE",
          300: "#F4CE6B",
          500: "#E0A526",
          600: "#B9821A",
        },
        clay: {
          500: "#C1584B",
        },
      },
      fontFamily: {
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 38, 21, 0.06), 0 1px 0 rgba(15, 38, 21, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
