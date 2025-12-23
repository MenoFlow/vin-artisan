
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schéma de validation pour le formulaire de cuvée
const cuveeFormSchema = z.object({
  nom: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  annee: z.string()
    .regex(/^\d{4}$/, { message: "L'année doit être au format YYYY" })
    .refine((val) => parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear(), {
      message: `L'année doit être entre 1900 et ${new Date().getFullYear()}`
    }),
  type: z.string().min(1, { message: "Veuillez sélectionner un type de vin" }),
  cepage: z.string().min(1, { message: "Veuillez spécifier le cépage" }),
  description: z.string().optional(),
  prix: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Le prix doit être un nombre valide (ex: 12.50)" }),
  stock: z.string()
    .regex(/^\d+$/, { message: "Le stock doit être un nombre entier" }),
});

type CuveeFormValues = z.infer<typeof cuveeFormSchema>;

interface CuveeFormProps {
  cuveeId?: string;
  defaultValues?: Partial<CuveeFormValues>;
  isEdit?: boolean;
  onSubmit: (data: CuveeFormValues) => Promise<void>;
}

const CuveeForm = ({
  cuveeId,
  defaultValues,
  isEdit = false,
  onSubmit,
}: CuveeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CuveeFormValues>({
    resolver: zodResolver(cuveeFormSchema),
    defaultValues: defaultValues || {
      nom: "",
      annee: new Date().getFullYear().toString(),
      type: "",
      cepage: "",
      description: "",
      prix: "",
      stock: "0",
    },
  });

  const handleSubmit = async (data: CuveeFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Appel de la fonction onSubmit fournie par le parent
      await onSubmit(data);
      
      navigate("/cuvees");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.", { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Modifier une cuvée" : "Ajouter une cuvée"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la cuvée*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Réserve Spéciale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="annee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de vin*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rouge">Rouge</SelectItem>
                        <SelectItem value="blanc">Blanc</SelectItem>
                        <SelectItem value="rose">Rosé</SelectItem>
                        <SelectItem value="petillant">Pétillant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cepage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cépage*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Merlot, Cabernet Sauvignon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de la cuvée..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€)*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 15.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock disponible*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" type="button">Annuler</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr de vouloir annuler ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Toutes les modifications non sauvegardées seront perdues.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuer l'édition</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate("/cuvees")}>
                    Quitter sans sauvegarder
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : isEdit ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CuveeForm;
