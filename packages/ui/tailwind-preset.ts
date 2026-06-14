import type { Config } from 'tailwindcss'

/**
 * Shared Tailwind preset for the bill-splitting monorepo.
 *
 * Mirrors purbio-react-ui's theme: colors are driven by CSS custom properties
 * (RGB channel triplets) so the whole UI can be re-themed at runtime via
 * <ThemeProvider>, while Tailwind's `<alpha-value>` opacity modifiers
 * (e.g. `bg-primary-500/50`) keep working.
 *
 * Apps consume this as a preset and only declare their own `content` globs.
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`

const scale = (name: string) => ({
  50: withAlpha(`--color-${name}-50`),
  100: withAlpha(`--color-${name}-100`),
  200: withAlpha(`--color-${name}-200`),
  300: withAlpha(`--color-${name}-300`),
  400: withAlpha(`--color-${name}-400`),
  500: withAlpha(`--color-${name}-500`),
  600: withAlpha(`--color-${name}-600`),
  700: withAlpha(`--color-${name}-700`),
  800: withAlpha(`--color-${name}-800`),
  900: withAlpha(`--color-${name}-900`),
  950: withAlpha(`--color-${name}-950`),
  DEFAULT: withAlpha(`--color-${name}-500`),
})

const preset: Config = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        primary: scale('primary'),
        secondary: scale('secondary'),
        accent: scale('accent'),
        neutral: scale('neutral'),
        success: scale('success'),
        warning: scale('warning'),
        danger: scale('danger'),
        info: scale('info'),
        bg: withAlpha('--color-bg'),
        surface: withAlpha('--color-surface'),
        'surface-elevated': withAlpha('--color-surface-elevated'),
        border: withAlpha('--color-border'),
        ring: withAlpha('--color-ring'),
        fg: withAlpha('--color-fg'),
        'fg-muted': withAlpha('--color-fg-muted'),
        'fg-subtle': withAlpha('--color-fg-subtle'),
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        mono: 'var(--font-mono)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        none: '0px',
        xs: 'calc(var(--radius) * 0.5)',
        sm: 'calc(var(--radius) * 0.75)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.5)',
        xl: 'calc(var(--radius) * 2)',
        '2xl': 'calc(var(--radius) * 3)',
        '3xl': 'calc(var(--radius) * 4)',
        full: '9999px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        focus: '0 0 0 var(--ring-width) rgb(var(--color-ring) / var(--ring-opacity))',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'indeterminate-bar': {
          '0%': { left: '-40%', right: '100%' },
          '60%': { left: '100%', right: '-90%' },
          '100%': { left: '100%', right: '-90%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'scale-in': 'scale-in 150ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-up': 'slide-up 200ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-down': 'slide-down 200ms cubic-bezier(0.2, 0, 0, 1)',
        shimmer: 'shimmer 1.6s infinite',
        'indeterminate-bar': 'indeterminate-bar 1.4s cubic-bezier(0.65, 0.05, 0.36, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default preset
