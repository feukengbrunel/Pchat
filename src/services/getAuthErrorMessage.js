export function getAuthErrorMessage(error) {
  if (!error) return "Une erreur inconnue est survenue.";

  // Firebase v9+ : error.code
  const code = error.code || error.message || error;

  switch (code) {
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cet email.";
    case "auth/wrong-password":
      return "Mot de passe incorrect.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/email-already-in-use":
      return "Cet email est déjà utilisé.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible (au moins 6 caractères).";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessayez plus tard.";
    case "auth/network-request-failed":
      return "Problème de connexion réseau.";
    case "auth/popup-closed-by-user":
      return "La fenêtre d’authentification a été fermée.";
    case "auth/popup-blocked":
      return "La fenêtre d’authentification a été bloquée.";
    case "auth/account-exists-with-different-credential":
      return "Un compte existe déjà avec cet email via un autre fournisseur.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
}