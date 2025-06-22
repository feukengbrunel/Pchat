import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeProvider'; // <-- Ajoute ceci
import 'jquery';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './assets/css/app.min.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);