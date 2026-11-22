/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/content/**/*.{js,ts,jsx,tsx,md,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1', // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Figure / chart colors (consistent across all figures)
        fig: {
          blue:   '#3b82f6',
          red:    '#ef4444',
          green:  '#22c55e',
          orange: '#f97316',
          purple: '#a855f7',
          gray:   '#6b7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        bengali: ['"Noto Sans Bengali"', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate[700]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-links': theme('colors.brand[600]'),
            '--tw-prose-code': theme('colors.brand[700]'),
            maxWidth: 'none',
            lineHeight: '1.75',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
