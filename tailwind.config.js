/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './styles/**/*.{css,ts}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        navyDark: 'var(--navy-dark)',
        red: 'var(--red)',
        redDark: 'var(--red-dark)',
        white: 'var(--white)',
        offWhite: 'var(--off-white)',
        lightBlue: 'var(--light-blue)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)'
      },
      boxShadow: {
        hero: 'var(--shadow)',
        card: '0 14px 34px rgba(8, 47, 92, 0.07)',
        soft: '0 16px 38px rgba(8, 47, 92, 0.08)'
      },
      borderRadius: {
        xl2: '32px'
      }
    }
  },
  plugins: []
};
