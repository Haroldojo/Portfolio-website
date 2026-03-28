/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a",
                secondary: "#1a1a1a",
                accent: "#f7df1e",
                card: "#141414",
                border: "#2a2a2a",
                textPrimary: "#ffffff",
                textSecondary: "#a0a0a0",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(247, 223, 30, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(247, 223, 30, 0.6)' },
                }
            }
        },
    },
    plugins: [],
}
