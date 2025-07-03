import React from 'react';

const GlobalStyles = () => (
  <style jsx global>{`
    :root {
      /* Ces variables seront remplacées dynamiquement par ThemeProvider */
      --primary: #4a6cf7;
      --secondary: #886cff;
      --success: #00c9a7;
      --danger: #de4436;
      --warning: #ffab00;
      --info: #16b1ff;
      --dark: #2a2a2a;
      --body: #f8f9fa;
      --bodyText: #212529;
      --cardBg: #ffffff;
      --cardBorder: #edf2f9;
      --cardShadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      --cardShadowHover: 0 6px 16px rgba(0, 0, 0, 0.1);
      --inputBg: #f8f9fa;
      --inputBorder: #e0e0e0;
      --inputPlaceholder: #adb5bd;
      --borderColor: #edf2f9;
      --textMuted: #6c757d;
      --textLight: #adb5bd;
      
      /* Espacement */
      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 16px;
      --space-lg: 24px;
      --space-xl: 32px;
      
      /* Rayons de bordure */
      --radius-sm: 4px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      
      /* Transitions */
      --transition-fast: 0.2s ease;
      --transition-normal: 0.3s ease;
      --transition-slow: 0.5s ease;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--font-body, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif);
      line-height: 1.5;
      transition: background-color var(--transition-normal), color var(--transition-normal);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif);
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: var(--space-md);
      color: var(--dark);
    }
    
    a {
      color: var(--primary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    
    a:hover {
      color: var(--secondary);
    }
    
    button {
      cursor: pointer;
      font-family: var(--font-body);
    }
    
    input, textarea, select {
      font-family: var(--font-body);
    }
    
    /* Classes utilitaires */
    .card {
      background-color: var(--cardBg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--cardBorder);
      box-shadow: var(--cardShadow);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: var(--cardShadowHover);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: all var(--transition-fast);
      border: none;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--secondary);
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid var(--borderColor);
      color: var(--bodyText);
    }
    
    .btn-outline:hover {
      background-color: var(--borderColor);
    }
    
    /* Responsive utilities */
    .d-none {
      display: none !important;
    }
    
    .d-flex {
      display: flex !important;
    }
    
    .align-items-center {
      align-items: center !important;
    }
    
    .justify-content-between {
      justify-content: space-between !important;
    }
    
    .justify-content-center {
      justify-content: center !important;
    }
    
    .text-center {
      text-align: center !important;
    }
    
    /* Media queries */
    @media (max-width: 576px) {
      .d-sm-none {
        display: none !important;
      }
      
      .d-sm-block {
        display: block !important;
      }
      
      .d-sm-flex {
        display: flex !important;
      }
    }
    
    @media (max-width: 768px) {
      .d-md-none {
        display: none !important;
      }
      
      .d-md-block {
        display: block !important;
      }
      
      .d-md-flex {
        display: flex !important;
      }
    }
    
    @media (max-width: 992px) {
      .d-lg-none {
        display: none !important;
      }
      
      .d-lg-block {
        display: block !important;
      }
      
      .d-lg-flex {
        display: flex !important;
      }
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .fade-in {
      animation: fadeIn var(--transition-normal);
    }
    
    .slide-up {
      animation: slideUp var(--transition-normal);
    }
  `}</style>
);

export default GlobalStyles;