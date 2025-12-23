import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  const loadSettings = async () => {
    if (user) {
      const response = await fetch('https://vinexpert-backend.vercel.app/api/settings', {
        method: 'GET'
      })
      const data = await response.json();

      if (data) {
        setSettings(data);
      }
    }
  }
  useEffect(() => {
    loadSettings();
  }, [user]);

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;
  
    try {
      const response = await fetch("https://vinexpert-backend.vercel.app/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
  
      const data = await response.json().catch(() => null);
  
      if (!response.ok) {
        console.error("Erreur API:", response.status, data);
        toast("Erreur serveur", {
          description: data?.message || "Impossible de sauvegarder les paramètres",
        });
        return;
      }
  
      // seulement après succès, on met à jour le localStorage
  
      toast("Paramètre mis à jour", {
        description: "Vos paramètres ont bien été enregistrés.",
      });
    } catch (error) {
      console.error("Erreur réseau:", error);
      toast("Erreur réseau", {
        description: "Impossible de joindre le serveur.",
      });
    }
  };
  

  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings); // garantit d'envoyer le dernier état
      return newSettings;
    });
  };
  

  if (!user) return null;
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
  
      {user.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres d'administration</CardTitle>
            <CardDescription>
              Configurez les paramètres réservés aux administrateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance">Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">Activer le mode maintenance du site</p>
              </div>
              <Switch 
                id="maintenance" 
                checked={settings?.maintenance}
                onCheckedChange={(checked) => handleChange('maintenance', checked)} 
              />
            </div>
  
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registration">Inscription utilisateur</Label>
                <p className="text-sm text-muted-foreground">Autoriser les nouvelles inscriptions</p>
              </div>
              <Switch 
                id="registration" 
                checked={settings?.registration}
                onCheckedChange={(checked) => handleChange('registration', checked)} 
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Gestion des pays partenaires</h3>
                  <p className="text-sm text-muted-foreground">Gérer les pays autorisés pour les commandes</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/partner-countries" className="flex items-center gap-2">
                    Gérer <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  };

export default SettingsPage;
