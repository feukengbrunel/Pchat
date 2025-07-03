import { Outlet } from "react-router-dom";
import { Sidebar } from "../layouts/SideBar";
import { Navbar } from "../layouts/NavBar";
import { useState } from "react";

const Users = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div>
      <div className="app ">
        <div className="layout ">
          <Navbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} 
            
            />
          <Sidebar
            isMobileOpen={isMobileOpen}
            onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
            collapsed={sidebarCollapsed}
          />
            <main className="page-container">
              <div className=" main-content ">

                <Outlet />

              </div>
            </main>
         
        </div>
      </div>

    </div>
  );
}
export default Users;