
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";
import NotificationsMenu from "./NotificationsMenu";
import { useRoleAccess } from "@/hooks/useRoleAccess";

export default function Header() {
  const { user } = useAuth();
  const { isAdmin } = useRoleAccess();
  const [orderCount, setOrderCount] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) {
      // Récupérer le nombre de commandes en attente pour les administrateurs
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const pendingOrders = parsedOrders.filter(
          (order: any) => order.status === 'pending' || order.status === 'processed'
        );
        setOrderCount(pendingOrders.length);
      }
    }
  }, [isAdmin]);

  return (
    <header className="flex h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 lg:gap-4 w-full">
        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">VinExpert</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {isAdmin && <NotificationsMenu />}
          {user && (
            <Link to="/profile" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-wine text-white grid place-items-center">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden md:inline-block">
                {user.name || "Utilisateur"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
