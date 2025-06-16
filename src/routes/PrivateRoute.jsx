import { useAuth } from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import {LoadingSpinner} from "../components/LoadingSniper";

/**
 * Route privée qui redirige vers la page de connexion si non authentifié
 */
export default function PrivateRoute({ children, roles = [] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  // Redirection si non connecté
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles si spécifiés
  if (roles.length > 0 && !roles.some(role => currentUser.roles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}