/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: "#E6ECF5",
          100: "#C2D1E8",
          200: "#95B0D8",
          300: "#648BC5",
          400: "#3E6AB3",
          500: "#1D4FA0",
          600: "#143E82",
          700: "#0D2E63",
          800: "#0A1628",
          900: "#060E18",
          950: "#03070C",
        },
        alert: {
          red: "#FF4D4F",
          orange: "#FA8C16",
          green: "#52C41A",
          blue: "#1890FF",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(24, 144, 255, 0.25)",
        "glow-red": "0 0 20px rgba(255, 77, 79, 0.35)",
        "glow-orange": "0 0 20px rgba(250, 140, 22, 0.3)",
        "glow-green": "0 0 20px rgba(82, 196, 26, 0.3)",
        card: "0 4px 20px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float-up": "floatUp 0.5s ease-out forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
