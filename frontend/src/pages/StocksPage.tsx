
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  category: "Contenants" | "Fournitures" | "Produits finis";
}

interface StockFormValues {
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  category: "Contenants" | "Fournitures" | "Produits finis";
}

const StocksPage = () => {
  const [stocks, setStocks] = useState<StockItem[]>([
    {
      id: "1",
      name: "Bouteilles 75cl",
      quantity: 1200,
      unit: "unités",
      minStock: 500,
      maxStock: 2000,
      category: "Contenants",
    },
    {
      id: "2",
      name: "Bouchons en liège",
      quantity: 2500,
      unit: "unités",
      minStock: 1000,
      maxStock: 5000,
      category: "Fournitures",
    },
    {
      id: "3",
      name: "Étiquettes Cuvée Excellence",
      quantity: 850,
      unit: "unités",
      minStock: 300,
      maxStock: 1000,
      category: "Fournitures",
    },
    {
      id: "4",
      name: "Cuvée Excellence 2023",
      quantity: 450,
      unit: "bouteilles",
      minStock: 0,
      maxStock: 1000,
      category: "Produits finis",
    },
  ]);

  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const form = useForm<StockFormValues>({
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "unités",
      minStock: 0,
      maxStock: 100,
      category: "Fournitures",
    }
  });

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      maxStock: item.maxStock,
      category: item.category,
    });
    setDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setStocks(stocks.filter(item => item.id !== itemToDelete));
      toast.success("Article supprimé du stock");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAddOrUpdateItem = (values: StockFormValues) => {
    if (editingItem) {
      // Mise à jour
      setStocks(stocks.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...values } 
          : item
      ));
      toast.success(`${values.name} a été mis à jour`);
    } else {
      // Ajout
      const newItem: StockItem = {
        ...values,
        id: `${Date.now()}`, // Génère un ID unique
      };
      setStocks([...stocks, newItem]);
      toast.success(`${values.name} a été ajouté au stock`);
    }
    setDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      quantity: 0,
      unit: "unités",
      minStock: 0,
      maxStock: 100,
      category: "Fournitures",
    });
    setDialogOpen(true);
  };

  const getStockStatus = (item: StockItem) => {
    const stockLevel = (item.quantity - item.minStock) / (item.maxStock - item.minStock) * 100;
    if (item.quantity <= item.minStock) return "danger";
    if (stockLevel < 30) return "warning";
    return "success";
  };

  const groupedStocks = stocks.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<StockItem["category"], StockItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
        <Button onClick={openAddDialog}>
          <Plus size={18} className="mr-2" /> Ajouter un article
        </Button>
      </div>
      
      {Object.entries(groupedStocks).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((stock) => {
              const status = getStockStatus(stock);
              const stockLevel = (stock.quantity / stock.maxStock) * 100;
              
              return (
                <Card key={stock.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">{stock.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">
                            {stock.quantity} {stock.unit}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            status === "danger" ? "bg-red-100 text-red-800" :
                            status === "warning" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          )}>
                            {status === "danger" ? "Stock critique" :
                             status === "warning" ? "Stock bas" :
                             "Stock normal"}
                          </span>
                        </div>
                        <Progress value={stockLevel} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Min: {stock.minStock}</span>
                          <span>Max: {stock.maxStock}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditItem(stock)}
                    >
                      <Edit size={16} className="mr-1" /> Modifier
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteItem(stock.id)}
                    >
                      <Trash size={16} className="mr-1" /> Supprimer
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Dialog pour ajouter/modifier un article */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Modifier ${editingItem.name}` : "Ajouter un article en stock"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Modifier les informations de l'article en stock" 
                : "Remplir le formulaire pour ajouter un nouvel article en stock"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleAddOrUpdateItem)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nom</label>
                  <Input 
                    id="name"
                    {...form.register("name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Catégorie</label>
                  <select 
                    className="w-full p-2 border rounded"
                    id="category"
                    {...form.register("category")}
                    required
                  >
                    <option value="Contenants">Contenants</option>
                    <option value="Fournitures">Fournitures</option>
                    <option value="Produits finis">Produits finis</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium">Quantité</label>
                    <Input 
                      id="quantity"
                      type="number"
                      {...form.register("quantity", { valueAsNumber: true })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="unit" className="text-sm font-medium">Unité</label>
                    <Input 
                      id="unit"
                      {...form.register("unit")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="minStock" className="text-sm font-medium">Stock minimum</label>
                    <Input 
                      id="minStock"
                      type="number"
                      {...form.register("minStock", { valueAsNumber: true })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="maxStock" className="text-sm font-medium">Stock maximum</label>
                    <Input 
                      id="maxStock"
                      type="number"
                      {...form.register("maxStock", { valueAsNumber: true })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {editingItem ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article du stock ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StocksPage;
