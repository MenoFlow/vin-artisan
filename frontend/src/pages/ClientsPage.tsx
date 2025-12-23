
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { initializeTestUsers } from "@/services/authService";

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Charger les clients
    loadClients();
  }, []);
  
  const loadClients = async () => {
    setLoading(true);
    try {
      // Ensure test users exist
      initializeTestUsers();
      
      try {
        const response = await fetch('/api/users?role=client');
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
        
        const data = await response.json();
        // Transformer les données de l'API au format attendu par le composant
        const formattedClients = data.map((client: any) => ({
          id: client.id,
          name: client.nom,
          email: client.email,
          role: client.role,
          createdAt: client.created_at
        }));
        
        setClients(formattedClients);
        
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors du chargement des clients depuis l'API");
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      setLoading(true);
      
      // Version localStorage
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.filter((user: Client) => user.id !== clientId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Mettre à jour l'état local
        setClients(clients.filter(client => client.id !== clientId));
        
        toast.success("Client supprimé avec succès", {
          description: "Le client a été supprimé de la base de données."
        });
      }
      
      // Version API REST (à décommenter pour utilisation avec backend)
      /*
      try {
        const response = await fetch(`/api/users/${clientId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression du client');
        
        // Mettre à jour l'état local après confirmation de la suppression
        setClients(clients.filter(client => client.id !== clientId));
        
        toast.success("Client supprimé avec succès", {
          description: "Le client a été supprimé de la base de données."
        });
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors de la suppression du client");
      }
      */
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du client");
    } finally {
      setLoading(false);
    }
  };
  
  const addDemoClients = () => {
    // Create sample users if none exists
    const sampleUsers = [
      {
        id: "client1",
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        password: "password123",
        role: "client",
        createdAt: new Date().toISOString()
      },
      {
        id: "client2",
        name: "Marie Martin",
        email: "marie.martin@example.com",
        password: "password123",
        role: "client",
        createdAt: new Date().toISOString()
      }
    ];
    
    const existingUsers = localStorage.getItem('users');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    const updatedUsers = [...users, ...sampleUsers];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Also store passwords separately as in authService
    localStorage.setItem('password-client1', 'password123');
    localStorage.setItem('password-client2', 'password123');
    
    setClients([...clients, ...sampleUsers]);
    toast.success("Exemples de clients ajoutés pour démonstration");
  };
  
  const filteredClients = clients.filter(
    client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-wine" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun client trouvé</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={addDemoClients}
          >
            Ajouter des clients d'exemple
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{client.name}</CardTitle>
                  <Badge>Client</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-semibold">Email:</span> {client.email}</p>
                  <p><span className="font-semibold">Date d'inscription:</span> {new Date(client.createdAt).toLocaleDateString()}</p>
                  
                  <div className="mt-4 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserX className="mr-1 h-4 w-4" /> Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela supprimera définitivement le compte
                            client de {client.name} et toutes ses données associées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
