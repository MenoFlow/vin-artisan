
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser, initializeTestUsers } from "@/services/authService";
import { LoginCredentials, RegisterData, User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { toast as toast2 } from "sonner";


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  register: (data: RegisterData) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialiser les utilisateurs de test au chargement
  useEffect(() => {
    initializeTestUsers();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      const loggedInUser = loginUser(credentials);
      if (loggedInUser) {
        setUser(loggedInUser);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${loggedInUser.name} !`,
          variant: "success",
        });
        return loggedInUser;
      } else {
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect.",
        });
        return null;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
      });
      return null;
    }
  };

  const register = async (data: RegisterData): Promise<User | null> => {
    try {
      const newUser = registerUser(data);
      if (newUser) {
        setUser(newUser);
        toast({
          variant: "success",
          title: "Inscription réussie",
          description: `Bienvenue, ${newUser.name} !`,
        });
        return newUser;
      } else {
        toast({
          variant: "destructive",
          title: "Échec de l'inscription",
          description: "Cet email est déjà utilisé.",
        });
        return null;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
      });
      return null;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    toast({
      variant: "success",
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
