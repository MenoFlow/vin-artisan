
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search,
  Plus,
  Edit,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Types for our data models
interface ProductionLot {
  id: string;
  name: string;
  vintage: string;
  varietal: string;
  status: 'harvest' | 'fermentation' | 'aging' | 'bottling' | 'ready';
  quantity: number;
  harvestDate: string;
  bottlingDate: string | null;
  notes: string;
  tankId: string;
}

interface Tank {
  id: string;
  name: string;
  capacity: number;
  currentVolume: number;
  contents: string;
  status: 'empty' | 'filling' | 'fermenting' | 'aging' | 'ready';
  temperature: number;
  lastChecked: string;
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

const VineyardManagementPage = () => {
  // State
  const [activeTab, setActiveTab] = useState("production");
  const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewLotDialog, setShowNewLotDialog] = useState(false);
  const [showTankUpdateDialog, setShowTankUpdateDialog] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  
  // Form state for new lot
  const [newLot, setNewLot] = useState<Partial<ProductionLot>>({
    name: "",
    vintage: new Date().getFullYear().toString(),
    varietal: "Cabernet Sauvignon",
    status: "harvest",
    quantity: 1000,
    harvestDate: new Date().toISOString().split('T')[0],
    bottlingDate: null,
    notes: "",
    tankId: ""
  });
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data from localStorage or initialize with sample data
  const loadData = () => {
    // Load or initialize production lots
    const savedLots = localStorage.getItem('productionLots');
    if (savedLots) {
      setProductionLots(JSON.parse(savedLots));
    } else {
      const initialLots: ProductionLot[] = [
        {
          id: "lot-2023-cab-01",
          name: "Cabernet Sauvignon 2023 - Lot 1",
          vintage: "2023",
          varietal: "Cabernet Sauvignon",
          status: "aging",
          quantity: 2500,
          harvestDate: "2023-09-15",
          bottlingDate: null,
          notes: "Excellente récolte, fermentation terminée, transfert en barrique le 15/10/2023",
          tankId: "tank-02"
        },
        {
          id: "lot-2023-chard-01",
          name: "Chardonnay 2023 - Lot 1",
          vintage: "2023",
          varietal: "Chardonnay",
          status: "bottling",
          quantity: 1800,
          harvestDate: "2023-08-20",
          bottlingDate: "2024-03-10",
          notes: "Fermentation à basse température, notes florales prononcées",
          tankId: "tank-03"
        },
        {
          id: "lot-2023-merlot-01",
          name: "Merlot 2023 - Lot 1",
          vintage: "2023",
          varietal: "Merlot",
          status: "fermentation",
          quantity: 3000,
          harvestDate: "2023-10-05",
          bottlingDate: null,
          notes: "Vendanges manuelles, première fermentation en cours",
          tankId: "tank-04"
        }
      ];
      setProductionLots(initialLots);
      localStorage.setItem('productionLots', JSON.stringify(initialLots));
    }
    
    // Load or initialize tanks
    const savedTanks = localStorage.getItem('tanks');
    if (savedTanks) {
      setTanks(JSON.parse(savedTanks));
    } else {
      const initialTanks: Tank[] = [
        {
          id: "tank-01",
          name: "Cuve 1",
          capacity: 5000,
          currentVolume: 0,
          contents: "",
          status: "empty",
          temperature: 15,
          lastChecked: new Date().toISOString()
        },
        {
          id: "tank-02",
          name: "Cuve 2",
          capacity: 3000,
          currentVolume: 2500,
          contents: "Cabernet Sauvignon 2023",
          status: "aging",
          temperature: 16,
          lastChecked: new Date().toISOString()
        },
        {
          id: "tank-03",
          name: "Cuve 3",
          capacity: 2000,
          currentVolume: 1800,
          contents: "Chardonnay 2023",
          status: "ready",
          temperature: 12,
          lastChecked: new Date().toISOString()
        },
        {
          id: "tank-04",
          name: "Cuve 4",
          capacity: 4000,
          currentVolume: 3000,
          contents: "Merlot 2023",
          status: "fermenting",
          temperature: 18,
          lastChecked: new Date().toISOString()
        }
      ];
      setTanks(initialTanks);
      localStorage.setItem('tanks', JSON.stringify(initialTanks));
    }
    
    // Generate stock alerts
    generateStockAlerts();
  };

  // Generate stock alerts based on real cuvee inventory from localStorage
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

  // Get real sales data for charts from orders in localStorage
  const getSalesData = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const monthlySales: Record<string, number> = {};
    const varietalSales: Record<string, number> = {};
    
    // If we have orders, process them
    if (orders.length > 0) {
      orders.forEach((order: any) => {
        const date = new Date(order.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.total;
        
        if (order.items) {
          order.items.forEach((item: any) => {
            if (item.vin && item.vin.cepage) {
              const varietal = item.vin.cepage;
              varietalSales[varietal] = (varietalSales[varietal] || 0) + 
                (item.quantite * parseFloat(item.vin.prix || 0));
            }
          });
        }
      });
    } else {
      // Sample data if no orders exist
      monthlySales["1/2024"] = 12500;
      monthlySales["2/2024"] = 15800;
      monthlySales["3/2024"] = 18200;
      monthlySales["4/2024"] = 20500;
      monthlySales["5/2024"] = 19300;
      
      varietalSales["Cabernet Sauvignon"] = 25600;
      varietalSales["Merlot"] = 18400;
      varietalSales["Chardonnay"] = 12600;
      varietalSales["Pinot Noir"] = 14300;
    }
    
    const monthlyData = Object.keys(monthlySales).map(month => ({
      month,
      sales: monthlySales[month]
    }));
    
    const varietalData = Object.keys(varietalSales).map(varietal => ({
      varietal,
      sales: varietalSales[varietal]
    }));
    
    return { monthlyData, varietalData };
  };

  // Format tank status for display
  const getTankStatusColor = (status: Tank['status']) => {
    switch (status) {
      case 'empty': return 'bg-gray-100 text-gray-800';
      case 'filling': return 'bg-blue-100 text-blue-800';
      case 'fermenting': return 'bg-purple-100 text-purple-800';
      case 'aging': return 'bg-amber-100 text-amber-800';
      case 'ready': return 'bg-green-100 text-green-800';
    }
  };

  // Format lot status for display
  const getLotStatusColor = (status: ProductionLot['status']) => {
    switch (status) {
      case 'harvest': return 'bg-green-100 text-green-800';
      case 'fermentation': return 'bg-purple-100 text-purple-800';
      case 'aging': return 'bg-amber-100 text-amber-800';
      case 'bottling': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-emerald-100 text-emerald-800';
    }
  };
  
  // French translations of status
  const getLotStatusText = (status: ProductionLot['status']) => {
    switch (status) {
      case 'harvest': return 'Récolte';
      case 'fermentation': return 'Fermentation';
      case 'aging': return 'Élevage';
      case 'bottling': return 'Mise en bouteille';
      case 'ready': return 'Prêt';
    }
  };
  
  const getTankStatusText = (status: Tank['status']) => {
    switch (status) {
      case 'empty': return 'Vide';
      case 'filling': return 'Remplissage';
      case 'fermenting': return 'Fermentation';
      case 'aging': return 'Élevage';
      case 'ready': return 'Prêt';
    }
  };
  
  // Handle adding a new lot
  const handleAddLot = () => {
    const newLotWithId: ProductionLot = {
      ...newLot as Omit<ProductionLot, 'id'>,
      id: `lot-${Date.now()}`,
    };
    
    const updatedLots = [...productionLots, newLotWithId];
    setProductionLots(updatedLots);
    localStorage.setItem('productionLots', JSON.stringify(updatedLots));
    
    // Update tank if assigned
    if (newLotWithId.tankId) {
      const tankIndex = tanks.findIndex(tank => tank.id === newLotWithId.tankId);
      if (tankIndex >= 0) {
        const updatedTanks = [...tanks];
        updatedTanks[tankIndex] = {
          ...updatedTanks[tankIndex],
          currentVolume: newLotWithId.quantity,
          contents: `${newLotWithId.varietal} ${newLotWithId.vintage}`,
          status: 'filling'
        };
        
        setTanks(updatedTanks);
        localStorage.setItem('tanks', JSON.stringify(updatedTanks));
      }
    }
    
    toast.success("Nouveau lot ajouté avec succès");
    setShowNewLotDialog(false);
    
    // Reset form
    setNewLot({
      name: "",
      vintage: new Date().getFullYear().toString(),
      varietal: "Cabernet Sauvignon",
      status: "harvest",
      quantity: 1000,
      harvestDate: new Date().toISOString().split('T')[0],
      bottlingDate: null,
      notes: "",
      tankId: ""
    });
  };
  
  // Handle updating a tank
  const handleUpdateTank = () => {
    if (!selectedTank) return;
    
    const tankIndex = tanks.findIndex(tank => tank.id === selectedTank.id);
    if (tankIndex >= 0) {
      const updatedTanks = [...tanks];
      updatedTanks[tankIndex] = {
        ...selectedTank,
        lastChecked: new Date().toISOString()
      };
      
      setTanks(updatedTanks);
      localStorage.setItem('tanks', JSON.stringify(updatedTanks));
      
      toast.success(`Cuve ${selectedTank.name} mise à jour`);
      setShowTankUpdateDialog(false);
      setSelectedTank(null);
    }
  };
  
  // Prepare tank for update
  const openTankUpdateDialog = (tank: Tank) => {
    setSelectedTank({...tank});
    setShowTankUpdateDialog(true);
  };
  
  const salesData = getSalesData();

  // Filter production lots based on search term
  const filteredLots = productionLots.filter(lot => 
    lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.varietal.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter tanks based on search term
  const filteredTanks = tanks.filter(tank => 
    tank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tank.contents.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion intégrée de la production</h1>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {stockAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Alertes de stock</h2>
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
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="tanks">Cuves & Stocks</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-medium">Lots en production</h2>
            <Button
              onClick={() => setShowNewLotDialog(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> Nouveau lot
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filteredLots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun lot ne correspond à votre recherche
              </div>
            ) : (
              filteredLots.map((lot) => (
                <Card key={lot.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{lot.name}</CardTitle>
                      <Badge className={getLotStatusColor(lot.status)}>
                        {getLotStatusText(lot.status)}
                      </Badge>
                    </div>
                    <CardDescription>Cépage: {lot.varietal}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantité</p>
                        <p>{lot.quantity} litres</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Récolte</p>
                        <p>{new Date(lot.harvestDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cuve</p>
                        <p>{tanks.find(tank => tank.id === lot.tankId)?.name || 'Non assigné'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mise en bouteille</p>
                        <p>{lot.bottlingDate ? new Date(lot.bottlingDate).toLocaleDateString('fr-FR') : 'À programmer'}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{lot.notes}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        // Update lot status
                        const statusOrder: ProductionLot['status'][] = ['harvest', 'fermentation', 'aging', 'bottling', 'ready'];
                        const currentIndex = statusOrder.indexOf(lot.status);
                        
                        if (currentIndex < statusOrder.length - 1) {
                          const updatedLots = productionLots.map(l => {
                            if (l.id === lot.id) {
                              return {
                                ...l, 
                                status: statusOrder[currentIndex + 1],
                                bottlingDate: statusOrder[currentIndex + 1] === 'bottling' 
                                  ? new Date().toISOString() 
                                  : l.bottlingDate
                              };
                            }
                            return l;
                          });
                          
                          setProductionLots(updatedLots);
                          localStorage.setItem('productionLots', JSON.stringify(updatedLots));
                          toast.success(`Statut mis à jour: ${getLotStatusText(statusOrder[currentIndex + 1])}`);
                        }
                      }}
                    >
                      <ArrowRight className="mr-1 h-4 w-4" /> Étape suivante
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info(`Édition du lot ${lot.name}`)}
                    >
                      <Edit className="mr-1 h-4 w-4" /> Modifier détails
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tanks" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTanks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground col-span-3">
                Aucune cuve ne correspond à votre recherche
              </div>
            ) : (
              filteredTanks.map((tank) => (
                <Card key={tank.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{tank.name}</CardTitle>
                      <Badge className={getTankStatusColor(tank.status)}>
                        {getTankStatusText(tank.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {tank.status === 'empty' ? 'Cuve vide' : tank.contents}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Volume: {tank.currentVolume}/{tank.capacity} L</span>
                          <span>{Math.round((tank.currentVolume / tank.capacity) * 100)}%</span>
                        </div>
                        <Progress value={(tank.currentVolume / tank.capacity) * 100} className="h-2" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Température:</span>
                        <span>{tank.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Dernier contrôle:</span>
                        <span>{new Date(tank.lastChecked).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="w-full"
                      onClick={() => openTankUpdateDialog(tank)}
                    >
                      <Edit className="mr-1 h-4 w-4" /> Mettre à jour
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ventes mensuelles</CardTitle>
              <CardDescription>Évolution des ventes sur les derniers mois</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData.monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Ventes (€)" stroke="#882338" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ventes par cépage</CardTitle>
              <CardDescription>Répartition des ventes par type de vin</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={salesData.varietalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="varietal" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Ventes (€)" fill="#882338" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for adding new lot */}
      <Dialog open={showNewLotDialog} onOpenChange={setShowNewLotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau lot</DialogTitle>
            <DialogDescription>
              Saisissez les détails du nouveau lot de production.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot-name">Nom du lot</Label>
                <Input 
                  id="lot-name" 
                  placeholder="Ex: Cabernet 2024 - Lot 1"
                  value={newLot.name || ''}
                  onChange={(e) => setNewLot({...newLot, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot-vintage">Millésime</Label>
                <Input 
                  id="lot-vintage" 
                  type="number"
                  value={newLot.vintage || ''}
                  onChange={(e) => setNewLot({...newLot, vintage: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lot-varietal">Cépage</Label>
              <Select 
                value={newLot.varietal} 
                onValueChange={(value) => setNewLot({...newLot, varietal: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un cépage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cabernet Sauvignon">Cabernet Sauvignon</SelectItem>
                  <SelectItem value="Merlot">Merlot</SelectItem>
                  <SelectItem value="Syrah">Syrah</SelectItem>
                  <SelectItem value="Pinot Noir">Pinot Noir</SelectItem>
                  <SelectItem value="Chardonnay">Chardonnay</SelectItem>
                  <SelectItem value="Sauvignon Blanc">Sauvignon Blanc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot-quantity">Quantité (litres)</Label>
                <Input 
                  id="lot-quantity" 
                  type="number" 
                  value={newLot.quantity || 0}
                  onChange={(e) => setNewLot({...newLot, quantity: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot-harvest-date">Date de récolte</Label>
                <Input 
                  id="lot-harvest-date" 
                  type="date"
                  value={newLot.harvestDate?.split('T')[0] || ''}
                  onChange={(e) => setNewLot({...newLot, harvestDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lot-tank">Cuve assignée</Label>
              <Select 
                value={newLot.tankId || ''}
                onValueChange={(value) => setNewLot({...newLot, tankId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une cuve" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non assigné</SelectItem>
                  {tanks.filter(tank => tank.status === 'empty').map((tank) => (
                    <SelectItem key={tank.id} value={tank.id}>
                      {tank.name} ({tank.capacity} L)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lot-notes">Notes</Label>
              <Input 
                id="lot-notes"
                placeholder="Commentaires sur la récolte, la qualité, etc."
                value={newLot.notes || ''}
                onChange={(e) => setNewLot({...newLot, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLotDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddLot} disabled={!newLot.name || !newLot.varietal}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for updating tank */}
      <Dialog open={showTankUpdateDialog} onOpenChange={setShowTankUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour la cuve</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la cuve.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTank && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tank-name">Nom de la cuve</Label>
                  <Input 
                    id="tank-name"
                    value={selectedTank.name}
                    onChange={(e) => setSelectedTank({...selectedTank, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tank-capacity">Capacité (litres)</Label>
                  <Input 
                    id="tank-capacity" 
                    type="number"
                    value={selectedTank.capacity}
                    onChange={(e) => setSelectedTank({...selectedTank, capacity: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tank-volume">Volume actuel (litres)</Label>
                  <Input 
                    id="tank-volume" 
                    type="number"
                    value={selectedTank.currentVolume}
                    onChange={(e) => setSelectedTank({...selectedTank, currentVolume: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tank-temp">Température (°C)</Label>
                  <Input 
                    id="tank-temp" 
                    type="number" 
                    step="0.1"
                    value={selectedTank.temperature}
                    onChange={(e) => setSelectedTank({...selectedTank, temperature: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tank-contents">Contenu</Label>
                <Input 
                  id="tank-contents"
                  value={selectedTank.contents}
                  onChange={(e) => setSelectedTank({...selectedTank, contents: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tank-status">Statut</Label>
                <Select 
                  value={selectedTank.status}
                  onValueChange={(value: Tank['status']) => setSelectedTank({...selectedTank, status: value})}
                >
                  <SelectTrigger id="tank-status">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">Vide</SelectItem>
                    <SelectItem value="filling">Remplissage</SelectItem>
                    <SelectItem value="fermenting">Fermentation</SelectItem>
                    <SelectItem value="aging">Élevage</SelectItem>
                    <SelectItem value="ready">Prêt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTankUpdateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateTank}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VineyardManagementPage;
