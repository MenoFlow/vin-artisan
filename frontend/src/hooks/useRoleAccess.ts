
import { useAuth } from "@/contexts/AuthContext";

export const useRoleAccess = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isClient = user?.role === "client";
  
  // Admin-only access
  const canAccessProduction = isAdmin;
  const canAccessCuvees = isAdmin;
  const canAccessFactures = isAdmin;
  const canAccessStatistiques = isAdmin;
  const canManageCommandes = isAdmin;
  const canManageProduction = isAdmin; // For compatibility
  
  // Client-specific access
  const canViewClientDashboard = isClient;
  const canPurchase = isClient;
  const canViewOrderHistory = isClient;
  const canProcessPayment = isClient;

  // Shared access
  const canAccessClients = isAdmin;
  const canViewCatalogue = true; // Both admin and client can view the catalogue
  const canViewCommandes = true; // Both can view commandes but admin has management rights

  return {
    isAdmin,
    isClient,
    canAccessProduction,
    canAccessCuvees,
    canAccessFactures,
    canAccessClients,
    canAccessStatistiques,
    canManageCommandes,
    canManageProduction,
    canViewClientDashboard,
    canPurchase,
    canViewCatalogue,
    canViewOrderHistory,
    canProcessPayment,
    canViewCommandes
  };
};
