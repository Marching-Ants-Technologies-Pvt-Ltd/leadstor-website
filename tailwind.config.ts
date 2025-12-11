import type { Config } from "tailwindcss";

/* Pankaj
*/
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 25s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        }
      },
      colors: {
        leadstor: {
          primary: "#F1BBEA",
          primaryHover: "#E38CD8",
          primaryLight: "#F6D4F0",
          lavender: "#C084FC",
          lavenderHover: "#A855F7",
          violet: "#8B5CF6",
          bg: "#F8FAFC",
          header: "#F1F5F9",
          divider: "#E2E8F0",
          textDark: "#0F172A",
          textMedium: "#334155",
          textLight: "#64748B",
        },
      },
    },
  },
  plugins: [require("rippleui")],
  darkMode: 'class',
};
export default config;
