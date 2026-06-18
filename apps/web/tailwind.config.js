/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Futura Md BT Medium", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
