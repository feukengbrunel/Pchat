export default {
  darkMode: 'class', // ou 'media' si tu veux détecter automatiquement
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    // Ajoute d'autres chemins si besoin
  ],
  theme: {
    extend: {
       colors: {
        // Couleurs spécifiques au mode sombre
        dark: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
    },
  },
  plugins: [],
}