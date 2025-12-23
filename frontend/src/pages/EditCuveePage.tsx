
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CuveeForm from "@/components/cuvees/CuveeForm";
import { toast } from "sonner";

const EditCuveePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cuveeData, setCuveeData] = useState({
    nom: "",
    annee: "",
    type: "",
    cepage: "",
    description: "",
    prix: "",
    stock: "",
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour charger les données de la cuvée
    const loadCuveeData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {

        try {
          const response = await fetch(import.meta.env.VITE_API_URL + `/api/cuvees/${id}`);
          if (!response.ok) {
            throw new Error('Cuvée introuvable');
          }
          const data = await response.json();
          setCuveeData({
            nom: data.nom || "",  
            annee: data.annee.toString() || "",
            type: data.type || "",
            cepage: data.cepage || "",
            description: data.description || "",
            prix: data.prix || "",
            stock: data.stock.toString() || "",
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error);
          toast.error("Erreur lors du chargement de la cuvée");
          navigate("/cuvees");
        }
        
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
        navigate("/cuvees");
      } finally {
        setLoading(false);
      }
    };
    
    loadCuveeData();
  }, [id, navigate]);
  
  // Fonction pour mettre à jour la cuvée
  const updateCuvee = async (cuveeData: any) => {

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/cuvees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuveeData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      const data = await response.json();
      toast.success("Cuvée mise à jour avec succès");
      return data;
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de la mise à jour de la cuvée");
      throw error;
    }
  };
  
  if (loading) {
    return <div className="text-center p-8">Chargement en cours...</div>;
  }
  
  return <CuveeForm 
    cuveeId={id} 
    defaultValues={cuveeData} 
    isEdit={true} 
    onSubmit={updateCuvee} 
  />;
};

export default EditCuveePage;
