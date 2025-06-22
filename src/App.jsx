import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/login.jsx";
import { SignupPage } from "./pages/signup.jsx";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import HomePage from "./pages/homePage.jsx";

import Profil from "./pages/profil.jsx";
import Users from "./pages/users.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./assets/css/app.min.css";

import FavoritesPages from "./pages/favoris.jsx";
import Freind from "./pages/freind.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";

// ...le reste de vos imports...
function App() {
  // const location=useLocation();
  return (
    <ThemeProvider>
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
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
