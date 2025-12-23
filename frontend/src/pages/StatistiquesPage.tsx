import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Interfaces for our data
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  wine_type?: string;
}

interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
}

interface Cuvee {
  id: string;
  name: string;
  type: string;
  year: number;
  price: number;
  stock: number;
  description: string;
  image: string;
}

// Interface pour les données par type de vin
interface WineTypeData {
  quarter: string;
  Rouge: number;
  Blanc: number;
  Rosé: number;
  Pétillant: number;
  [key: string]: string | number;
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

const StatistiquesPage = () => {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<WineTypeData[]>([]);
    const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
   // Generate stock alerts based on real cuvee inventory from localStorage
   const generateStockAlerts = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/cuvees');
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
  useEffect(() => {
    generateStockAlerts();
    // Fonction pour charger les données de statistiques
    const loadStatisticsData = async () => {
      try {

        // Version locale avec les vraies données
        const generateSalesData = () => {
          const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
          const monthlySales: Record<string, number> = {};
          const monthlyOrders: Record<string, number> = {};
          
          // If we have orders, process them
          if (orders.length > 0) {
            orders.forEach((order: Order) => {
              const date = new Date(order.date);
              const monthYear = `${date.toLocaleString('fr-FR', { month: 'short' })} ${date.getFullYear()}`;
              
              monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.total;
              monthlyOrders[monthYear] = (monthlyOrders[monthYear] || 0) + 1;
            });
            
            // Convert to array format for charts
            const data = Object.keys(monthlySales).map(month => ({
              month,
              ventes: monthlySales[month],
              commandes: monthlyOrders[month] || 0
            }));
            
            // Sort by date
            data.sort((a, b) => {
              const aDate = new Date(a.month.replace('janv.', 'janvier').replace('févr.', 'février').replace('avr.', 'avril').replace('juil.', 'juillet').replace('sept.', 'septembre').replace('oct.', 'octobre').replace('nov.', 'novembre').replace('déc.', 'décembre'));
              const bDate = new Date(b.month.replace('janv.', 'janvier').replace('févr.', 'février').replace('avr.', 'avril').replace('juil.', 'juillet').replace('sept.', 'septembre').replace('oct.', 'octobre').replace('nov.', 'novembre').replace('déc.', 'décembre'));
              return aDate.getTime() - bDate.getTime();
            });
            
            return data.slice(-6); // Last 6 months
          }
          
          return [];
        };
        
        const generateQuarterlyData = () => {
          const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
          const cuvees: Cuvee[] = JSON.parse(localStorage.getItem('cuvees') || '[]');
          
          if (orders.length === 0) {
            return [];
          }
          
          // Group by quarters
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
          
          // Calculate previous quarter
          const prevQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
          const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
          
          const quarterLabels = [
            `Q${prevQuarter} ${prevQuarterYear}`,
            `Q${currentQuarter} ${currentYear}`,
          ];
          
          // Initialize result structure with correct typing
          const result: WineTypeData[] = quarterLabels.map(quarter => {
            return {
              quarter,
              Rouge: 0,
              Blanc: 0,
              Rosé: 0,
              Pétillant: 0
            };
          });
          
          // Process orders
          orders.forEach((order: Order) => {
            const orderDate = new Date(order.date);
            const orderYear = orderDate.getFullYear();
            const orderQuarter = Math.floor(orderDate.getMonth() / 3) + 1;
            const orderQuarterLabel = `Q${orderQuarter} ${orderYear}`;
            
            // Skip if not in our quarters of interest
            if (!quarterLabels.includes(orderQuarterLabel)) {
              return;
            }
            
            // Find the quarter index
            const quarterIndex = quarterLabels.indexOf(orderQuarterLabel);
            if (quarterIndex === -1) return;
            
            // Process each item in the order
            order.items.forEach(item => {
              let type = "Autre";
              
              // Try to find the cuvee to get its type
              const cuvee = cuvees.find(c => c.id === item.id);
              if (cuvee && cuvee.type) {
                type = cuvee.type;
              } 
              // Or try to guess from the name
              else if (item.name) {
                const nameLower = item.name.toLowerCase();
                if (nameLower.includes("rouge")) type = "Rouge";
                else if (nameLower.includes("blanc")) type = "Blanc";
                else if (nameLower.includes("rosé") || nameLower.includes("rose")) type = "Rosé";
                else if (nameLower.includes("pétillant") || nameLower.includes("petillant") || nameLower.includes("champagne")) type = "Pétillant";
              }
              
              // Increment the sales for this type in this quarter
              if (["Rouge", "Blanc", "Rosé", "Pétillant"].includes(type)) {
                // Fix: Convert the property to a number before adding
                const currentValue = result[quarterIndex][type] as number;
                result[quarterIndex][type] = currentValue + (item.price * item.quantity);
              }
            });
          });
          
          return result;
        };
        
        const salesData = generateSalesData();
        setMonthlyData(salesData);
        
        const wineTypesData = generateQuarterlyData();
        setQuarterlyData(wineTypesData);
        
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };
    
    loadStatisticsData();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold">Statistiques</h1>

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
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventes" name="Ventes (€)" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="commandes" name="Nombre de commandes" stroke="#882338" strokeWidth={2} dot={{ stroke: "#882338", strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ventes par Catégorie de Vin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Rouge" fill="#882338" />
                  <Bar dataKey="Blanc" fill="#f9e0ad" />
                  <Bar dataKey="Rosé" fill="#f4a4af" />
                  <Bar dataKey="Pétillant" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatistiquesPage;
