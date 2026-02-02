/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'launcher-bg': '#0a0e1a',
        'launcher-card': '#151a2b',
        'launcher-accent': '#4a90e2',
        'launcher-text': '#e0e0e0',
      },
    },
  },
  plugins: [],
}
