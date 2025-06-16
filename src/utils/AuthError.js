/**
 * Traduit les erreurs Firebase en messages utilisateur
 * @param {Error} error - Erreur Firebase
 * @returns {string} Message d'erreur lisible
 */
export const handleAuthError = (error) => {
  const errorMap = {
    // Erreurs email/mot de passe
    'auth/invalid-email': 'Email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Compte temporairement bloqué',
    
    // Erreurs réseaux
    'auth/network-request-failed': 'Problème de connexion réseau',
    
    // Erreurs providers
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
    'auth/popup-blocked': 'Veuillez autoriser les popups pour ce site',
    'auth/cancelled-popup-request': 'Connexion annulée',
    'auth/unauthorized-domain': 'Domaine non autorisé',
    
    // Erreurs générales
    'default': 'Erreur de connexion. Veuillez réessayer'
  };

    if (!error) return errorMap.default;
  
  // Gestion améliorée des erreurs
  const code = error.code || (error.message && error.message.split('/')[1]);
  return errorMap[code] || error.message || errorMap.default;
};

// Ajoutez cette fonction pour logger les erreurs en développement
export const logAuthError = (error) => {
 
    console.error('Auth Error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  
};
export const getAuthErrorMessage = (error) => {
  const errorMap = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/account-exists-with-different-credential': 'Account already exists with different method',
    'auth/popup-closed-by-user': 'Sign in cancelled',
    'default': 'An error occurred. Please try again'
  };

  return errorMap[error.code] || error.message || errorMap.default;
};