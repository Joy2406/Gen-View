import postcss from "postcss";

const config = {
  plugins: ["@tailwindcss/postcss"],
};

module.exports = {
  plugins: {
    "@tailwindcss/postcss" : {},
    autoprefixer: {},
  },
}


export default config;
