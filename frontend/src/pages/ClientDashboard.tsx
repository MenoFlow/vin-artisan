
import { useEffect, useState } from "react";
import { BarChart2, Package, ShoppingCart, Wine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";

// Type pour les commandes stockées
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  clientId: string;
  wine_type?: string; // Adding wine_type property
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  quantity: number;
  date: string;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  clientId?: string; // Optional to match existing data
}

const COLORS = ['#722F37', '#A05195', '#D45087', '#F95D6A', '#FF7C43', '#FFA600'];

const ClientDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<any[]>([]);
  const [wineTypes, setWineTypes] = useState<any[]>([]);
  const { user } = useAuth();
  const { isAdmin, isClient, canManageCommandes } = useRoleAccess();
  
  const id = user.id

  const loadOrderItems = async () => {
    // Charger les données
    const response1 = await fetch('https://vinexpert-backend.vercel.app/api/order_items', {
      method: 'GET'
    });

    const orderItemsData = await response1.json();
    let parsedOrders: OrderItem[] = orderItemsData;
    
    if (isClient && user?.id) {
      parsedOrders = parsedOrders.filter(order => order.clientId === user.id);
    }
    // console.log(parsedOrders);
    setOrderItems(parsedOrders);
    return parsedOrders;
  }

  useEffect(() => {

    const fetchOrders = async () => {
      const response = await fetch('https://vinexpert-backend.vercel.app/api/orders/'+id, {
        method: 'GET'
      });
      const data = await response.json();
      let parsedOrders: Order[] = data;
    
      // Ensure orders have wine_type property
      parsedOrders = parsedOrders?.map(order => ({
        ...order,
        items: orderItems?.map(item => {
          // Determine wine type from name if not explicitly set
          if (!item.wine_type && item.name) {
            let type = "Autre";
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes("rouge")) type = "Rouge";
            else if (nameLower.includes("blanc")) type = "Blanc";
            else if (nameLower.includes("rosé") || nameLower.includes("rose")) type = "Rosé";
            else if (nameLower.includes("pétillant") || nameLower.includes("petillant") || nameLower.includes("champagne")) type = "Pétillant";
            
            return { ...item, wine_type: type };
          }
          return item;
        })
      }));
      
      // Store enhanced orders back
      localStorage.setItem('clientOrders', JSON.stringify(parsedOrders));
      
      // Filtrer pour l'utilisateur actuel si on a un ID d'utilisateur
      const filteredOrders = user?.id ? 
        parsedOrders.filter(order => order.clientId === user.id) : 
        parsedOrders;
      setOrders(filteredOrders);
      const result = await loadOrderItems();

      processDashboardData(filteredOrders, result);
    }

    fetchOrders();

  }, [user?.id]);
  
  const processDashboardData = (orderData: Order[], result) => {
    // Calculate monthly spending
    const spendingByMonth = new Map();
    orderData.forEach(order => {
      const date = new Date(order.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}`;
      const currentSpending = spendingByMonth.get(monthYear) || 0;
      spendingByMonth.set(monthYear, currentSpending + parseFloat(order.total.toString()));
    });

  orderData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Nouveau : chaque commande = un point
  const spendingData = orderData.map(order => ({
    date: new Date(order.date).toLocaleDateString(), // ou .toLocaleString() si tu veux l’heure aussi
    spending: parseFloat(order.total.toString())
  }));

setMonthlySpending(spendingData);

    // Calculate wine types purchased
    const typeCount = new Map();

    orderData.forEach(order => {
      result?.forEach(item => {
        // Get wine type from the item
        const type = item.wine_type || "Autre";
        const currentCount = typeCount.get(type) || 0;
        typeCount.set(type, currentCount + parseInt(order.quantity.toString()));
      });
    });

    const typeData = Array.from(typeCount).map(([name, value]) => ({
      name,
      value
    }));
    setWineTypes(typeData);
  };

  // Calcul des statistiques
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(parseFloat(order.total.toString()).toString()), 0);
  const totalBottles = orders.reduce((sum, order) => 
    sum + order.quantity, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processed').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Mon tableau de bord</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Mes achats totaux</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">Total de vos achats</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Bouteilles achetées</CardTitle>
            <Wine className="h-5 w-5 text-wine" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBottles}</div>
            <p className="text-xs text-muted-foreground">Nombre total de bouteilles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <Package className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">En attente de livraison</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Commandes réalisées</CardTitle>
            <BarChart2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Nombre total de commandes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 mt-6">
        <Card>
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {monthlySpending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySpending} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    name="Dépenses (€)" 
                    stroke="#722F37" 
                    strokeWidth={2} 
                    dot={{ stroke: '#722F37', strokeWidth: 2, r: 4 }} 
                  />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="date" />  {/* avant c'était "month", maintenant c'est "date" */}
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} €`, "Dépenses"]} />
                </LineChart>
              </ResponsiveContainer>

            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>Mes commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Commande #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-wine">{parseFloat(order.total.toString())} €</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'delivered' ? 'Livré' :
                        order.status === 'shipped' ? 'Expédié' :
                        order.status === 'processed' ? 'En préparation' :
                        order.status === 'cancelled' ? 'Annulé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Aucune commande récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
