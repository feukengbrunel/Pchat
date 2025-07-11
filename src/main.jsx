import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import '@popperjs/core'; // 
import 'jquery';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './assets/css/app.min.css';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
    
        <App />
    
    </AuthProvider>
  </React.StrictMode>
);