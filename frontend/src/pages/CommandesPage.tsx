
import { useState, useEffect } from "react";
import { Calendar, ChevronRight, Search, Truck, Check, X, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface OrderItem {
  id: string;
  name: string;
  order_id: string;
  price: number;
  quantity: number;
  image: string;
  clientId: string;
}

interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
}

const CommandesPage = () => {
  const { isAdmin, isClient, canManageCommandes } = useRoleAccess();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filtreStatut, setFiltreStatut] = useState<string>("");
  const [activeTab, setActiveTab] = useState("toutes");
  const [orderDetail, setOrderDetail] = useState<string | null>(null);


  const loadOrders = async () => {
    // Charger les données
    const response1 = await fetch('http://localhost:3000/api/orders', {
      method: 'GET'
    });
    const ordersData = await response1.json();
    const savedOrders = ordersData;
    let parsedOrders: Order[] = savedOrders;
    
    if (isClient && user?.id) {
      parsedOrders = parsedOrders.filter(order => order.clientId === user.id);
    }
    
    setOrders(parsedOrders);
  }

  const loadOrderItems = async () => {
    // Charger les données
    const response1 = await fetch('http://localhost:3000/api/order_items', {
      method: 'GET'
    });
    const orderItemsData = await response1.json();
    let parsedOrders: OrderItem[] = orderItemsData;
    
    if (isClient && user?.id) {
      parsedOrders = parsedOrders.filter(order => order.clientId === user.id);
    }
    
    setOrderItems(parsedOrders);
  }

  useEffect(() => {
    loadOrders();
    loadOrderItems();
  }, [isAdmin, isClient, user?.id]);


  const filteredOrders = orders.filter((order) => {
    const statusMatch = filtreStatut === "" || order.status === filtreStatut;

    const searchMatch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    let tabMatch = true;
    if (activeTab !== "toutes") {
      tabMatch = order.status === activeTab;
    }

    return statusMatch && searchMatch && tabMatch;
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">En préparation</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Expédiée</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Livrée</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Annulée</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Order["status"]) => {

    const newOrdersData = {
      id: id,
      status: newStatus
    }
    // API call (à décommenter pour utiliser avec backend)
    try {
      const response = await fetch(`http://localhost:3000/api/orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrdersData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      const data = await response.json();
      const updatedOrders = orders.map(order => {
        if (order.id === id) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);
      
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast.success("Statut de la commande mis à jour", {
        description: `La commande ${id} a été mise à jour.`,
      });
      
      setOrderDetail(null);
      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de la mise à jour de la commande");
      throw error;
    }


  };

  const handleDeleteOrder = async (id: string) => {
          
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression de la commande');
      
      // Mettre à jour l'état local après confirmation de la suppression
      const updatedOrders = orders.filter((order) => order.id !== id);
      setOrders(updatedOrders);
            
      toast.success("Commande supprimée avec succès", {
        description: "La commande a été supprimée de la base de données."
      });
    } catch (error) {
      console.error('Erreur API:', error);
      toast.error("Erreur lors de la suppression de la commande");
    }
    
    setOrderDetail(null);
  };
  
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">
        {isAdmin ? "Gestion des commandes" : "Mes commandes"}
      </h1>
      
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="toutes">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="processing">En préparation</TabsTrigger>
            <TabsTrigger value="shipped">Expédiées</TabsTrigger>
            <TabsTrigger value="delivered">Livrées</TabsTrigger>
            <TabsTrigger value="canceled">Annulées</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isAdmin ? "Rechercher une commande..." : "Rechercher dans mes commandes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <p className="text-muted-foreground">
                  {isClient 
                    ? "Vous n'avez pas encore passé de commande." 
                    : "Aucune commande trouvée"}
                </p>
                {isClient && (
                  <Button 
                    onClick={() => navigate('/catalogue')} 
                    className="mt-4"
                  >
                    Découvrir nos vins
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Commande #{order.id.slice(0, 8)}</CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Client</p>
                          <p>{order.clientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Montant</p>
                          <p className="font-bold text-wine">{parseFloat(order.total.toString()).toFixed(2)} €</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setOrderDetail(order.id === orderDetail ? null : order.id)}
                      >
                        {order.id === orderDetail ? "Masquer les détails" : "Voir les détails"}
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </CardFooter>
                    
                    {order.id === orderDetail && (
                      <div className="bg-muted p-4">
                        <h3 className="font-medium mb-2">Détails de la commande</h3>
                        <div className="space-y-2">
                          {
                            orderItems.filter((itemT) => ((itemT.clientId === order.clientId) && (itemT.order_id === order.id))).map((item, index) => {
                            return (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.name} x{item.quantity}</span>
                              <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                          )})}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-wine">{parseFloat(order.total.toString()).toFixed(2)} €</span>
                          </div>
                        </div>
                                                
                        {canManageCommandes && (
                          <div className="mt-4">
                            <h3 className="font-medium mb-2">Mettre à jour le statut</h3>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant={order.status === "pending" ? "default" : "outline"}
                                onClick={() => handleUpdateStatus(order.id, "pending")}
                                disabled={order.status === "pending"}
                              >
                                En attente
                              </Button>
                              <Button 
                                size="sm" 
                                variant={order.status === "processing" ? "default" : "outline"}
                                onClick={() => handleUpdateStatus(order.id, "processing")}
                                disabled={order.status === "processing"}
                              >
                                En préparation
                              </Button>
                              <Button 
                                size="sm" 
                                variant={order.status === "shipped" ? "default" : "outline"}
                                onClick={() => handleUpdateStatus(order.id, "shipped")}
                                disabled={order.status === "shipped"}
                              >
                                <Truck size={16} className="mr-1" /> Expédiée
                              </Button>
                              <Button 
                                size="sm" 
                                variant={order.status === "delivered" ? "default" : "outline"}
                                className={order.status === "delivered" ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={() => handleUpdateStatus(order.id, "delivered")}
                                disabled={order.status === "delivered"}
                              >
                                <Check size={16} className="mr-1" /> Livrée
                              </Button>
                              <Button 
                                size="sm" 
                                variant={order.status === "canceled" ? "default" : "outline"}
                                className={order.status === "canceled" ? "bg-red-600 hover:bg-red-700" : ""}
                                onClick={() => handleUpdateStatus(order.id, "canceled")}
                                disabled={order.status === "canceled"}
                              >
                                <X size={16} className="mr-1" /> Annulée
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {isAdmin && (
                          <div className="mt-4 flex justify-end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <X size={16} className="mr-1" /> Supprimer la commande
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement la commande
                                    et la facture associée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommandesPage;
