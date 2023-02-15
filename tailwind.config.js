/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "scale-width": "scale-width 0.75s cubic-bezier(0.95, 0.05, 0.8, 0.04)",
        ...defaultTheme.animation,
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        ...defaultTheme.fontFamily,
      },
      colors: {
        light: {
          100: "#fffcfb",
          200: "#ffffff",
        },
        dark: {
          100: "#979bb0",
          150: "#25283a",
          200: "#1a1926",
          300: "#16141c",
        },
        highlight: {
          pink: "#e53265",
          purple: "#8838ff",
          cyan: "#2fd6b5",
        },
        star: "#FDCC0D",
        ...colors,
      },
      screens: {
        exs: "320px",
        "2exs": "360px",
        xs: "480px",
        "1xs": "520px",
        "1.5xs": "540px",
        "2xs": "560px",
        "3xs": "580px",
        esm: "600px",
        "2esm": "620px",
        "2md": "896px",
        "2lg": "1152px",
        "3xl": "1664px",
        "4xl": "1792px",
        "5xl": "1853px",
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [],
};
