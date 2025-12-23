
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Search, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Country,
  getPartnerCountries, 
  addPartnerCountry, 
   
} from "@/services/partnerCountriesService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const COUNTRIES_LIST = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'ES', name: 'Espagne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'AT', name: 'Autriche' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'États-Unis' },
  { code: 'AU', name: 'Australie' },
  { code: 'NZ', name: 'Nouvelle-Zélande' },
  { code: 'JP', name: 'Japon' },
  { code: 'CN', name: 'Chine' },
  { code: 'KR', name: 'Corée du Sud' },
  { code: 'SG', name: 'Singapour' },
  { code: 'AE', name: 'Émirats Arabes Unis' },
];

const PartnerCountriesPage = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryName, setNewCountryName] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  useEffect(() => {
    loadCountries();
  }, []);
  
  const loadCountries = async () => {
    const partnerCountries = await getPartnerCountries();
    setCountries(partnerCountries);
  };
  
  const handleAddCountry = () => {
    if (!newCountryCode || !newCountryName) {
      toast.error("Veuillez saisir le code et le nom du pays");
      return;
    }
    
    try {
      addPartnerCountry({
        code: newCountryCode.toUpperCase(),
        name: newCountryName
      });
      
      setTimeout(() => {
        loadCountries();
      }, 1000)

      setShowAddDialog(false);
      setNewCountryCode("");
      setNewCountryName("");
      
    } catch (error) {
      toast.error("Erreur lors de l'ajout du pays");
    }
  };
  
  const handleRemoveCountry = async (code: string, name: string) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/partenaire/${code}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression du pays partenaire');
      loadCountries();
      toast.success(`${name} retiré des pays partenaires`);
    } catch (error) {
      toast.error("Erreur lors de la suppression du pays");
    }
  };
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto py-6 w-full max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des pays partenaires</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un pays
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Ajouter un pays partenaire</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <Label htmlFor="countryCode">Code</Label>
                    <Input
                      id="countryCode"
                      placeholder="FR"
                      value={newCountryCode}
                      onChange={(e) => setNewCountryCode(e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="countryName">Nom du pays</Label>
                    <Input
                      id="countryName"
                      placeholder="France"
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddCountry}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Alert className="mb-6">
        <Globe className="h-4 w-4" />
        <AlertTitle>Pays partenaires</AlertTitle>
        <AlertDescription>
          Les clients ne peuvent passer commande que s'ils sont localisés dans un des pays partenaires ci-dessous. 
          La vérification est effectuée lors du paiement.
        </AlertDescription>
      </Alert>
      
      {filteredCountries.length === 0 ? (
        <div className="text-center py-8">
          <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Aucun pays trouvé pour cette recherche" : "Aucun pays partenaire configuré"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((country) => (
            <Card key={country.code} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-wine">{country.code}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCountry(country.code, country.name)}
                    title="Retirer ce pays"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{country.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerCountriesPage;
