/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eefcf6",
          100: "#d6f7e8",
          200: "#aeeed3",
          300: "#78e0b8",
          400: "#3fc998",
          500: "#1aab7c",
          600: "#118a64",
          700: "#116e53",
          800: "#125844",
          900: "#0f4839",
        },
        ink: {
          900: "#0e1b1a",
          700: "#2c3e3b",
          500: "#5b6f6b",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
