
import { Link } from "react-router-dom";
import { Edit, Trash2, Wine } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CuveeCardProps {
  id: string;
  nom: string;
  annee: string;
  type: string;
  cepage: string;
  prix: string;
  stock: string;
  image?: string;
  onDelete: (id: string) => void;
}

const CuveeCard = ({
  id,
  nom,
  annee,
  type,
  cepage,
  prix,
  stock,
  image,
  onDelete,
}: CuveeCardProps) => {
  const handleDelete = () => {
    onDelete(id);
    toast.success("Cuvée supprimée avec succès");
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

  const getStockStatus = (stock: string) => {
    const stockNumber = parseInt(stock);
    if (stockNumber <= 0) return { text: "Épuisé", class: "bg-red-100 text-red-800" };
    if (stockNumber < 10) return { text: "Stock faible", class: "bg-orange-100 text-orange-800" };
    return { text: "En stock", class: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus(stock);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{nom} {annee}</CardTitle>
          <Wine size={20} className="text-wine" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={getTypeColor(type)}>
            {type}
          </Badge>
          <Badge variant="outline">{cepage}</Badge>
          <Badge variant="outline" className={stockStatus.class}>
            {stockStatus.text}
          </Badge>
        </div>
        <p className="text-xl font-bold text-wine mb-2">{prix} €</p>
        <p className="text-sm text-gray-500">Stock: {stock} bouteilles</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/cuvees/modifier/${id}`}>
            <Edit size={16} className="mr-1" /> Modifier
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className=" text-destructive">
              <Trash2 size={16} className="mr-1" /> Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette cuvée ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La cuvée "{nom} {annee}" sera définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default CuveeCard;
