// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import 'jquery';

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './assets/css/app.min.css';

// Trouvez l'élément racine de votre application
const container = document.getElementById('root');

// Créez une racine
const root = createRoot(container);

// Rendu de l'application
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);