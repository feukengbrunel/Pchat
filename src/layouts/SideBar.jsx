import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import classNames from "classnames";

export const Sidebar = ({ isMobileOpen, onToggleMobile }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    parametres: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  // Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Données des invitations
  const [lastRequest] = useState({
    id: 1,
    name: "Fidele Manatan",
    avatar: "/assets/images/avatars/thumb-1.jpg",
    mutualFriends: 1,
    timestamp: "Il y a 2 heures",
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie !");
      navigate("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Erreur de déconnexion, veuillez réessayer.");
    }
  };

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleAccept = () => toast.success("Demande d'amitié acceptée");
  const handleDecline = () => toast.info("Demande d'amitié refusée");

  // Vérification de l'élément actif
  const isActive = (path) => {
    if (path === "/users") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && (
        <div
          className={classNames("sidebar-overlay", { show: isMobileOpen })}
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar principale */}
      <div className={classNames("side-nav", { "mobile-open": isMobileOpen })}>
        <div className="side-nav-inner">
          {/* Profil utilisateur en haut */}
          <div className="user-profile-sidebar p-4 text-center">
            <div className="avatar avatar-lg mb-3">
              <img
                src={userData?.photoURL || "/assets/images/avatars/thumb-3.jpg"}
                alt="Avatar"
                className="avatar-img rounded-circle"
              />
            </div>
            <h6 className="mb-1">
              {userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
            </h6>
            <small className="text-muted mb-0">
              {userData?.email || currentUser?.email}
            </small>
          </div>

          <div className="side-nav-content">
            <ul className="side-nav-menu scrollable">
              {/* Accueil */}
              <li className={`nav-item ${isActive("/users") ? "open active" : ""}`}>
                <Link
                  to="/users/home"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-home"></i>
                  </span>
                  <span className="title">Accueil</span>
                </Link>
              </li>

              {/* Profil */}
              <li className={`nav-item ${isActive("/users/profil") ? "open active" : ""}`}>
                <Link
                  to="/users/profil"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-user"></i>
                  </span>
                  <span className="title">Profil</span>
                </Link>
              </li>

              {/* Message */}
              <li className={`nav-item ${isActive("/users/messages") ? "open active" : ""}`}>
                <Link
                  to="/users/messages"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-message"></i>
                  </span>
                  <span className="title">Messages</span>
                </Link>
              </li>

              {/* Favoris */}
              <li className={`nav-item ${isActive("/users/favoris") ? "open active" : ""}`}>
                <Link
                  to="/users/favoris"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-star"></i>
                  </span>
                  <span className="title">Favoris</span>
                </Link>
              </li>

              {/* Notifications */}
              <li className={`nav-item ${isActive("/users/notifications") ? "open active" : ""}`}>
                <Link
                  to="/users/notifications"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-bell"></i>
                  </span>
                  <span className="title">Notifications</span>
                  <span className="badge badge-danger float-right">3</span>
                </Link>
              </li>
              {/* Amis */}
              <li className={`nav-item ${isActive("/users/freinds") ? "open active" : ""}`}>
                <Link
                  to="/users/freinds"
                  className="dropdown-toggle"
                  onClick={() => isMobile && onToggleMobile()}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-usergroup-add"></i>
                  </span>
                  <span className="title">Amis</span>
                  <span className="badge badge-success float-right">5</span>
                </Link>
              </li>
              {/* Paramètres */}
              <li className={`nav-item dropdown ${expandedMenus.parametres ? "open" : ""}`}>
                <a
                  className="dropdown-toggle"
                  onClick={() => toggleMenu("parametres")}
                >
                  <span className="icon-holder">
                    <i className="anticon anticon-setting"></i>
                  </span>
                  <span className="title">Paramètres</span>
                  <span className="arrow">
                    <i className="arrow-icon"></i>
                  </span>
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/users/parametres/compte" className="nav-link">
                      Compte
                    </Link>
                  </li>
                  <li>
                    <Link to="/users/parametres/confidentialite" className="nav-link">
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link to="/users/parametres/theme" className="nav-link">
                      Thème
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Section invitations */}
              <div className="friend-requests-container mt-3 px-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body py-3 px-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="card-title m-0 font-weight-bold" style={{ fontSize: "1rem" }}>
                        Invitations
                      </h6>
                      <Link to="/users/invitations" className="text-primary small">
                        Voir tout
                      </Link>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar avatar-sm avatar-image mr-2">
                        <img
                          src={lastRequest.avatar}
                          alt="Friend"
                          style={{ width: 36, height: 36, borderRadius: "50%" }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="font-weight-semibold" style={{ fontSize: "0.95rem" }}>
                          {lastRequest.name}
                        </div>
                        <small className="text-muted">
                          {lastRequest.mutualFriends} ami en commun
                        </small>
                      </div>
                    </div>
                    <div className="d-flex">
                      <button
                        className="btn btn-primary btn-xs flex-fill mr-1"
                        style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                        onClick={handleAccept}
                      >
                        Confirmer
                      </button>
                      <button
                        className="btn btn-light btn-xs flex-fill"
                        style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                        onClick={handleDecline}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ul>
          </div>

          {/* Bouton de déconnexion */}
          <div className="px-3 py-4">
            <button
              className="btn btn-outline-danger btn-sm w-100"
              onClick={handleLogout}
            >
              <i className="anticon anticon-logout mr-2"></i> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        .side-nav {
          position: fixed;
          left: 0;
          height: 100vh;
          width: 280px;
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .sidebar-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        
        .side-nav-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .side-nav-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .side-nav-menu.scrollable {
          overflow-y: auto;
          flex: 1;
          padding-bottom: 20px;
        }
        
        /* Style personnalisé pour la scrollbar */
        .side-nav-menu.scrollable::-webkit-scrollbar {
          width: 6px;
        }
        
        .side-nav-menu.scrollable::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .side-nav-menu.scrollable::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .side-nav-menu.scrollable::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .user-profile-sidebar {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .avatar-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .nav-item {
          position: relative;
        }
        
        .nav-item.open > .dropdown-toggle {
          color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .nav-item.active > .dropdown-toggle {
          font-weight: 500;
        }
        
        .dropdown-toggle {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: #495057;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .dropdown-toggle:hover {
          color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }
        
        .icon-holder {
          margin-right: 1rem;
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
          color: #6c757d;
        }
        
        .nav-item.open .icon-holder,
        .nav-item.active .icon-holder {
          color: #007bff;
        }
        
        .title {
          flex: 1;
        }
        
        .dropdown-menu {
          list-style: none;
          padding-left: 2.5rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .nav-item.dropdown.open .dropdown-menu {
          max-height: 200px;
        }
        
        .dropdown-menu .nav-link {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          color: #495057;
        }
        
        .dropdown-menu .nav-link:hover {
          color: #007bff;
        }
        
        .friend-requests-container {
          margin-top: auto;
        }
        
        @media (max-width: 992px) {
          .side-nav {
            transform: translateX(-100%);
          }
          
          .side-nav.mobile-open {
            transform: translateX(0);
            box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
    </>
  );
};