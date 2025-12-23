import { toast } from "sonner";
import { LoginCredentials, RegisterData, User } from "@/types/user";

const USERS_STORAGE_KEY = "vin-artisan-users";
const CURRENT_USER_KEY = "vin-artisan-current-user";

// Récupérer les utilisateurs du localStorage
const getUsers = async (): Promise<User[]> => {
  // const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  // return usersJson ? JSON.parse(usersJson) : [];
  try {
    const response = await fetch(
      "https://vinexpert-backend.vercel.app/api/users",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    // toast.success("utilisateurs recuperés avec succès");
    return data;
  } catch (error) {
    console.error("Erreur API:", error);
    toast.error("Erreur lors de la recuperation de l'utilisateur");
  }
};
const users = await getUsers();

// Enregistrer les utilisateurs dans le localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Vérifier si l'utilisateur existe déjà
const userExists = (email: string): boolean => {
  return users.some((user) => user.email === email);
};

// Enregistrer un nouvel utilisateur
export const registerUser = (userData: RegisterData): User | null => {
  if (userExists(userData.email)) {
    return null; // L'email est déjà utilisé
  }

  const newUser: User = {
    id: Date.now().toString(),
    email: userData.email,
    name: userData.name,
    password: userData.password || "",
    role: "client", // Par défaut, les nouveaux utilisateurs sont des clients
    createdAt: new Date().toISOString(),
  };

  // Ajouter l'utilisateur à la liste

  users.push(newUser);
  saveUsers(users);

  // Sauvegarder le mot de passe séparément pour plus de sécurité
  // Dans une application réelle, on utiliserait un hachage du mot de passe
  localStorage.setItem(`password-${newUser.id}`, userData.password);

  return newUser;
};

// Connecter un utilisateur
export const loginUser = (credentials: LoginCredentials): User | null => {
  const user = users.find(
    (user) =>
      user.email === credentials.email && user.password === credentials.password
  );
  if (!user) {
    return null; // Utilisateur non trouvé
  }

  // const storedPassword = localStorage.getItem(`password-${user.id}`);
  // if (storedPassword !== credentials.password) {
  //   return null; // Mot de passe incorrect
  // }

  // Stocker l'utilisateur courant dans le localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

// Déconnecter l'utilisateur
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Récupérer l'utilisateur courant
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Changer le mot de passe d'un utilisateur
export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  const jsonData = {
    userId: userId,
    newPassword: newPassword,
  };

  const id = userId;
  // Mettre à jour le mot de passe
  const response = await fetch(
    `https://vinexpert-backend.vercel.app/api/password/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    }
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la mis à jour du mot de passe");
  }
  return true;
};

// Supprimer un compte utilisateur
export const deleteUserAccount = (userId: string): boolean => {
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return false;
  }

  // Supprimer l'utilisateur de la liste
  users.splice(userIndex, 1);
  saveUsers(users);

  // Si c'est l'utilisateur actuel, déconnexion
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const id = userId;
    fetch("https://vinexpert-backend.vercel.app/api/users/" + id, {
      method: "DELETE",
    });
    logoutUser();
  }

  return true;
};

// Initialiser quelques utilisateurs pour les tests
export const initializeTestUsers = async () => {
  // if (getUsers().length === 0) {
  // const adminUser: User = {
  //   id: "1",
  //   email: "admin@vinartisan.fr",
  //   name: "Admin",
  //   role: "admin",
  //   createdAt: new Date().toISOString(),
  // };

  // const clientUser: User = {
  //   id: "2",
  //   email: "client@example.com",
  //   name: "Client Test",
  //   role: "client",
  //   createdAt: new Date().toISOString(),
  // };
  // API call (à décommenter pour utiliser avec backend)
  try {
    const response = await fetch(
      "https://vinexpert-backend.vercel.app/api/users",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log();

    const data = await response.json();
    // toast.success("utilisateurs recuperés avec succès");
    saveUsers(data);
    return data;
  } catch (error) {
    console.error("Erreur API:", error);
    toast.error("Erreur lors de la recuperation de l'utilisateur");
    throw error;
  }
  // saveUsers([adminUser, clientUser]);
  // localStorage.setItem(`password-1`, "admin123");
  // localStorage.setItem(`password-2`, "client123");
  // }
};
