/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1120px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          100: 'hsl(142 55% 93%)',
          500: 'hsl(142 72% 29%)',
          700: 'hsl(142 76% 21%)',
        },
        warning: {
          100: 'hsl(33 90% 93%)',
          500: 'hsl(26 91% 37%)',
          700: 'hsl(26 88% 29%)',
        },
        danger: {
          100: 'hsl(4 70% 94%)',
          500: 'hsl(4 76% 40%)',
          700: 'hsl(4 78% 31%)',
        },
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        score: ['3.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        card: '0 2px 8px rgba(10,22,32,0.06)',
        overlay: '0 12px 32px rgba(10,22,32,0.10)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
