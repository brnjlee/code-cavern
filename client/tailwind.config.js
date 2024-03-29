/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "3xl": "0px 15px 33px -4px rgba(0,0,0,0.5)",
      },
      fontSize: {
        "2xs": "0.7rem",
      },
      width: {
        150: "17rem",
      },
      backgroundColor: {
        "gray-150": "rgb(229 231 235)",
      },
      transitionDelay: {
        0: "0ms",
        100: "100ms",
      },
    },
  },
  plugins: [],
  important: true,
};
