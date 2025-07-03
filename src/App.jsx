import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import HomePage from "./pages/homePage.jsx";

import Profil from "./pages/profil.jsx";
import Users from "./pages/users.jsx";
import { useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import "react-toastify/dist/ReactToastify.css";
import "./assets/css/app.min.css";
import { LoginPage } from "./pages/login.jsx";
import { SignupPage } from "./pages/signup.jsx";
import FavoritesPages from "./pages/favoris.jsx";
import Freind from "./pages/freind.jsx";
import { useAuth } from './hooks/useAuth';
import NotificationService from './services/NotificationService';
import Messagerie from "./pages/messages.jsx";
import Notifications from "./pages/Notifications.jsx";

// ...le reste de vos imports...
function App() {
  // const location=useLocation();
   const { currentUser } = useAuth();
   useEffect(() => {
    if (currentUser) {
      // Initialiser le service de notification lorsque l'utilisateur est connecté
      NotificationService.init();
      
      // Écouter les notifications reçues
      NotificationService.onNotificationReceived((payload) => {
        console.log("Notification reçue dans App:", payload);
        // Vous pouvez mettre à jour l'interface utilisateur ici
      });
    }
  }, [currentUser]);
  
  return (
  
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          <Route
            path="/users/*"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          >

            <Route path="home" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/users/home" replace />} />
            <Route path="profil" element={<Profil />} />
            {/* <Route path="profil/:id" element={<Profil />} /> */}
            <Route path="favoris" element={<FavoritesPages />} />
            <Route path="freinds" element={<Freind />} />
            <Route path="messages" element={<Messagerie/>} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
  
  );
}

export default App;
