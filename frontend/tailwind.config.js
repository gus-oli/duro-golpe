const path = require('path')

const contentRoot = path.join(__dirname, 'src/**/*.{ts,tsx}').replace(/\\/g, '/')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [contentRoot],
  theme: {
    extend: {
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}
