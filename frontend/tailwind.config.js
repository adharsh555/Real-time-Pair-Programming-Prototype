/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-main': '#0f172a',
                'bg-secondary': '#1e293b',
                'bg-tertiary': '#334155',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
                'accent-primary': '#6366f1',
                'accent-hover': '#818cf8',
                'border-color': 'rgba(255, 255, 255, 0.1)',
                'border-focus': 'rgba(99, 102, 241, 0.5)',
            }
        },
    },
    plugins: [],
}
