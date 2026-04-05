/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Design System: 60-30-10 Rule ──
        // 60% neutral background
        surface: {
          DEFAULT: '#FAFBFC',
          dark: '#0B0F19',
          card: '#FFFFFF',
          'card-dark': '#1E293B',
        },
        // 30% navigation & structural
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#0EA5E9',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
        // 10% accent & action
        primary: {
          DEFAULT: '#0EA5E9',  // sky-blue
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        accent: {
          DEFAULT: '#10B981',  // emerald for positive CTAs
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        coral: {
          DEFAULT: '#F97316',  // attention-demanding highlights
          50: '#FFF7ED',
          500: '#F97316',
          600: '#EA580C',
        },
        // Semantic colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        muted: '#64748B',
        // Legacy compatibility
        secondary: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          500: '#FAFAFA',
          600: '#F5F5F5',
          700: '#E5E5E5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],
        'body': ['14px', { lineHeight: '20px' }],
        'heading': ['18px', { lineHeight: '24px' }],
        'title': ['28px', { lineHeight: '36px' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '17': '68px',   // collapsed sidebar
        '64': '256px',  // expanded sidebar
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'dropdown': '0 4px 12px rgba(0,0,0,0.1)',
        'modal': '0 12px 40px rgba(0,0,0,0.15)',
      },
      width: {
        'sidebar': '256px',
        'sidebar-collapsed': '68px',
        'drawer': '560px',
        'ai-drawer': '480px',
      },
      maxWidth: {
        'content': '1440px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
