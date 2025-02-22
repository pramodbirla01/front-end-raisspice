import type { Config } from "tailwindcss";

export default {
  // Remove darkMode config
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgColor: "#fcf9f3",
        lightBgColor: "#fff9f0",
        lightestBgColor: "#fffaf5",
        lightRed: "#942c23",
        darkRed: "#8b2821",
        darkestRed: "#7a231d",
        btnHover: "#111111",
        textHover: "#d4a05d",
        gold: {
          100: "#fff8e7",
          200: "#ffedc4",
          300: "#ffe2a1",
          400: "#ffd77e",
          500: "#d4a05d",
        },
        foreground: "var(--foreground)",
        navbar_bg: "var(--navbar_bg_color)",
        category_btn : "var(--category_box_bg_color)",
        premium: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        }
      },

      
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'wave': 'wave 2s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-in-out',
        'fade-out': 'fadeOut 1s ease-in-out',
        'scale-up': 'scaleUp 0.5s ease-out',
        'shine': 'shine 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wave-up': 'waveUp 1.5s ease-in-out infinite',
        'scroll-text': 'scrollText 2s ease-in-out infinite',
        'wave-vertical': 'waveVertical 3s ease-in-out infinite',
        'wave-vertical-delayed': 'waveVertical 3s ease-in-out infinite',
        'scroll-horizontal': 'scrollHorizontal 20s linear infinite',
        'color-pulse': 'colorPulse 2s ease-in-out infinite',
        'color-pulse-delayed': 'colorPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        waveUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scrollText: {
          '0%': { transform: 'translateX(-5%)' },
          '50%': { transform: 'translateX(5%)' },
          '100%': { transform: 'translateX(-5%)' },
        },
        waveVertical: {
          '0%, 100%': { transform: 'scaleY(1.0) translateY(-50%)' },
          '50%': { transform: 'scaleY(1.5) translateY(-30%)' },
        },
        scrollHorizontal: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        colorPulse: {
          '0%, 100%': { opacity: '1' },  // Changed from 1 to '1'
          '50%': { opacity: '0.7' },     // Changed from 0.7 to '0.7'
        },
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 8px 30px -2px rgba(0, 0, 0, 0.15)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255,255,255,0.06)',
        'premium-card': '0 0 0 2px rgba(255,255,255,0.1), 0 8px 20px -2px rgba(0, 0, 0, 0.2)',
        'premium-button': '0 2px 8px -2px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'premium-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'premium-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a18072' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'nav-gradient': 'linear-gradient(to right, #942c23, #d4a05d)',
      },
      backgroundSize: {
        'nav-animate': '200% 100%',
      },
    },
  },
  plugins: [],
} satisfies Config;
