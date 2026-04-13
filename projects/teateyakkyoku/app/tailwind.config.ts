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
        // てあて薬局 カラーパレット
        forest: {
          DEFAULT: "#2C4A3E",
          dark: "#1E3830",
          mid: "#3D5F52",
          light: "#6B9E8F",
          pale: "#A8C5BB",
        },
        terra: {
          DEFAULT: "#E8956D",
          light: "#FFF0E8",
        },
        cream: {
          DEFAULT: "#FDF8F2",
          warm: "#F0EDE8",
          muted: "#E8E0D5",
        },
      },
      fontFamily: {
        sans: ["Inter", "Hiragino Sans", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
