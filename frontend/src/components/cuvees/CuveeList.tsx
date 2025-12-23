import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CuveeCard from "./CuveeCard";
import { toast } from "sonner";

// Type pour une cuvée
interface Cuvee {
  id: string;
  nom: string;
  annee: string;
  type: string;
  cepage: string;
  prix: string;
  stock: string;
  description?: string;
  image?: string;
}
interface StockAlert {
  id: string;
  cuveeId: string;
  cuveeName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'low' | 'ok';
  createdAt: string;
}

const CuveeList = () => {
  // États pour les cuvées et le filtrage
  const [cuvees, setCuvees] = useState<Cuvee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);

     const generateStockAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cuvees');
        if (!response.ok) throw new Error('Erreur lors de la récupération des cuvées');
        
        const data = await response.json();
        // Transformer les données de l'API au format attendu par le composant
  
        const savedCuvees = data;
        const alerts: StockAlert[] = [];
      
        if (savedCuvees) {
          const cuvees = savedCuvees;
          
          cuvees.forEach((cuvee: any) => {
            const stock = parseInt(cuvee.stock || "0");
            let status: 'critical' | 'low' | 'ok' = 'ok';
            
            if (stock <= 5) {
              status = 'critical';
            } else if (stock <= 15) {
              status = 'low';
            }
            
            if (status !== 'ok') {
              alerts.push({
                id: `alert-${cuvee.id}`,
                cuveeId: cuvee.id,
                cuveeName: `${cuvee.nom} ${cuvee.annee}`,
                currentStock: stock,
                threshold: status === 'critical' ? 5 : 15,
                status,
                createdAt: new Date().toISOString()
              });
            }
          });
        }
        
        setStockAlerts(alerts);
        localStorage.setItem('stockAlerts', JSON.stringify(alerts));
        
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors du chargement des cuvées depuis l'API");
      }
  
    };
  // Images par défaut pour chaque type de vin
  const defaultImages = {
    "Rouge": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    "Blanc": "https://images.unsplash.com/photo-1566754436893-89894b67d6ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    "Rose": "https://images.unsplash.com/photo-1558682575-d1b8e0caafe0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80",
    "Petillant": "https://images.unsplash.com/photo-1590082871875-849310c4d415?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    "default": "https://images.unsplash.com/photo-1586370434639-0fe43b4daa6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
  };

  // Charger les cuvées depuis le localStorage ou l'API
  useEffect(() => {
    loadCuvees();
    generateStockAlerts();
  }, []);

  const loadCuvees = async () => {
    setLoading(true);
    try {
      
      // Version API REST (à décommenter pour utilisation avec backend)
      
      try {
        const response = await fetch('http://localhost:3000/api/cuvees');
        if (!response.ok) throw new Error('Erreur lors de la récupération des cuvées');
        
        const data = await response.json();
        // Transformer les données de l'API au format attendu par le composant
        const formattedCuvees = data.map((item: any) => ({
          id: item.id,
          nom: item.nom,
          annee: item.annee?.toString() || '',
          type: item.type,
          cepage: item.cepage || '',
          prix: item.prix?.toString() || '0',
          stock: item.stock?.toString() || '0',
          description: item.description || '',
          image: item.image || defaultImages[item.type as keyof typeof defaultImages] || defaultImages.default
        }));
        
        setCuvees(formattedCuvees);
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors du chargement des cuvées depuis l'API");
      }
      
    } catch (error) {
      console.error("Erreur générale:", error);
      toast.error("Erreur lors du chargement des cuvées");
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser les cuvées avec le catalogue
  const syncWithCatalogue = (updatedCuvees: Cuvee[]) => {
    // Convertir les cuvées au format attendu par le catalogue
    const catalogueItems = updatedCuvees.map(cuvee => ({
      id: cuvee.id,
      nom: cuvee.nom,
      annee: cuvee.annee,
      type: cuvee.type,
      cepage: cuvee.cepage,
      prix: cuvee.prix,
      description: cuvee.description || "",
      stock: cuvee.stock,
      image: cuvee.image || defaultImages[cuvee.type as keyof typeof defaultImages] || defaultImages.default
    }));
    
    // Sauvegarder dans le localStorage pour le catalogue
    localStorage.setItem('catalogueWines', JSON.stringify(catalogueItems));
  };

  // Filtrer les cuvées en fonction de la recherche
  const filteredCuvees = cuvees.filter(
    (cuvee) =>
      cuvee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuvee.annee.includes(searchTerm) ||
      cuvee.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuvee.cepage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Supprimer une cuvée
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Version localStorage
      // const updatedCuvees = cuvees.filter((cuvee) => cuvee.id !== id);
      // setCuvees(updatedCuvees);
      
      // // Mettre à jour le localStorage
      // localStorage.setItem('cuvees', JSON.stringify(updatedCuvees));
      
      // // Synchroniser avec le catalogue
      // syncWithCatalogue(updatedCuvees);
      
      // toast.success("Cuvée supprimée avec succès", {
      //   description: "La cuvée a été supprimée de la base de données."
      // });
      
      // Version API REST (à décommenter pour utilisation avec backend)
      
      try {
        const response = await fetch(`http://localhost:3000/api/cuvees/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression de la cuvée');
        
        // Mettre à jour l'état local après confirmation de la suppression
        const updatedCuvees = cuvees.filter((cuvee) => cuvee.id !== id);
        setCuvees(updatedCuvees);
        
        // Synchroniser avec le catalogue
        syncWithCatalogue(updatedCuvees);
        
        toast.success("Cuvée supprimée avec succès", {
          description: "La cuvée a été supprimée de la base de données."
        });
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors de la suppression de la cuvée");
      }
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la cuvée");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold mb-2">Gestion des cuvées</h1>

      <div className="space-y-3 mb-5">
          {/* <h2 className="text-lg font-medium">Alertes de stock</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stockAlerts.map((alert) => (
              <Alert 
                key={alert.id}
                variant={alert.status === 'critical' ? 'destructive' : 'default'}
                className={
                  alert.status === 'critical' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                }
              >
                <AlertTitle>
                  {alert.status === 'critical' ? 'Stock critique' : 'Stock bas'}
                </AlertTitle>
                <AlertDescription>
                  <div className="flex justify-between items-center">
                    <span>{alert.cuveeName}: {alert.currentStock} bouteilles</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Navigate to cuvee management
                        window.location.href = `/cuvees/modifier/${alert.cuveeId}`;
                      }}
                    >
                      Gérer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
        
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button asChild>
            <Link to="/cuvees/ajouter">
              <Plus size={18} className="mr-1" /> Ajouter
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement des cuvées...</p>
        </div>
      ) : filteredCuvees.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune cuvée trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredCuvees.map((cuvee) => (
            <CuveeCard
              key={cuvee.id}
              id={cuvee.id}
              nom={cuvee.nom}
              annee={cuvee.annee}
              type={cuvee.type}
              cepage={cuvee.cepage}
              prix={cuvee.prix}
              stock={cuvee.stock}
              image={cuvee.image}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CuveeList;
