/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0c0c0c",
          900: "#121212",
          850: "#161616"
        },
        signal: {
          good: "#d4af37",
          accent: "#d4af37",
          bad: "#a3a3a3",
          warn: "#d4af37",
          cyan: "#d4af37"
        }
      },
      boxShadow: {
        glow: "0 22px 80px rgba(212, 175, 55, 0.16)"
      },
      animation: {
        "pulse-slow": "pulse 2.8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        slideup: "slideup 0.55s ease-out both"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        slideup: {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0px)" }
        }
      }
    }
  },
  plugins: []
};
