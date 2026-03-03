import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import animate from 'tailwindcss-animate'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          primary:      '#3B5BFF',
          primaryHover: '#2D4AE0',
          primaryLight: '#EEF1FF',
          secondary:    '#1A1A2E',
        },
      },
    },
  },
  plugins: [forms, animate],
} satisfies Config
