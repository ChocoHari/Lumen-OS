import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FCFBF8',
        accent: '#E8E0FF'
      },
      borderRadius: {
        xl2: '1.5rem',
        xl3: '2rem'
      }
    }
  },
  plugins: []
};

export default config;
