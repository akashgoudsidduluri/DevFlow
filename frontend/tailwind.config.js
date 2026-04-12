/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
      },
      backgroundImage: {
        'mesh-gradient': "radial-gradient(at 0% 0%, hsla(221, 83%, 53%, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(199, 89%, 48%, 0.05) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
}
