
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, Wine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import ClientDashboard from "./ClientDashboard";

// Type pour les commandes stockées
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

// Type pour les cuvées stockées
interface Cuvee {
  id: string;
  nom: string;
  type: string;
  year: number;
  price: number;
  stock: number;
  description: string;
  image: string;
}

const Dashboard = () => {
  const { isClient } = useRoleAccess();
  
  // Si c'est un client, afficher le dashboard client
  if (isClient) {
    return <ClientDashboard />;
  }
  
  // Sinon, c'est le dashboard admin
  const [orders, setOrders] = useState<Order[]>([]);
  const [cuvees, setCuvees] = useState<Cuvee[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {

    // Charger les données
    const response1 = await fetch('https://vinexpert-backend.vercel.app/api/orders', {
      method: 'GET'
    });
    const ordersData = await response1.json();
    setOrders(ordersData);
    const parsedOrders: Order[] = ordersData;
    setOrders(parsedOrders);
    
    const response = await fetch('https://vinexpert-backend.vercel.app/api/cuvees', {
      method: 'GET'
    });
    const data = await response.json();

    const parsedCuvees: Cuvee[] = data;
    setCuvees(parsedCuvees);
    localStorage.setItem('cuvees', JSON.stringify(parsedCuvees));

    // Calculer les données de vente mensuelles
    const salesByMonth = new Map();
    parsedOrders?.forEach(order => {
      const date = new Date(order?.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
      const currentSales = salesByMonth.get(monthYear) || 0;
      salesByMonth.set(monthYear, currentSales + parseFloat(order?.total.toString()));
    });

    // Chaque commande devient un point
    const salesData = parsedOrders?.map(order => ({
      date: new Date(order?.date).toLocaleDateString(), // ou toLocaleString() si tu veux heure + date
      ventes: parseFloat(order?.total.toString())
    }));
    setMonthlySales(salesData);


    // Calculer les données par type de vin
    const salesByType = new Map();

    // Convertir en pourcentage du total
    const totalSales = Array.from(salesByType.values()).reduce((sum, val) => sum + val, 0);
    const typeData = Array.from(salesByType).map(([name, value]) => ({
      name, 
      value: totalSales > 0 ? Math.round((value / totalSales) * 100) : 0
    }));
  }
  // Calcul des statistiques
  const totalSales = orders?.reduce((sum, order) => sum + parseFloat(order?.total.toString()), 0);
  const activeCuvees = cuvees?.filter(cuvee => cuvee.stock > 0).length;
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'processed').length;
  const clientCount = new Set(orders?.map(o => o.clientId)).size;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales?.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">Toutes périodes confondues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cuvées actives</CardTitle>
            <Wine className="h-5 w-5 text-wine" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCuvees}</div>
            <p className="text-xs text-muted-foreground">{cuvees?.filter(c => c.stock > 0 && c.stock < 10).length} avec stock faible</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <Package className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders} en attente de traitement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-muted-foreground">Nombre total de clients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes mensuelles</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {monthlySales?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="ventes" stroke="#722F37" strokeWidth={2} dot /> 
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="date" />   {/* date de la commande */}
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} €`, "Ventes"]} />
                </LineChart>
              </ResponsiveContainer>

            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Aucune vente enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders?.length > 0 ? (
              <div className="space-y-4">
                {orders?.slice(0, 5)?.map((order) => (
                  <div key={order?.id} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="flex-1">
                      Commande #{order?.id.slice(0, 6)} - Client: {order?.clientName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order?.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {cuvees?.filter(c => c.stock < 10 && c.stock > 0).slice(0, 3).map((cuvee) => (
                  <div key={cuvee.id} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    <span className="flex-1">Stock faible sur "{cuvee.nom}"</span>
                    <span className="text-xs text-muted-foreground">{cuvee.stock} restant(s)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
