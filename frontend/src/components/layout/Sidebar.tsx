import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Home,
  Wine,
  ShoppingCart,
  Package,
  FileText,
  Globe,
  Box,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import HelpMenu from "./HelpMenu";

interface SidebarProps {
  /** État du sidebar : ouvert (mobile) ou expanded (desktop) */
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleOpen: () => void;        // Pour mobile : ouvrir/fermer drawer
  onToggleCollapse: () => void;    // Pour desktop : collapse/expand
}

export default function Sidebar({ 
  isOpen, 
  isCollapsed, 
  onToggleOpen, 
  onToggleCollapse 
}: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { isAdmin } = useRoleAccess();
  const [orderCount, setOrderCount] = useState<number>(0);

  // Compteur de commandes en attente (admin seulement)
  useEffect(() => {
    if (!isAdmin) return;

    const updateOrderCount = () => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const pendingOrders = parsedOrders.filter(
          (order: any) => order.status === 'pending' || order.status === 'processed'
        );
        setOrderCount(pendingOrders.length);
      }
    };

    updateOrderCount();
    const interval = setInterval(updateOrderCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    if (window.innerWidth < 768) onToggleOpen(); // ferme le drawer mobile après logout
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      onToggleOpen();
    }
  };

  // Items de navigation communs
  const navItems = [
    { path: "/", label: "Tableau de bord", icon: Home },
    { path: "/catalogue", label: "Catalogue", icon: ShoppingCart },
  ];

  const adminNavItems = [
    { path: "/commandes", label: "Commandes", icon: Package, badge: orderCount > 0 ? orderCount : undefined },
    { path: "/cuvees", label: "Cuvées", icon: Wine },
    { path: "/factures", label: "Factures", icon: FileText },
    { path: "/partner-countries", label: "Pays partenaires", icon: Globe },
    { path: "/production", label: "Production", icon: Box },
  ];

  const NavButton = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink to={item.path} onClick={closeOnMobile}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full gap-3 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
          {item.badge && !isCollapsed && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              {item.badge}
            </Badge>
          )}
        </Button>
      </NavLink>
    );
  };

  // Contenu partagé du sidebar
  const sidebarContent = (
    <>
      {/* Header */}
      <div className={cn(
        "border-b border-border flex flex-col justify-center transition-all duration-300",
        isCollapsed ? "min-h-[80px] p-4" : "min-h-[80px] p-6"
      )}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <Wine className="h-10 w-10 text-wine" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Wine className="h-10 w-10 text-wine" />
              <h1 className="text-2xl font-bold">VinExpert</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gestion vinicole</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavButton key={item.path} item={item} />
        ))}

        {isAdmin && (
          <>
            <p className={cn(
              "text-xs font-semibold text-muted-foreground mt-6 mb-2 px-3",
              isCollapsed && "sr-only"
            )}>
              GESTION ADMINISTRATIVE
            </p>
            {adminNavItems.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
          </>
        )}

        {isAdmin && (
          <NavButton item={{ path: "/settings", label: "Paramètres", icon: Settings }} />
        )}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-border space-y-3 transition-all duration-300",
        isCollapsed ? "p-3" : "p-4"
      )}>
        {/* Aide */}
        <div className={cn(isCollapsed ? "flex justify-center" : "")}>
          {isCollapsed ? (
            <Button variant="ghost" size="icon" title="Aide">
              <HelpCircle className="h-5 w-5" />
            </Button>
          ) : (
            <HelpMenu />
          )}
        </div>

        {/* Déconnexion */}
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-red-600 hover:text-red-700 hover:bg-red-50",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          title={isCollapsed ? "Déconnexion" : undefined}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* ==================== VERSION DESKTOP ==================== */}
      <aside className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border fixed left-0 top-0 z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex flex-col h-full relative">
          {sidebarContent}

          {/* Bouton collapse (desktop) */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 -right-4 z-50 h-8 w-8 rounded-full shadow-md bg-card border-border hover:bg-accent"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* ==================== VERSION MOBILE (Drawer) ==================== */}
      <div className={cn(
        "fixed inset-0 z-50 md:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-300",
            isOpen ? "opacity-50" : "opacity-0"
          )}
          onClick={onToggleOpen}
        />

        {/* Panel latéral */}
        <aside className={cn(
          "absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-card shadow-2xl flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header mobile avec bouton fermer */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-3" onClick={closeOnMobile}>
              <Wine className="h-8 w-8 text-wine" />
              <h1 className="text-xl font-bold">VinExpert</h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={onToggleOpen}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col">
            {sidebarContent}
          </div>
        </aside>
      </div>

      {/* Bouton Hamburger (à placer dans ton Header/Navbar principal) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed left-4 top-4 z-50 bg-background/80 backdrop-blur rounded-lg shadow-md"
        onClick={onToggleOpen}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </>
  );
}