/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontSize: {
        xxs: ".5rem",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
