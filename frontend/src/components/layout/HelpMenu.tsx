import { useToast } from "@/components/ui/use-toast";
import { useState, useRef  } from "react";
import { HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAuth } from "@/contexts/AuthContext";

const HelpMenu = () => {
  const { toast } = useToast();
  const { isAdmin } = useRoleAccess();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");

  const messageRef = useRef<HTMLTextAreaElement>(null);
    const { user } = useAuth();
    

    const handleSendMessage = async () => {
      try {
        const payload = {
          email: user.email, // si l'utilisateur est connecté
          message,
        };
    
        const userId = user?.id || ""; // si user connecté, sinon vide
    
        const res = await fetch(`https://vinexpert-backend.vercel.app/api/admin_messages/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    
        if (!res.ok) throw new Error("Erreur lors de l'envoi du message");
        toast({
          variant: "success",
          title: "Message envoyé",
          description: "Votre message a bien été transmis à l’administrateur.",
        });
        
        setMessage("");
        setContactOpen(false);
      } catch (err) {
        console.error("Erreur front :", err);
      }
    };
    

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full justify-start"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Aide</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Centre d'aide VinExpert</DialogTitle>
          <DialogDescription>
            Guide complet d'utilisation de la plateforme VinExpert
          </DialogDescription>
        </DialogHeader>

        {/* ===================== Tabs avec Support en premier ===================== */}
        <Tabs defaultValue={isAdmin ? "admin" : "client"} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-background z-10 border-b border-border">
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="admin" disabled={!isAdmin}>
              Administrateur
            </TabsTrigger>
          </TabsList>

          {/* ----------------- Contenu Support ----------------- */}
          <TabsContent value="support" className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Contacter l'administrateur</h3>
              {
                isAdmin ? (
                  <p className="text-muted-foreground mb-2">
                    Fonctionnalité désactivé pour l'administrateur.
                  </p>
                ) : (
                  <p className="text-muted-foreground mb-2">
                    Vous pouvez envoyer un message à l'administrateur pour toute question ou problème.
                  </p>
                )
              }

              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button disabled={isAdmin} variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail size={16} /> Envoyer un message
                  </Button>
                </DialogTrigger>

                <DialogContent
                  className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto"
                  onOpenAutoFocus={(e) => {
                    e.preventDefault();              // annule le blocage par défaut
                    // petit rafraîchissement pour laisser le contenu se monter
                    requestAnimationFrame(() => messageRef.current?.focus());
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Contacter l’administrateur</DialogTitle>
                    <DialogDescription>
                      Expliquez votre problème ou question, l’administrateur vous répondra rapidement.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    {/* Email en lecture seule */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Votre email</label>
                      <Input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    {/* Zone de message */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Votre message</label>
                      <Textarea
                        placeholder="Écrivez votre message ici..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[200px]"
                        ref={messageRef}         // <-- important
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setContactOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSendMessage}>Envoyer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* ----------------- Contenu Client ----------------- */}
          <TabsContent value="client" className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Navigation</h3>
              <p className="text-muted-foreground">
                Utilisez la barre latérale pour accéder aux différentes sections de la plateforme. Vous pouvez la réduire/agrandir avec le bouton situé sur son bord droit pour avoir plus d'espace de travail.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Catalogue de produits</h3>
              <p className="text-muted-foreground">
                Parcourez notre sélection de vins dans la section Catalogue. Vous pouvez filtrer par type, cépage, millésime et prix pour trouver facilement ce que vous cherchez.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Commander des produits</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Accédez au catalogue de produits</li>
                <li>Sélectionnez les produits qui vous intéressent</li>
                <li>Ajoutez-les à votre panier</li>
                <li>Vérifiez votre panier et ajustez les quantités si nécessaire</li>
                <li>Passez à la caisse et choisissez votre mode de livraison</li>
                <li>Procédez au paiement sécurisé</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Suivi de commande</h3>
              <p className="text-muted-foreground">
                Vous pouvez suivre l'état de vos commandes dans la section "Commandes" de votre tableau de bord. Différents statuts vous indiqueront où en est le traitement de votre commande :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li><span className="font-medium">En attente</span> - Votre commande a été reçue</li>
                <li><span className="font-medium">Traitée</span> - Votre commande est en cours de préparation</li>
                <li><span className="font-medium">Expédiée</span> - Votre commande a été expédiée</li>
                <li><span className="font-medium">Livrée</span> - Votre commande a été livrée</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Gestion du profil</h3>
              <p className="text-muted-foreground">Dans la section "Profil", vous pouvez :</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Mettre à jour vos informations personnelles</li>
                <li>Gérer vos adresses de livraison</li>
                <li>Consulter l'historique de vos commandes</li>
                <li>Modifier votre mot de passe</li>
              </ul>
            </div>
          </TabsContent>

          {/* ----------------- Contenu Admin ----------------- */}
          <TabsContent value="admin" className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Tableau de bord</h3>
              <p className="text-muted-foreground">
                Le tableau de bord vous donne une vue d'ensemble de votre activité avec des indicateurs clés de performance, des graphiques de ventes et une liste des actions prioritaires.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Gestion des cuvées</h3>
              <p className="text-muted-foreground">La section "Cuvées" vous permet de :</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Ajouter de nouvelles cuvées au catalogue</li>
                <li>Modifier les informations et les prix des produits existants</li>
                <li>Gérer les niveaux de stock et définir des alertes</li>
                <li>Archiver les produits épuisés ou hors saison</li>
                <li>Organiser les produits par catégories et collections</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Traitement des commandes</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Visualisez les nouvelles commandes dans la section "Commandes"</li>
                <li>Vérifiez la disponibilité des produits en stock</li>
                <li>Validez la commande pour lancer la préparation</li>
                <li>Générez les documents d'expédition et les factures</li>
                <li>Marquez la commande comme expédiée une fois l'envoi effectué</li>
                <li>Suivez les livraisons et gérez les retours si nécessaire</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Factures</h3>
              <p className="text-muted-foreground">La section "Factures" vous permet de :</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Générer des factures pour chaque commande</li>
                <li>Suivre les paiements et les relances</li>
                <li>Exporter les données comptables</li>
                <li>Générer des rapports financiers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Gestion de la production</h3>
              <p className="text-muted-foreground">Utilisez la section "Production" pour :</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Planifier les cycles de production viticole</li>
                <li>Suivre les étapes de la vinification</li>
                <li>Enregistrer les analyses et les contrôles qualité</li>
                <li>Gérer les stocks de matières premières et de produits finis</li>
                <li>Optimiser les ressources et les processus</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">Paramètres administratifs</h3>
              <p className="text-muted-foreground">
                Dans la section "Paramètres", en tant qu'administrateur, vous pouvez également :
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Gérer les comptes utilisateurs et leurs permissions</li>
                <li>Paramétrer les options d'expédition et de paiement</li>
                <li>Activer ou désactiver des fonctionnalités</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HelpMenu;
