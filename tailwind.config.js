/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './admin/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090c',
          900: '#0b0e12',
          850: '#0f1318',
          800: '#141920',
          700: '#1c222b',
          600: '#272e39',
          500: '#3a4350',
        },
        fog: {
          50: '#eef1f4',
          100: '#dde2e8',
          200: '#c9d0d8',
          400: '#8b95a3',
          500: '#6b7583',
          600: '#525b67',
        },
        signal: {
          DEFAULT: '#c6f24e',
          soft: '#d9f78c',
          dim: '#8fb12f',
        },
        warn: '#f5b947',
        sky: '#6cc7ff',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'Geist Variable', 'system-ui', 'sans-serif'],
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      zIndex: {
        nav: '40',
        overlay: '50',
        drawer: '60',
        toast: '70',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        blink: 'blink 1.1s steps(1) infinite',
        ping2: 'ping2 1.8s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
}
