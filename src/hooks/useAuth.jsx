import { useState, useEffect, useContext, createContext } from "react";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Création du contexte d'authentification
const AuthContext = createContext();

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * @returns {Object} Contexte d'authentification
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Provider d'authentification qui englobe l'application
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Composants enfants
 * @returns {ReactNode} Composant Provider
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialisation des fournisseurs d'authentification
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  // Configuration de la persistance de session
  useEffect(() => {
    const configureAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
        return unsubscribe;
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    const unsubscribe = configureAuth();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Connexion avec email/mot de passe
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<UserCredential>} Résultat de la connexion
   */
  const login = async (email, password) => {
    try {
      
      return await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion avec Google
   * @returns {Promise<UserCredential>} Résultat de la connexion
   */
  const loginWithGoogle = async () => {
    try {
 
      return await signInWithPopup(auth, googleProvider);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion avec Facebook
   * @returns {Promise<UserCredential>} Résultat de la connexion
   */
  const loginWithFacebook = async () => {
    try {
      setLoading(true);
      return await signInWithPopup(auth, facebookProvider);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
     
     return await signOut(auth);
    } finally {
      setLoading(false);
    }
  };
const signUpWithEmail = async (email, password, username) => {
  try {
 
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Enregistrez les infos supplémentaires dans Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      username,
      email,
      uid: userCredential.user.uid,
      createdAt: serverTimestamp(),
      profileComplete: false
    });
    
    return userCredential;
  }  finally {
    setLoading(false);
  }
};
const handleGoogleSignup = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user=userCredential.user;
    const userDoc = doc(db, "users", user.uid)
    // Vérifiez si l'utilisateur existe déjà dans Firestore
    const userSnapshot = await getDoc(userDoc);
    if (!userSnapshot.exists()) {
      // Si l'utilisateur n'existe pas, créez un nouveau document
      await setDoc(userDoc, {
        username: user.displayName || "Utilisateur Google",
        email: user.email,
        uid: userCredential.user.uid,
        createdAt: serverTimestamp(),
        profileComplete: false
      });
    }
    return userCredential;
 
};
  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    signUpWithEmail,
    handleGoogleSignup
  };

  // Affiche un loader pendant le chargement initial
 if (loading) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <ClipLoader color="#007bff" size={50} />
    </div>
  );
}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}