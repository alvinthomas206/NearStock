/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          navy: "#0B2A4A",
          navyDark: "#061A2E",
          teal: "#1F9D8C",
          tealLight: "#E8F7F5",
          tealHover: "#198274",
          bg: "#F5F9FC",
          card: "#FFFFFF",
          muted: "#64748B",
          border: "#E2E8F0"
        },
        primary: {
          DEFAULT: "#0B2A4A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1F9D8C",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#1F9D8C",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "20px",
        '2xl': "24px",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(11, 42, 74, 0.06), 0 2px 6px -1px rgba(11, 42, 74, 0.04)',
        card: '0 10px 30px -5px rgba(11, 42, 74, 0.08), 0 4px 10px -2px rgba(11, 42, 74, 0.03)',
        glass: '0 8px 32px 0 rgba(11, 42, 74, 0.1)',
        phone: '0 25px 50px -12px rgba(11, 42, 74, 0.25)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
}
