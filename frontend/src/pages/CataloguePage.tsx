import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { toast } from "sonner";

interface Vin {
  id: string;
  nom: string;
  annee: string;
  type: string;
  cepage: string;
  prix: string;
  description: string;
  stock: string;
  image?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CataloguePage = () => {
  const [vins, setVins] = useState<Vin[]>([]);
  const [filtreType, setFiltreType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [trierPar, setTrierPar] = useState<string>("nom-asc");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { user } = useAuth();
  const { isAdmin } = useRoleAccess();
  const navigate = useNavigate();

  const loadWines = async () => {
    const response = await fetch('https://vinexpert-backend.vercel.app/api/cuvees', {
      method: 'GET'
    });
    const data = await response.json();
    const savedCuvees = data;
    if (savedCuvees) {
      try {
        const parsedCuvees = data;
        setVins(parsedCuvees);
      } catch (error) {
        console.error("Erreur lors du chargement des cuvées:", error);
        setVins([]);
      }
    }
  };
  useEffect(() => {

    
    loadWines();
    
    const initialQuantities: Record<string, number> = {};
    vins.forEach(vin => {
      initialQuantities[vin.id] = 1;
    });
    setQuantities(initialQuantities);
    
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }
  }, []);

  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    vins.forEach(vin => {
      initialQuantities[vin.id] = 1;
    });
    setQuantities(initialQuantities);
  }, [vins]);

  const vinsFiltered = vins.filter((vin) => {
    const matchType = filtreType ? (filtreType === "all" ? true : vin.type.toLowerCase() === filtreType.toLowerCase()) : true;
    const matchSearch = searchTerm
      ? vin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vin.cepage.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchType && matchSearch;
  });

  const vinsSorted = [...vinsFiltered].sort((a, b) => {
    switch (trierPar) {
      case "nom-asc":
        return a.nom.localeCompare(b.nom);
      case "nom-desc":
        return b.nom.localeCompare(a.nom);
      case "prix-asc":
        return parseFloat(a.prix) - parseFloat(b.prix);
      case "prix-desc":
        return parseFloat(b.prix) - parseFloat(a.prix);
      case "annee-desc":
        return parseInt(b.annee) - parseInt(a.annee);
      case "annee-asc":
        return parseInt(a.annee) - parseInt(b.annee);
      default:
        return 0;
    }
  });

  const handleQuantityChange = (vinId: string, change: number) => {
    setQuantities(prev => {
      const currentQty = prev[vinId] || 1;
      const vin = vins.find(v => v.id === vinId);
      const stockLimit = vin ? parseInt(vin.stock) : 0;
      
      let newQty = currentQty + change;
      if (newQty < 1) newQty = 1;
      if (newQty > stockLimit) newQty = stockLimit;
      
      return { ...prev, [vinId]: newQty };
    });
  };

  const handleAddToCart = (vin: Vin) => {
    const quantity = quantities[vin.id] || 1;
    const stockAvailable = parseInt(vin.stock);
    
    const cartItem: CartItem = {
      id: vin.id,
      name: `${vin.nom} ${vin.annee}`,
      price: parseFloat(vin.prix),
      quantity: quantity,
      image: vin.image || ""
    };
    
    const existingItemIndex = cart.findIndex(item => item.id === vin.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const totalQuantity = updatedCart[existingItemIndex].quantity + quantity;
      
      if (totalQuantity <= stockAvailable) {
        updatedCart[existingItemIndex].quantity = totalQuantity;
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success(`Quantité mise à jour: ${vin.nom} ${vin.annee} (${totalQuantity})`, {
          description: "Vous pouvez voir votre panier dans le coin supérieur droit"
        });
      } else {
        toast.error(`Stock insuffisant pour ${vin.nom}`, {
          description: `Seulement ${stockAvailable} bouteilles disponibles`
        });
      }
    } else {
      if (quantity <= stockAvailable) {
        const newCart = [...cart, cartItem];
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        toast.success(`${vin.nom} ${vin.annee} ajouté au panier`, {
          description: "Vous pouvez voir votre panier dans le coin supérieur droit"
        });
      } else {
        toast.error(`Stock insuffisant pour ${vin.nom}`, {
          description: `Seulement ${stockAvailable} bouteilles disponibles`
        });
      }
    }
  };

  const removeFromCart = (vinId: string) => {
    const updatedCart = cart.filter(item => item.id !== vinId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.info("Produit retiré du panier");
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    localStorage.setItem('pendingCart', JSON.stringify(cart));
    navigate('/payment');
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rouge':
        return 'bg-red-100 text-red-800';
      case 'blanc':
        return 'bg-yellow-100 text-yellow-800';
      case 'rose':
        return 'bg-pink-100 text-pink-800';
      case 'petillant':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catalogue des vins</h1>
        
        {!isAdmin && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Votre panier</SheetTitle>
                <SheetDescription>
                  Consultez les articles que vous avez ajoutés à votre panier.
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Votre panier est vide</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-3">
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <div className="h-12 w-12 rounded overflow-hidden">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <div className="flex items-center gap-3">
                              <span>{item.quantity} x {item.price.toFixed(2)}€</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromCart(item.id)}
                          >
                            &times;
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{getTotalPrice()}€</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <SheetFooter className="mt-6">
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full" 
                    disabled={cart.length === 0}
                    onClick={handleSubmitOrder}
                  >
                    Commander ({getTotalPrice()}€)
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">Continuer vos achats</Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un vin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filtreType} onValueChange={setFiltreType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de vin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="rouge">Rouge</SelectItem>
              <SelectItem value="blanc">Blanc</SelectItem>
              <SelectItem value="rose">Rosé</SelectItem>
              <SelectItem value="petillant">Pétillant</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={trierPar} onValueChange={setTrierPar}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nom-asc">Nom (A-Z)</SelectItem>
              <SelectItem value="nom-desc">Nom (Z-A)</SelectItem>
              <SelectItem value="prix-asc">Prix croissant</SelectItem>
              <SelectItem value="prix-desc">Prix décroissant</SelectItem>
              <SelectItem value="annee-desc">Millésime récent</SelectItem>
              <SelectItem value="annee-asc">Millésime ancien</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {vinsSorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun vin ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vinsSorted.map((vin) => (
            <Card key={vin.id} className="flex flex-col h-full overflow-hidden">
              {vin.image && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={vin.image} 
                    alt={vin.nom} 
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{vin.nom} {vin.annee}</CardTitle>
                  <Badge variant="outline" className={getTypeColor(vin.type)}>
                    {vin.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm mb-2">Cépage: {vin.cepage}</p>
                <p className="text-sm text-muted-foreground mb-4">{vin.description}</p>
                <p className="text-xl font-bold text-wine">{parseFloat(vin.prix).toFixed(2)} €</p>
                <div className="mt-2">
                  {parseInt(vin.stock) > 0 ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      En stock: {vin.stock} bouteilles
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      Épuisé
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {!isAdmin ? (
                  <div className="w-full space-y-2">
                    {parseInt(vin.stock) > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Quantité:</p>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={quantities[vin.id] <= 1}
                            onClick={() => handleQuantityChange(vin.id, -1)}
                          >
                            -
                          </Button>
                          <span className="mx-3">{quantities[vin.id] || 1}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={quantities[vin.id] >= parseInt(vin.stock)}
                            onClick={() => handleQuantityChange(vin.id, 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      disabled={parseInt(vin.stock) === 0}
                      onClick={() => handleAddToCart(vin)}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Ajouter au panier
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-yellow-600 italic text-center">
                      Fonction d'achat désactivée pour les administrateurs
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isAdmin && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full">
                <ShoppingBag size={18} className="mr-2" />
                Voir le panier ({cart.length}) - {getTotalPrice()}€
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Votre panier</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <div className="h-12 w-12 rounded overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-3">
                          <span>{item.quantity} x {item.price.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{getTotalPrice()}€</span>
                  </div>
                </div>
              </div>
              
              <SheetFooter className="mt-6">
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitOrder}
                  >
                    Commander ({getTotalPrice()}€)
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">Continuer vos achats</Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default CataloguePage;
