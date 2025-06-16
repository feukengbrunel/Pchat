import { Outlet } from "react-router-dom";
import { Sidebar } from "../layouts/SideBar";
import { Navbar } from "../layouts/NavBar";
import { useState } from "react";

const Users = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
return (
  <div>
     <div className="app bg-light min-vh-100">
          <div className="layout d-flex flex-column flex-md-row">
            <Sidebar
              isMobileOpen={isMobileOpen}
              onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
            />
            <div className="flex-grow-1 content-with-sidebar">
              <Navbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />
              <main className="page-container py-4">
                <div className=" main-content container">
                  
                     <Outlet />
                  
                </div>
              </main>
            </div>
          </div>
        </div>
  
  </div>
);
}
export default Users;