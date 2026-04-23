import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [
    "./components/**/*.{vue,js,ts}",
    "./composables/**/*.{js,ts}",
    "./pages/**/*.vue",
    "./app.vue"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f6ff",
          500: "#5b7cfa",
          600: "#4865db"
        }
      }
    }
  },
  plugins: []
};
