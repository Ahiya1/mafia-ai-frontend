/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "detective-blue": {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#3b82f6",
        },
        "detective-orange": {
          DEFAULT: "#f97316",
          dark: "#ea580c",
          light: "#fb923c",
        },
        "noir-gray": {
          900: "#111111",
          800: "#1f1f1f",
          700: "#2a2a2a",
          600: "#404040",
          500: "#737373",
          400: "#a3a3a3",
          300: "#d4d4d4",
        },
        "mafia-red": "#dc2626",
        "citizen-blue": "#2563eb",
        "healer-green": "#16a34a",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "bounce-in": "bounceIn 0.8s ease-out",
        "glow-pulse": "glowPulse 2s infinite",
        "ring-pulse": "ring-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "loading-pulse": "loading-pulse 1.4s ease-in-out infinite both",
        floating: "floating 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glowPulse: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.2)" },
        },
        "ring-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(249, 115, 22, 0.7)" },
          "70%": { boxShadow: "0 0 0 6px rgba(249, 115, 22, 0)" },
        },
        "loading-pulse": {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.5" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        floating: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        detective: "0 10px 25px -3px rgba(59, 130, 246, 0.1)",
        "detective-lg": "0 20px 40px -6px rgba(59, 130, 246, 0.2)",
      },
    },
  },
  plugins: [],
};
