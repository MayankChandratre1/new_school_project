/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': {'min': '1800px'},
      },
      // ...rest of your existing theme config
    },
  },
  plugins: [
    // ...your plugins
  ],
}
