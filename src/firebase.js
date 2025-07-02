// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, off, push, serverTimestamp } from "firebase/database";

export { ref, onValue, off, push, serverTimestamp };
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Dans firebase.js
import { setPersistence, browserLocalPersistence } from "firebase/auth";

// Après l'initialisation

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1X0HXDNcuCoBvAfkvJ8k01W4KOMdOL1w",
  authDomain: "chat-59eb8.firebaseapp.com",
  projectId: "chat-59eb8",
  storageBucket: "chat-59eb8.firebasestorage.app",
  messagingSenderId: "476007444986",
  appId: "1:476007444986:web:7993b78dc4a49af7f5b443",
  measurementId: "G-281X7SVTD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
