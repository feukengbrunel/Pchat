import React, { useState } from "react";
import { LegalModal, PrivacyModal } from "./Modals"; // Chemin vers vos modales

function Footer() {
  const [showLegal, setShowLegal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="py-3 bg-light border-top">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <span className="text-muted">© {new Date().getFullYear()} Echat</span>
            <div className="mt-2 mt-md-0">
              <button 
                onClick={() => setShowLegal(true)} 
                className=" btn btn-link text-decoration-none text-primary p-0 mx-2 border-none bg-white "
              >
                Legal
              </button>
              <button 
                onClick={() => setShowPrivacy(true)} 
                className=" btn btn-link text-decoration-none text-primary p-0 mx-2 border-none bg-white "
              >
                Privacy
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal show={showLegal} onHide={() => setShowLegal(false)} />
      <PrivacyModal show={showPrivacy} onHide={() => setShowPrivacy(false)} />
    </>
  );
}

export default Footer;