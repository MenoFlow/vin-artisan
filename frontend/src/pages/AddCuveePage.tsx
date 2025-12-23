
import { toast } from "sonner";
import CuveeForm from "@/components/cuvees/CuveeForm";

const AddCuveePage = () => {
  const addCuvee = async (cuveeData: any) => {
   
    try {
      const response = await fetch('https://vinexpert-backend.vercel.app/api/cuvees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuveeData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }
      
      const data = await response.json();
      toast.success("Cuvée ajoutée avec succès");
      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de l'ajout de la cuvée");
      throw error;
    }
  };

  return <CuveeForm onSubmit={addCuvee} />;
};

export default AddCuveePage;
