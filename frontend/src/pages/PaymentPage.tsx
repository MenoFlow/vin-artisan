import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Lock, Globe, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserCountryIsPartner } from "@/services/partnerCountriesService";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
// 
const PaymentPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationChecking, setLocationChecking] = useState(true);
  const [locationStatus, setLocationStatus] = useState<{
    isPartner: boolean;
    country?: { code: string; name: string };
    error?: string;
  } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Charger le panier depuis le localStorage
    const savedCart = localStorage.getItem("pendingCart");
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    setCart(parsedCart);
    
    // Calculer le total
    const cartTotal = parsedCart.reduce(
      (sum: number, item: CartItem) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotal(cartTotal);
    
    // Si le panier est vide, rediriger vers le catalogue
    if (parsedCart.length === 0) {
      toast.error("Votre panier est vide. Vous allez être redirigé vers le catalogue.");
      navigate("/catalogue");
    }
    
    // Vérifier la localisation
    checkLocation();
  }, [navigate]);
  
  const checkLocation = async () => {
    setLocationChecking(true);
    try {
      const result = await checkUserCountryIsPartner();
      setLocationStatus(result);

      if (result.error) {
        toast.warning("Impossible de vérifier votre localisation. Veuillez réessayer plus tard.");
      } else if (!result.isPartner) {
        toast.error(
          `Nous ne pouvons pas livrer dans votre pays (${result.country?.name}). Seuls les pays partenaires sont acceptés.`,
          { duration: 6000 }
        );
      }
    } catch (error) {
      console.error("Erreur de géolocalisation:", error);
      toast.error("Erreur lors de la vérification de votre localisation");
    } finally {
      setLocationChecking(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Enlever tous les espaces
    const v = value.replace(/\s+/g, "");
    // Ajouter un espace tous les 4 caractères
    return v.match(/.{1,4}/g)?.join(" ") || v;
  };

  const formatExpiryDate = (value: string) => {
    // Format MM/YY
    const cleanValue = value.replace(/[^\d]/g, "");
    if (cleanValue.length <= 2) return cleanValue;
    return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 16);
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d/]/g, "").substring(0, 5);
    setExpiryDate(formatExpiryDate(value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 3);
    setCvv(value);
  };

  const processPayment = () => {
    // Vérifier que le pays est un pays partenaire
    if (!locationStatus?.isPartner) {
      toast.error("Nous ne pouvons pas livrer dans votre pays. Seuls les pays partenaires sont acceptés.");
      return;
    }
    
    // Vérifier que tous les champs sont remplis
    if (!cardNumber || !cardName || !expiryDate || !cvv || !address) {
      toast.error("Veuillez remplir tous les champs du formulaire de paiement.");
      return;
    }

    // Simuler le traitement du paiement
    setLoading(true);
    setTimeout(() => {

      // Créer un nouvel ID de commande
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const totalBottle = cart.reduce((sum, cartItem) => 
        sum + cartItem.quantity, 0
      )
      // Sauvegarder la commande dans le localStorage
      const newOrder = {
        id: orderId,
        clientId: user?.id || 'guest',
        clientName: user?.name || 'Client',
        items: cart,
        total,
        date: new Date().toISOString(),
        status: 'pending',
        shippingAddress: address,
        country: locationStatus?.country?.code || 'N/A',
        quantity: totalBottle 
      };

      const handleOrderItems = async (cart) => {
        try{
          const clientId = user?.id;
          const response = await fetch('http://localhost:3000/api/order_items/' + clientId + '/' + orderId, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cart),
          });


        } catch (error) {
          console.error("Erreur API:", error);
          toast.error("Erreur lors de l'ajout des articles de commande");
          throw error;
        }
      }
          
    const handleOrders = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newOrder),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout');
        }
        
        const data = await response.json();
        toast.success("Commande ajoutée avec succès");

      // Créer une facture pour cette commande
      const newInvoice = {
        id: `FAC-${Date.now()}`,
        orderId: orderId,
        customerName: user?.name || 'Client',
        customerEmail: user?.email || 'email@example.com',
        totalAmount: total,
        status: "paid",
        items: cart.map(item => ({
          id: item.id,
          product: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        }))
      };
      
      //---------------------------------------------------------------------------------------------------------
      const response2 = await fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvoice),
      });
      
      if (!response2.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }
      
      const data2 = await response.json();
      toast.success("Facture ajoutée avec succès");
      
      //--------------------------------------------------------------------------------

      // Mettre à jour le stock des cuvées
      const savedCuvees = localStorage.getItem('cuvees');
      if (savedCuvees) {
        const parsedCuvees = JSON.parse(savedCuvees);
        cart.forEach(item => {
          const cuveeIndex = parsedCuvees.findIndex((c: any) => c.id === item.id);
          if (cuveeIndex !== -1) {
            parsedCuvees[cuveeIndex].stock -= item.quantity;
          }
        });
        localStorage.setItem('cuvees', JSON.stringify(parsedCuvees));
      }
      
      // Vider le panier
      localStorage.removeItem("pendingCart");
      
      // Ajouter une notification
      const notifications = localStorage.getItem('notifications') ? 
        JSON.parse(localStorage.getItem('notifications') || '[]') : [];
      notifications.push({
        id: Date.now(),
        type: 'order',
        message: `Nouvelle commande #${orderId.slice(0, 8)} effectuée par ${user?.name || 'Client'}`,
        date: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      // Rediriger vers la page de succès
      navigate("/payment-success", { state: { orderId } });
        return data;
      } catch (error) {
        console.error("Erreur API:", error);
        toast.error("Erreur lors de l'ajout de la commande");
        throw error;
      }
    }
    handleOrders();

    setTimeout(() => {
      cart.map((itemCart) => {
        setTimeout(() => {
          handleOrderItems(itemCart);
          toast.success("Création de l'article de commande avec succès");
        }, 1000)
      })
    }, 1500)

    setLoading(false);

    navigate("/catalogue");
    }, 2000);

  };

  return (
    <div className="max-w-3xl mx-auto py-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Paiement sécurisé</h1>
      
      {locationChecking ? (
        <div className="text-center py-8">
          <Globe className="animate-spin mx-auto h-12 w-12 mb-4 text-wine" />
          <p>Vérification de votre localisation...</p>
        </div>
      ) : locationStatus && !locationStatus.isPartner ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pays non desservi</AlertTitle>
          <AlertDescription>
            Nous sommes désolés, mais nous ne livrons pas actuellement dans votre pays 
            ({locationStatus.country?.name || 'Non détecté'}). 
            Seuls les clients des pays partenaires peuvent finaliser leur commande.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {locationStatus?.country && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <Globe className="h-4 w-4" />
              <AlertTitle>Livraison disponible</AlertTitle>
              <AlertDescription>
                Votre localisation ({locationStatus.country.name}) fait partie de nos pays partenaires. 
                Vous pouvez procéder au paiement.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Informations de paiement
                  </CardTitle>
                  <CardDescription>
                    Entrez les détails de votre carte bancaire pour compléter votre achat
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Transaction sécurisée</AlertTitle>
                    <AlertDescription>
                      Vos informations de paiement sont cryptées et sécurisées.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Adresse de livraison</Label>
                    <Input
                      id="address"
                      placeholder="123 rue Example, Ville"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="card-name">Nom sur la carte</Label>
                    <Input
                      id="card-name"
                      placeholder="JEAN DUPONT"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Numéro de carte</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Date d'expiration</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                        type="password"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={processPayment}
                    disabled={loading || !locationStatus?.isPartner}
                  >
                    {loading ? "Traitement en cours..." : `Payer ${total.toFixed(2)}€`}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.price?.toFixed(2) || "0.00"}€
                        </p>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg text-wine">{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentPage;
