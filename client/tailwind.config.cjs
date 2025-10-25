module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
        ],
      },
      colors: {
        ios: {
          50: "#f7fbff",
          100: "#eef6ff",
          200: "#d7ecff",
          500: "#0a84ff",
        },
      },
      boxShadow: {
        "ios-soft":
          "0 6px 20px rgba(10, 10, 10, 0.08), 0 2px 6px rgba(10, 10, 10, 0.04)",
      },
    },
  },
  plugins: [],
};
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
