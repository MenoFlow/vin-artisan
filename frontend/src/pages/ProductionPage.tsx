
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash, Calendar, ChevronRight, ChevronDown, Clock } from "lucide-react";

// Types
export interface ProductionStep {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  duration: number;
  startDate?: string;
  endDate?: string;
}

export interface Production {
  id: string;
  name: string;
  status: "En cours" | "planifié" | "Terminé";
  startDate: string;
  endDate: string;
  currentStep: string;
  progress: number;
  steps: ProductionStep[];
  description?: string;
}

interface ProductionFormValues {
  name: string;
  status: "En cours" | "planifié" | "Terminé";
  startDate: string;
  endDate: string;
  description: string;
}

interface StepFormValues {
  name: string;
  status: "pending" | "in-progress" | "completed";
  duration: number;
  startDate?: string;
  endDate?: string;
}

const ProductionPage = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [productionSteps, setProductionSteps] = useState<Production[]>([]);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [expandedProduction, setExpandedProduction] = useState<string | null>(null);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{productionId: string, step: ProductionStep | null}>({
    productionId: "",
    step: null
  });
 const url = 'https://vinexpert-backend.vercel.app';

  const fetchProduction = async () => {
    const response = await fetch(url+'/api/productions', {
      method: 'GET'
    });
    let data = await response.json();

    setProductions(data);
  }

  const fetchProductionSteps = async () => {
    const response = await fetch('https://vinexpert-backend.vercel.app/api/production/steps', {
      method: 'GET'
    });
    const data = await response.json();

    setProductionSteps(data);
  }
  useEffect(() => {
    fetchProduction();
    fetchProductionSteps();
  }, []);

  useEffect(() => {
    localStorage.setItem('productions', JSON.stringify(productions));
  }, [productions]);

  

  const form = useForm<ProductionFormValues>({
    defaultValues: {
      name: "",
      status: "planifié",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
    }
  });
  

  const filterProductionSteps = (productionId: String, productionStepsArray: any) : any => {
    const productionStepsFiltered = productionStepsArray.filter((productionStep) => (productionStep.production_id === productionId))
    return productionStepsFiltered;
  }

  const stepForm = useForm<StepFormValues>({
    defaultValues: {
      name: "",
      status: "pending",
      duration: 7,
      startDate: "",
      endDate: "",
    }
  });
  const startDate = stepForm.watch("startDate");
  const endDate = stepForm.watch("endDate");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  
      stepForm.setValue("duration", diffDays);
    }
  }, [startDate, endDate, stepForm]);
  

  const handleEditProduction = (production: Production) => {
    setEditingProduction(production);
    form.reset({
      name: production.name,
      status: production.status,
      startDate: production.startDate
        ? new Date(production.startDate).toISOString().split("T")[0]
        : "",
      endDate: production.endDate
        ? new Date(production.endDate).toISOString().split("T")[0]
        : "",
      description: production.description || "",
    });
    
    setDialogOpen(true);
  };

  const handleDeleteProduction = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setProductions(productions?.filter(p => p.id !== itemToDelete));
      toast.success("Production supprimée");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      fetch('https://vinexpert-backend.vercel.app/api/productions/' + itemToDelete, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        return response.json();
      })
      .then(() => {
        toast.success("Production supprimée avec succès");
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de la suppression de la production");
      });
    }
  };
  const handleAddOrUpdateProduction = (values: ProductionFormValues) => {
    const start = new Date(values.startDate);
    const end = new Date(values.endDate);
  
    // Vérification des dates
    if (start > end) {
      toast.error("La date de début ne peut pas être après la date de fin.");
      return;
    }
  
    if (editingProduction) {
      // --- Mise à jour ---
      setProductions(productions?.map(p => 
        p.id === editingProduction.id 
          ? { 
              ...p, 
              ...values,
            } 
          : p
      ));
  
      fetch(`https://vinexpert-backend.vercel.app/api/productions/${editingProduction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        return response.json();
      })
      .then(() => {
        toast.success(`${values.name} a été mis à jour avec succès`);
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de la mise à jour de la production");
      });
  
    } else {
      // --- Ajout ---
      const newProduction: Production = {
        ...values,
        id: `${Date.now()}`,
        currentStep: "Pas démarré",
        progress: 0,
        steps: [],
      };
  
      setProductions([...productions, newProduction]);
      setExpandedProduction(newProduction.id);
      
      fetch('https://vinexpert-backend.vercel.app/api/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduction)
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la création');
        return response.json();
      })
      .then((data) => {
        toast.success(`${values.name} a été ajouté avec succès`);
        setExpandedProduction(data.id);
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de la création de la production");
      });
    }
  
    setDialogOpen(false);
    setEditingProduction(null);
    form.reset();
  };
  

  const handleAddOrUpdateStep = (values: StepFormValues) => {
    const { productionId, step } = editingStep;
    const production = productions?.find(p => p.id === productionId);
  
    if (production) {
      const prodStart = new Date(production.startDate);
      const prodEnd = new Date(production.endDate);
      const stepStart = values.startDate ? new Date(values.startDate) : null;
      const stepEnd = values.endDate ? new Date(values.endDate) : null;
  
      // Vérifications
      if (stepStart && stepStart < prodStart) {
        toast.error("La date de début de l'étape doit être après ou égale à la date de début de la production.");
        return;
      }
  
      if (stepEnd && stepEnd > prodEnd) {
        toast.error("La date de fin de l'étape doit être avant ou égale à la date de fin de la production.");
        return;
      }
  
      if (stepStart && stepEnd && stepEnd < stepStart) {
        toast.error("La date de fin de l'étape doit être après ou égale à la date de début de l'étape.");
        return;
      }
    }

    if (step) {

      fetch(`${url}/api/productions/${productionId}/steps/${step.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        return response.json();
      })
      .then(() => {
        fetchProductionSteps();
        toast.success("Étape mise à jour avec succès");
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de la mise à jour de l'étape");
      });
  
    } else {
      // --- Ajout d'une étape ---
      const newStep: ProductionStep = {
        ...values,
        id: `${productionId}-${Date.now()}`,
      };

  
      fetch(`${url}/api/productions/${productionId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStep)
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la création');
        return response.json();
      })
      .then(() => {
        fetchProductionSteps();
        toast.success("Nouvelle étape ajoutée avec succès");
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de l'ajout de l'étape");
      });
    }
  
    fetchProductionSteps();
    setStepDialogOpen(false);
    stepForm.reset();
  };
  

  const handleEditStep = (productionId: string, step: ProductionStep) => {
    setEditingStep({ productionId, step });
  
    stepForm.reset({
      name: step.name,
      status: step.status,
      duration: step.duration,
      startDate: step.startDate ? new Date(step.startDate).toISOString().split("T")[0] : "",
      endDate: step.endDate ? new Date(step.endDate).toISOString().split("T")[0] : "",
    });
  
    setStepDialogOpen(true);
  };

  const handleAddStep = (productionId: string) => {
    const production = productions?.find(p => p.id === productionId);
  
    setEditingStep({ productionId, step: null });
    stepForm.reset({
      name: "",
      status: "pending",
      duration: 7,
      startDate: production ? production.startDate : "",
      endDate: production ? production.endDate : "",
    });
  
    setStepDialogOpen(true);
  };

  const handleDeleteStep = (productionId: string, stepId: string) => {

    fetch(`${url}/api/productions/${productionId}/steps/${stepId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    })
    .then(() => {
    fetchProductionSteps();
      toast.success("Étape supprimée avec succès");
    })
    .catch(error => {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression de l'étape");
    });
  };

  const openAddDialog = () => {
    setEditingProduction(null);
    form.reset({
      name: "",
      status: "planifié",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
    })
    setDialogOpen(true);
  };

  // Calculer le pourcentage de progression
  const calculateProgress = (steps: ProductionStep[]): number => {
    if (steps.length === 0) return 0;
    
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === "completed").length;
    const inProgressSteps = steps.filter(s => s.status === "in-progress").length;
    
    return Math.round(((completedSteps + inProgressSteps * 0.5) / totalSteps) * 100);
  };

  // Déterminer l'étape actuelle
  const getCurrentStep = (steps: ProductionStep[]): string => {
    const inProgress = steps.find(s => s.status === "in-progress");
    if (inProgress) return inProgress.name;
    
    const pending = steps.find(s => s.status === "pending");
    if (pending) return "Prochaine: " + pending.name;
    
    if (steps.length > 0 && steps.every(s => s.status === "completed")) {
      return "Terminé";
    }
    
    return "Pas démarré";
  };

  // Mettre à jour les productions avec les calculs
  const updatedProductions = productions?.map(prod => {
    const filteredSteps = filterProductionSteps(prod.id, productionSteps)
    return {
      ...prod,
      progress: calculateProgress(filteredSteps),
      currentStep: getCurrentStep(filteredSteps)
    };
  });

  // Trier les étapes par status: in-progress, pending, completed
  const sortSteps = (steps: ProductionStep[]): ProductionStep[] => {
    return [...steps].sort((a, b) => {
      const statusOrder = { "in-progress": 0, "pending": 1, "completed": 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };
  const currentProduction = productions?.find(p => p.id === editingStep.productionId);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suivi de Production</h1>
        <Button onClick={openAddDialog}>
          <Plus size={18} className="mr-2" /> Nouvelle production
        </Button>
      </div>
      
      <div className="grid gap-6">
        {updatedProductions.map((production) => {
          let productionStepsData = filterProductionSteps(production.id, productionSteps);
          return (
          <Card key={production.id} className="overflow-hidden">
            <CardHeader className="cursor-pointer" onClick={() => setExpandedProduction(expandedProduction === production.id ? null : production.id)}>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <div className="inline-block animate-bounce">
                    {expandedProduction === production.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  {production.name}
                </CardTitle>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm",
                  production.status === "En cours" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                  production.status === "planifié" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                )}>
                  {production.status}
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression globale</span>
                    <span>{production.progress}%</span>
                  </div>
                  <Progress value={production.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar size={14} /> 
                      <span className="font-semibold">Période:</span> 
                      {new Date(production.startDate).toLocaleDateString('fr-FR')} 
                      &nbsp;-&nbsp; 
                      {new Date(production.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      <span className="font-semibold">Étape actuelle:</span> {production.currentStep}
                    </p>
                  </div>
                  
                  {production.description && (
                    <div className="text-sm">
                      <p><span className="font-semibold">Description:</span></p>
                      <p className="text-muted-foreground">{production.description}</p>
                    </div>
                  )}
                </div>
                
                {expandedProduction === production.id && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">Étapes de production</h4>
                      <Button variant="outline" size="sm" onClick={() => handleAddStep(production.id)}>
                        <Plus size={16} className="mr-1" /> Ajouter une étape
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {productionStepsData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune étape définie. Ajoutez des étapes pour suivre la progression.</p>
                      ) : (
                        sortSteps(productionStepsData).map((step) => (
                          <div key={step.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                step.status === "completed" ? "bg-green-500" :
                                step.status === "in-progress" ? "bg-blue-500" :
                                "bg-gray-300"
                              )} />
                              <div>
                                <p className="font-medium">{step.name}</p>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar size={12} />
                                  {step.status === "completed" ? "Terminé" : 
                                   step.status === "in-progress" ? "En cours" : 
                                   "À venir"} 
                                  {step.duration && ` • Durée: ${step.duration} jours`}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStep(production.id, step);
                                }}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStep(production.id, step.id);
                                }}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProduction(production);
                }}
              >
                <Edit size={16} className="mr-1" /> Modifier
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProduction(production.id);
                }}
              >
                <Trash size={16} className="mr-1" /> Supprimer
              </Button>
            </CardFooter>
          </Card>
        )})}

        {productions?.length === 0 && (
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Aucune production n'est définie. Commencez par créer une nouvelle production.</p>
            <Button className="mt-4" onClick={openAddDialog}>
              <Plus size={18} className="mr-2" /> Nouvelle production
            </Button>
          </div>
        )}
      </div>

      {/* Dialog pour ajouter/modifier une production */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduction ? `Modifier ${editingProduction.name}` : "Nouvelle production"}
            </DialogTitle>
            <DialogDescription>
              {editingProduction 
                ? "Modifier les informations de production" 
                : "Remplir le formulaire pour créer une nouvelle production"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleAddOrUpdateProduction)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nom de la production</label>
                  <Input 
                    id="name"
                    {...form.register("name")}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">Statut</label>
                  <select 
                    className="w-full p-2 border rounded"
                    id="status"
                    {...form.register("status")}
                    required
                    
                  >
                    <option value="planifié">planifié</option>
                    <option value="en cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Date de début</label>
                    <Input 
                      id="startDate"
                      type="date"
                      {...form.register("startDate")}
                      max={form.watch("endDate")} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">Date de fin</label>
                    <Input 
                      id="endDate"
                      type="date"
                      {...form.register("endDate")}
                      min={form.watch("startDate")} 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea 
                    id="description"
                    {...form.register("description")}
                    rows={3}
                  />
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
                {editingProduction ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une étape */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStep.step ? `Modifier l'étape` : "Ajouter une étape"}
            </DialogTitle>
            <DialogDescription>
              {editingStep.step 
                ? `Modifier les détails de l'étape ${editingStep.step.name}` 
                : "Ajouter une nouvelle étape à la production"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={stepForm.handleSubmit(handleAddOrUpdateStep)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="stepName" className="text-sm font-medium">Nom de l'étape</label>
                  <Input 
                    id="stepName"
                    {...stepForm.register("name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="stepStatus" className="text-sm font-medium">Statut</label>
                  <select 
                    className="w-full p-2 border rounded"
                    id="stepStatus"
                    {...stepForm.register("status")}
                    required
                  >
                    <option value="pending">À venir</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="stepDuration" className="text-sm font-medium">Durée en jours (Calcul automatique))</label>
                  <Input 
                    id="stepDuration"
                    type="number"
                    {...stepForm.register("duration", { valueAsNumber: true })}
                    min="1"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="stepStartDate" className="text-sm font-medium">Date de début</label>
                    <Input 
                      id="stepStartDate"
                      type="date"
                      {...stepForm.register("startDate")}
                      min={currentProduction?.startDate}
                      max={currentProduction?.endDate && stepForm.watch("endDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="stepEndDate" className="text-sm font-medium">Date de fin</label>
                    <Input 
                      id="stepEndDate"
                      type="date"
                      {...stepForm.register("endDate")}
                      min={currentProduction?.startDate && stepForm.watch("startDate")}
                      max={currentProduction?.endDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStepDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {editingStep.step ? "Mettre à jour" : "Ajouter"}
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
              Êtes-vous sûr de vouloir supprimer cette production ? Toutes les étapes associées seront également supprimées. Cette action est irréversible.
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
export default ProductionPage;