/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#171717',
        surfaceHover: '#262626',
        primary: '#fbbf24', // Amber 400
        primaryHover: '#f59e0b', // Amber 500
        secondary: '#a3a3a3',
        text: '#ededed',
        textMuted: '#a3a3a3',
        border: '#404040',
        success: '#10b981', // Emerald 500
        error: '#ef4444', // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
