import { useState, useRef, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import logo from "../assets/images/logo/logo.png";
import "../assets/css/app.min.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Avatar from "react-avatar";
export const Navbar = ({ onToggleSidebar, sidebarCollapsed, setSidebarCollapsed  }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
 
  const { logout, currentUser } = useAuth();
  // Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null); //  ligne pour éviter l'erreur si pas connecté
      }
    };
    fetchUserData();
  }, [currentUser]);
  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gestion des clics en dehors des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Deconexion reussi!");
      navigate("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="header bg-white dark:bg-gray-900">
      {/* Bouton toggle pour mobile */}
      {isMobile && (
        <button className="mobile-toggle btn " onClick={onToggleSidebar}>
          <i className="anticon anticon-menu"></i>
        </button>
      )}

      {/* Logo */}
      <div className="logo logo-dark d-none d-lg-flex align-items-center justify-content-center">
         <img
      src={logo}
      alt="Logo"
      style={{ height: "100px", width: "auto", objectFit: "contain" }} // adapte la taille
    />
      </div>

      <div className="nav-wrap">
       

        {/* Partie gauche - Barre de recherche */}
        <ul className="nav-left">
          <li className="search-bar-container ">
            <div className="input-affix m-b-6">
              <i className="prefix-icon anticon anticon-search"></i>
              <input
                type="text"
                className="form-control p-l-6 ml-1 text-grey"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="anticon anticon-close"></i>
                </button>
              )}
            </div>
          </li>
        </ul>

        {/* Partie droite - Icônes */}
        <ul className="nav-right">
          {/* Notifications Dropdown */}
          <li
            className="dropdown dropdown-animated scale-left"
            ref={notificationsRef}
          >
            <button
              className=" btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <i className="anticon anticon-bell " ></i>
              <span className="notification-count">3</span>
            </button>

            <div
              className={`dropdown-menu h-auto pop-notification ${showNotifications ? "show" : ""
                }`}
              style={{
                display: showNotifications ? "block" : "none",
                position: "absolute",

                right: 0,
                top: "100%",
                zIndex: 1000,
              }}
            >
              <div className="p-v-15 p-h-25 border-bottom d-flex justify-content-between align-items-center">
                <p className="text-dark font-weight-semibold m-b-0">
                  <i className="anticon anticon-bell"></i>
                  <div className="bg-white dark:bg-gray-900">
  
</div>
                  <span className="m-l-10">Notifications</span>
                </p>
                <button className="btn-sm btn-default btn">
                  <small>Voir tout</small>
                </button>
              </div>
              <div className="relative">
                <div
                  className="overflow-y-auto relative scrollable"
                  style={{ maxHeight: "300px" }}
                >
                  <a
                    href="#"
                    className="dropdown-item d-block p-15 border-bottom"
                  >
                    <div className="d-flex">
                      <div className="avatar avatar-blue avatar-icon">
                        <i className="anticon anticon-mail"></i>
                      </div>
                      <div className="m-l-15">
                        <p className="m-b-0 text-dark">
                          Vous avez un nouveau message
                        </p>
                        <p className="m-b-0">
                          <small>Il y a 8 min</small>
                        </p>
                      </div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="dropdown-item d-block p-15 border-bottom"
                  >
                    <div className="d-flex">
                      <div className="avatar avatar-cyan avatar-icon">
                        <i className="anticon anticon-user-add"></i>
                      </div>
                      <div className="m-l-15">
                        <p className="m-b-0 text-dark">
                          Nouvelle demande d'ami
                        </p>
                        <p className="m-b-0">
                          <small>Il y a 2 heures</small>
                        </p>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="dropdown-item d-block p-15">
                    <div className="d-flex">
                      <div className="avatar avatar-gold avatar-icon">
                        <i className="anticon anticon-like"></i>
                      </div>
                      <div className="m-l-15">
                        <p className="m-b-0 text-dark">3 nouvelles réactions</p>
                        <p className="m-b-0">
                          <small>Il y a 5 heures</small>
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </li>

          {/* Profile Dropdown */}
          <li
            className="dropdown dropdown-animated scale-left"
            ref={profileRef}
          >
            <button
              className="btn ml-4 p-0"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="avatar avatar-image m-h-10 m-r-15">
                {userData?.photoURL ? (
                  <img
                    src={userData?.photoURL || "/assets/images/avatars/thumb-3.jpg"}
                    alt="Avatar"
                    className="avatar-img rounded-circle"
                  />
                ) :
                  (
                    <Avatar
                      name={userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                      size="36"
                      round
                      className="border"
                    />
                  )}
              </div>
            </button>

            <div
              className={`dropdown-menu  pop-profile ${showProfileMenu ? "show" : ""
                }`}
              style={{
                display: showProfileMenu ? "block" : "none",
                position: "absolute",
                right: 0,
                top: "100%",
                zIndex: 1000,
              }}
            >
              <div className="ph-20 pb-15 m-b-10 border-bottom">
                <div className="d-flex mr-50">
                  <div className="avatar avatar-image mh-10 ">
                    {userData?.photoURL ? (
                      <img
                        src={userData?.photoURL || "/assets/images/avatars/thumb-3.jpg"}
                        alt="Avatar"
                        className="avatar-img rounded-circle"
                      />
                    ) :
                      (
                        <Avatar
                          name={userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                          size="36"
                          round
                          className="border"
                        />
                      )}
                  </div>
                  <div className="m-l-10">
                    <p className="m-b-0 text-dark font-weight-semibold">
                      {userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                    </p>
                    <p className="m-b-0 opacity-07">Développeur</p>
                  </div>
                </div>
              </div>
              <a href="/users/profil" className="dropdown-item d-block p-h-15 p-v-10">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <i className="anticon opacity-04 font-size-16 anticon-user"></i>
                    <span className="m-l-10">Mon profil</span>
                  </div>
                  <i className="anticon font-size-10 anticon-right"></i>
                </div>
              </a>
              <a href="#" className="dropdown-item d-block p-h-15 p-v-10">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <i className="anticon opacity-04 font-size-16 anticon-question"></i>
                    <span className="m-l-10">Aide</span>
                  </div>
                  <i className="anticon font-size-10 anticon-right"></i>
                </div>
              </a>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item d-block p-h-15 p-v-10"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <i className="anticon opacity-04 font-size-16 anticon-logout"></i>
                    <span className="m-l-10">Déconnexion</span>
                  </div>
                  <i className="anticon font-size-10 anticon-right"></i>
                </div>
              </button>
            </div>
          </li>
        </ul>
      </div>

      {/* CSS supplémentaire */}
      <style jsx>{`
        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          margin-right: 15px;
          cursor: pointer;
          color: #333;
        }
        .dropdown-menu{
          max-height:none !important;
          padding-left:0 !important;
        }
        .notification-badge {
          position: relative;
        }

        .notification-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4d4f;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-bar-container .form-control {
          border-radius: 50px !important;
          height: 48px;
          font-size: 1.15rem;
          padding-left: 44px;
          padding-right: 44px;
        }
        .search-bar-container .input-affix {
          position: relative;
        }
        .search-bar-container .prefix-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.3rem;
          color: #aaa;
          z-index: 2;
        }
        .search-bar-container .clear-search {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #888;
          font-size: 1.1rem;
          z-index: 2;
          cursor: pointer;
        }
         
    transition: max-height 0.3s ease;
}
        @media (max-width: 992px) {
          .mobile-toggle-btn {
            display: block;
          }

          .search-bar-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
