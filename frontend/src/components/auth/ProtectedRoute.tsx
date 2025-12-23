import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface UserSettings {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  orderUpdates: boolean;
  marketing: boolean;
  theme: string;
  density: string;
  maintenance: boolean;
  registration: boolean;
  debug: boolean;
}
const defaultSettings: UserSettings = {
  language: "fr",
  timezone: "Europe/Paris",
  emailNotifications: false,
  orderUpdates: true,
  marketing: false,
  theme: "light",
  density: "comfortable",
  maintenance: false,
  registration: true,
  debug: false,
};
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  
  const fetchSettings = async () => {
    try{
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/settings', {
        method: 'GET'
      });
      const data = await response.json();
      
      setSettings(data);
    } catch (error){
      toast("Erreur");
    }
  }
  useEffect(() => {
    fetchSettings();
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-wine" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (!user || (settings?.maintenance === true)) {
      return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
