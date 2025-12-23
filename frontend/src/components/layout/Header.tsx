import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react"; // Ajoute Bell si tu veux un fallback
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationsMenu from "./NotificationsMenu";
import { useRoleAccess } from "@/hooks/useRoleAccess";

interface HeaderProps {
  onMenuClick?: () => void; // Pour ouvrir le sidebar mobile
}

export default function Header({ onMenuClick }: HeaderProps = {}) {
  const { user } = useAuth();
  const { isAdmin } = useRoleAccess();
  const [orderCount, setOrderCount] = useState<number>(0);

  // Compteur de commandes en attente (admin uniquement)
  useEffect(() => {
    if (!isAdmin) {
      setOrderCount(0);
      return;
    }

    const updateOrderCount = () => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const pendingOrders = parsedOrders.filter(
          (order: any) => order.status === 'pending' || order.status === 'processed'
        );
        setOrderCount(pendingOrders.length);
      } else {
        setOrderCount(0);
      }
    };

    updateOrderCount();
    const interval = setInterval(updateOrderCount, 30000); // Rafraîchit toutes les 30s
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex w-full items-center justify-between">
        {/* Gauche : Bouton menu mobile + Logo/Titre */}
        <div className="flex items-center gap-4">
          {/* Bouton Hamburger - visible seulement sur mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo / Titre - caché sur très petit écran si besoin */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl hidden sm:inline-block">VinExpert</span>
            <span className="font-bold text-xl sm:hidden">VE</span> {/* Version courte mobile */}
          </Link>
        </div>

        {/* Droite : Actions utilisateur */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* Notifications avec badge pour admin */}
          {isAdmin && (
            <NotificationsMenu>
              {/* On passe le badge en enfant pour personnaliser l'affichage du bouton */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {orderCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {orderCount > 99 ? "99+" : orderCount}
                  </Badge>
                )}
              </Button>
            </NotificationsMenu>
          )}

          {/* Profil utilisateur */}
          {user && (
            <Link to="/profile" className="flex items-center gap-3 rounded-lg hover:bg-accent px-2 py-1 transition-colors">
              <div className="h-8 w-8 rounded-full bg-wine text-white grid place-items-center font-medium">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden md:inline-block text-sm font-medium">
                {user.name || "Utilisateur"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}