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
        "primary": "#005c65",
        "primary-container": "#007782",
        "on-primary": "#ffffff",
        "on-primary-container": "#c1f7ff",
        "primary-fixed": "#99f0fd",
        "primary-fixed-dim": "#7cd4e0",
        "on-primary-fixed": "#001f23",
        "on-primary-fixed-variant": "#004f56",
        "inverse-primary": "#7cd4e0",

        "secondary": "#1560a4",
        "secondary-container": "#7cb7ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00477e",
        "secondary-fixed": "#d3e4ff",
        "secondary-fixed-dim": "#a2c9ff",
        "on-secondary-fixed": "#001c38",
        "on-secondary-fixed-variant": "#004880",

        "tertiary": "#005d5d",
        "tertiary-container": "#007877",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#9ffdfc",
        "tertiary-fixed": "#94f2f1",
        "tertiary-fixed-dim": "#77d6d4",
        "on-tertiary-fixed": "#002020",
        "on-tertiary-fixed-variant": "#00504f",

        "surface": "#f7fafc",
        "surface-bright": "#f7fafc",
        "surface-dim": "#d7dadc",
        "surface-variant": "#e0e3e5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4f6",
        "surface-container": "#ebeef0",
        "surface-container-high": "#e5e9eb",
        "surface-container-highest": "#e0e3e5",
        "surface-tint": "#006972",
        "on-surface": "#181c1e",
        "on-surface-variant": "#3e494a",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eef1f3",

        "background": "#f7fafc",
        "on-background": "#181c1e",
        "outline": "#6e797b",
        "outline-variant": "#bdc8ca",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.25rem",
        "gutter": "1.25rem",
        "margin": "2rem"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        headline: ["Outfit", "Inter", "sans-serif"],
      }
    }
  },
  plugins: [],
}
