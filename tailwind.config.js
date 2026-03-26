/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "error-container": "#ffdad6",
        "inverse-primary": "#c6c6c6",
        "surface-tint": "#5e5e5e",
        "surface-container-highest": "#e2e2e2",
        "secondary-container": "#d6d4d3",
        "surface-variant": "#e2e2e2",
        "inverse-surface": "#2f3131",
        "surface-container": "#eeeeee",
        "error": "#ba1a1a",
        "surface-dim": "#dadada",
        "secondary-fixed-dim": "#adabaa",
        "on-secondary-fixed": "#1b1c1c",
        "on-background": "#1a1c1c",
        "on-surface-variant": "#474747",
        "surface": "#f9f9f9",
        "on-primary": "#e2e2e2",
        "primary": "#000000",
        "on-primary-container": "#ffffff",
        "on-secondary": "#ffffff",
        "background": "#f9f9f9",
        "secondary-fixed": "#c8c6c5",
        "on-tertiary": "#e4e2e1",
        "secondary": "#5f5e5e",
        "outline-variant": "#c6c6c6",
        "primary-container": "#3b3b3b",
        "surface-container-low": "#f3f3f4",
        "surface-bright": "#f9f9f9",
        "primary-fixed": "#5e5e5e",
        "tertiary-fixed-dim": "#474747",
        "on-error-container": "#410002",
        "on-primary-fixed": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed-variant": "#e2e2e2",
        "tertiary": "#3b3b3b",
        "on-tertiary-container": "#ffffff",
        "primary-fixed-dim": "#474747",
        "on-error": "#ffffff",
        "on-tertiary-fixed": "#ffffff",
        "on-surface": "#1a1c1c",
        "tertiary-container": "#757474",
        "on-secondary-fixed-variant": "#3c3b3b",
        "on-tertiary-fixed-variant": "#e4e2e1",
        "surface-container-high": "#e8e8e8",
        "outline": "#777777",
        "on-secondary-container": "#1b1c1c",
        "tertiary-fixed": "#5f5e5e",
        "inverse-on-surface": "#f0f1f1"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in-up-delay-1": "fade-in-up 0.6s ease-out 0.2s forwards",
        "fade-in-up-delay-2": "fade-in-up 0.6s ease-out 0.4s forwards",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
