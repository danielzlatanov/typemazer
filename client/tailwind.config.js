/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        app_green: "#3adc94",
        app_purple: "#7e3ff2",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
