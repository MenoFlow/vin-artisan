import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";
import {cn} from "../../lib/utils";

const Layout = () => {
  // État pour le drawer mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // État pour le collapse desktop (réduit ou non)
  const [collapsed, setCollapsed] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar : gère à la fois mobile et desktop */}
      <Sidebar
        isOpen={mobileOpen}
        isCollapsed={collapsed}
        onToggleOpen={toggleMobile}
        onToggleCollapse={toggleCollapse}
      />

      {/* Contenu principal */}
      <div className={cn(
        "flex flex-col flex-1 overflow-hidden transition-all duration-300",
        // Sur desktop : on décale le contenu quand le sidebar est visible
        collapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Header avec bouton hamburger visible seulement sur mobile */}
        <Header onMenuClick={toggleMobile} />

        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="p-4 md:p-6">
            <Breadcrumb />
            <div className="mt-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;