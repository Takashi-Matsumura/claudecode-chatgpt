import type { Config } from "tailwindcss"

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neutral-50': '#f9fafb',
        'neutral-100': '#f3f4f6',
        'neutral-200': '#e5e7eb',
        'neutral-300': '#d1d5db',
        'neutral-400': '#9ca3af',
        'neutral-500': '#6b7280',
        'neutral-600': '#4b5563',
        'neutral-700': '#374151',
        'neutral-800': '#1f2937',
        'neutral-900': '#111827',
        'green-500': '#22c55e'
      }
    },
  },
  plugins: [],
} satisfies Config

export default config