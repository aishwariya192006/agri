/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Cinzel', 'serif'],
      },
      colors: {
        royal: {
          bg:      '#0A0612',
          sec:     '#110A1F',
          ter:     '#1A1030',
          purple:  '#7B2FBE',
          gold:    '#C4A35A',
          bright:  '#E8C96D',
          text:    '#F5F0FF',
          muted:   '#B8A9D9',
          dim:     '#7B6FA0',
        },
      },
      boxShadow: {
        'gold':    '0 0 20px rgba(196,163,90,0.35)',
        'gold-lg': '0 0 40px rgba(196,163,90,0.5)',
        'purple':  '0 8px 40px rgba(123,47,190,0.3)',
        'card':    '0 8px 40px rgba(123,47,190,0.2)',
      },
    },
  },
  plugins: [],
}
