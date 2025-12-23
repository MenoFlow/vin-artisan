
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PackageOpen, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";

interface LocationState {
  orderId?: string;
}

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    const processOrder = () => {
      const pendingCart = localStorage.getItem('pendingCart');
      if (!pendingCart) {
        navigate('/catalogue');
        return;
      }

      try {
        const cart = JSON.parse(pendingCart);
        const state = location.state as LocationState;
        const newOrderId = state?.orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setOrderId(newOrderId);

        // Mise à jour des stocks
        const savedCuvees = localStorage.getItem('cuvees');
        if (savedCuvees) {
          const cuvees = JSON.parse(savedCuvees);
          cart.forEach((item: any) => {
            const cuveeIndex = cuvees.findIndex((c: any) => c.id === item.vin.id);
            if (cuveeIndex !== -1) {
              const newStock = parseInt(cuvees[cuveeIndex].stock) - item.quantite;
              cuvees[cuveeIndex].stock = String(newStock);
            }
          });
          localStorage.setItem('cuvees', JSON.stringify(cuvees));
        }

        // Création de la commande
        const order = {
          id: newOrderId,
          items: cart,
          total: cart.reduce((sum: number, item: any) => sum + (parseFloat(item.vin.prix) * item.quantite), 0),
          date: new Date().toISOString(),
          status: 'pending',
          clientId: localStorage.getItem('userId') || 'guest',
          clientName: localStorage.getItem('userName') || 'Client'
        };

        // Sauvegarde de la commande
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        // Sauvegarde dans les commandes du client
        const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
        clientOrders.push(order);
        localStorage.setItem('clientOrders', JSON.stringify(clientOrders));

        // Nettoyage du panier
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('cart');

        toast.success("Commande enregistrée avec succès!");
      } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);
        toast.error("Erreur lors du traitement de la commande");
      }
    };

    processOrder();
  }, [location.state, navigate]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-green-200">
        <CardHeader className="text-center pb-2 bg-green-50 text-green-800 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">Paiement effectué avec succès!</CardTitle>
          <CardDescription className="text-green-700 font-medium mt-2">
            Votre commande a été reçue et sera traitée rapidement.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {orderId ? (
            <div className="text-center mb-4">
              <p className="text-gray-600">Numéro de commande</p>
              <p className="text-xl font-semibold">{orderId}</p>
            </div>
          ) : (
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Votre commande a été enregistrée
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-green-100 mr-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Commande validée</h3>
                  <p className="text-sm text-muted-foreground">Votre commande a été reçue</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-gray-100 mr-3">
                  <PackageOpen className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">En préparation</h3>
                  <p className="text-sm text-muted-foreground">Votre commande est en cours de préparation</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                En attente
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-gray-100 mr-3">
                  <Truck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Expédition</h3>
                  <p className="text-sm text-muted-foreground">Votre commande sera bientôt expédiée</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                À venir
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => navigate("/commandes")}
          >
            Voir mes commandes
          </Button>
          <Button 
            className="w-full sm:w-auto"
            onClick={() => navigate("/catalogue")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuer vos achats
          </Button>
          
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
