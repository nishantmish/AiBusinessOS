/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        'bg': 'var(--color-bg)',
        'text': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'border': 'var(--color-border)',
        'border-2': 'var(--color-border-2)',
        'primary': 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
        'info': 'var(--color-info)',
      },
      fontSize: {
        'xs': ['10px', '1.2'],
        'sm': ['11px', '1.3'],
        'base': ['14px', '1.5'],
        'lg': ['15px', '1.6'],
        'xl': ['18px', '1.7'],
        '2xl': ['24px', '1.8'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
