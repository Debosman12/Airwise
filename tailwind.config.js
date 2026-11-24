/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10b981",         // Emerald-500
          satisfactory: "#84cc16", // Lime-500
          moderate: "#f59e0b",     // Amber-500
          poor: "#f97316",         // Orange-500
          veryPoor: "#ef4444",     // Red-500
          severe: "#7f1d1d",       // Deep Red-900 / Maroon
          hazardous: "#581c87"     // Purple-900
        }
      }
    },
  },
  plugins: [],
}
