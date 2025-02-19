/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'ayllus-primary': '#7406A7',
        'ayllus-secondary': '#FF7C2C',
        'ayllus-text': '#3E3D5D',
        'ayllus-title': '#0E0D35'
      }
    }
  },
  plugins: [
    require('tailwindcss-animated')
  ]
}
