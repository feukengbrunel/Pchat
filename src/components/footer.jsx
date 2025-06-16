import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="py-3 bg-light border-top">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <span className="text-muted">© {new Date().getFullYear()} Echat</span>
          <div className="mt-2 mt-md-0 ">
            <Link to="/legal" className="text-decoration-none me-3 mx-3">
              Legal
            </Link>
            <Link to="/privacy" className="text-decoration-none">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
