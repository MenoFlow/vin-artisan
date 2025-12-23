
import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Box,
  FileText,
  Home,
  Users,
  Wine,
  ShoppingCart,
  Settings,
  LogOut,
  Package,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import HelpMenu from "./HelpMenu";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
}

export default function Sidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin } = useRoleAccess();
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) {
      // Récupérer le nombre de commandes en attente pour les administrateurs
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
      
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(updateOrderCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
  };

  const NavItem = ({
    href,
    label,
    icon,
    active = false,
    badge,
  }: NavItemProps) => {
    return (
      <NavLink
        to={href}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-all",
            isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
            state === "expanded" ? "" : "justify-center"
          )
        }
      >
        {icon}
        {state === "expanded" && (
          <>
            <span className="flex-1">{label}</span>
            {badge && badge}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar-background text-sidebar-foreground h-screen relative transition-all duration-300 ease-in-out",
        state === "expanded" ? "w-64" : "w-16"
      )}
    >
      <div className="p-3">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 mb-3 px-3 py-2",
            state === "expanded" ? "" : "justify-center"
          )}
        >
          <Wine className="h-5 w-5 text-wine" />
          {state === "expanded" && <span className="font-bold text-lg">VinExpert</span>}
        </Link>
        <h3
          className={cn(
            "text-xs font-semibold text-muted-foreground ml-3 mb-1",
            state === "expanded" ? "" : "sr-only"
          )}
        >
          MENU
        </h3>
        <nav className="grid gap-1 px-2">
          <NavItem
            href="/"
            label="Tableau de bord"
            icon={<Home className="h-5 w-5" />}
          />
          <NavItem
            href="/catalogue"
            label="Catalogue"
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          {isAdmin && (
            <>
              <h3
                className={cn(
                  "text-xs font-semibold text-muted-foreground ml-1 mt-4 mb-1",
                  state === "expanded" ? "" : "sr-only"
                )}
              >
                GESTION ADMINISTRATIVE
              </h3>
              <NavItem
                href="/commandes"
                label="Commandes"
                icon={<Package className="h-5 w-5" />}
                badge={orderCount > 0 && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    {orderCount}
                  </Badge>
                )}
              />
              <NavItem
                href="/cuvees"
                label="Cuvées"
                icon={<Wine className="h-5 w-5" />}
              />
              <NavItem
                href="/factures"
                label="Factures"
                icon={<FileText className="h-5 w-5" />}
              />
              <NavItem
                href="/partner-countries"
                label="Pays partenaires"
                icon={<Globe className="h-5 w-5" />}
              />
              <NavItem
                href="/production"
                label="Production"
                icon={<Box className="h-5 w-5" />}
              />
            </>
          )}
        </nav>
      </div>

      <div className="mt-auto p-3">
        {state === "expanded" ? (
          <div className="mb-4">
            <HelpMenu />
          </div>
        ) : (
          <NavLink
            to="#"
            className="flex justify-center items-center rounded-lg p-2 mb-4 hover:bg-accent transition-all"
            onClick={(e) => {
              e.preventDefault();
              toggleSidebar();
            }}
          >
            <HelpCircle className="h-5 w-5" />
          </NavLink>
        )}
        {
          isAdmin && (
            <NavItem
              href="/settings"
              label="Paramètres"
              icon={<Settings className="h-5 w-5" />}
            />
          )
        }
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-all text-red-600 w-full",
            state === "expanded" ? "" : "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {state === "expanded" && <span>Déconnexion</span>}
        </button>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full bg-background border shadow-sm z-10 hidden md:flex items-center justify-center transition-transform duration-300 ease-in-out"
        onClick={toggleSidebar}
      >
        {state === "expanded" ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
