
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generateInvoicePDF, fetchInvoices, fetchInvoiceItems, deleteInvoice } from "@/services/invoiceService";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface InvoiceItem {
  id: string;
  facture_id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "paid" | "pending";
  userId?: string;
}


const FacturesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filter, setFilter] = useState("all");
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    loadInvoices();
    loadInvoiceItems();
  }, []);
  
  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      try {
        const fetchedInvoices = await fetchInvoices();
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors du chargement des factures depuis l'API");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceItems = async () => {
    try {
      setLoading(true);
      
      try {
        const fetchedInvoices = await fetchInvoiceItems();
        setInvoiceItems(fetchedInvoices);
      } catch (error) {
        console.error('Erreur API:', error);
        toast.error("Erreur lors du chargement des factures depuis l'API");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      setLoading(true);
      setDownloadingId(invoice.id);
      
      // Make sure invoice is properly formatted with all required fields
      const formattedInvoice = {
        ...invoice,
        items: Array.isArray(invoiceItems) ? invoiceItems.filter((invoiceItem) => (invoiceItem.facture_id === invoice.id)).map(item => ({
          ...item,
          id: item.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          totalPrice: Number(item.totalPrice || item.unitPrice * item.quantity || 0),
          product: item.product || "Produit inconnu"
        })) : [],
        totalAmount: Number(invoice.totalAmount || 0),
        customerName: invoice.customerName || "Client",
        customerEmail: invoice.customerEmail || "email@example.com",
        dueDate: invoice.dueDate || new Date().toISOString(),
        date: invoice.date || new Date().toISOString()
      };
      generateInvoicePDF(formattedInvoice);
      toast.success("Facture téléchargée avec succès");

    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture", error);
      toast.error("Erreur lors du téléchargement de la facture");
    } finally {
      setLoading(false);
      setDownloadingId(null);
    }
  };
  
  const handleCreateInvoice = () => {
    // Cette fonction serait remplacée par un formulaire complet pour créer une facture
    toast.info("Cette fonctionnalité sera disponible prochainement");
    setShowNewInvoiceDialog(false);

  };

  const filteredInvoices = invoices
    .filter(invoice => {
      // Make sure we have customerName and id before trying to call toLowerCase()
      const nameMatch = invoice.customerName ? invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const idMatch = invoice.id ? invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      
      return (nameMatch || idMatch) && (filter === "all" || invoice.status === filter);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </div>
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-900">
              <SelectGroup>
                <SelectLabel>Statut</SelectLabel>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune facture trouvée</p>
        </div>
      ) : (
        <div className="grid gap-4 w-full max-w-full">
          {filteredInvoices.map((invoice) => {
            
            return (
            <Card key={invoice.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Facture #{invoice.id}</CardTitle>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                    {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Client</p>
                    <p className="text-sm">{invoice.customerName || "Client"}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customerEmail || "email@example.com"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dates</p>
                    <p className="text-sm">Émission: {invoice.date ? new Date(invoice.date).toLocaleDateString() : "N/A"}</p>
                    <p className="text-sm">Échéance: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Montant</p>
                    <p className="text-xl font-bold text-wine">{Number(invoice.totalAmount).toFixed(2)} €</p>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <p className="text-sm font-semibold mb-2">Détails</p>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th scope="col" className="px-4 py-2">Produit</th>
                          <th scope="col" className="px-4 py-2 text-center">Quantité</th>
                          <th scope="col" className="px-4 py-2 text-right">Prix unitaire</th>
                          <th scope="col" className="px-4 py-2 text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(invoiceItems) && invoiceItems.filter((invoiceItem) => (invoiceItem.facture_id === invoice.id)).map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-2">{item.product}</td>
                            <td className="px-4 py-2 text-center">{Number(item.quantity).toString()}</td>
                            <td className="px-4 py-2 text-right">{Number(item.unitPrice).toFixed(2)} €</td>
                            <td className="px-4 py-2 text-right font-medium">{Number(item.totalPrice).toFixed(2)} €</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="px-4 py-2" colSpan={3}>Total</td>
                          <td className="px-4 py-2 text-right">{Number(invoice.totalAmount).toFixed(2)} €</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleDownloadInvoice(invoice)}
                      disabled={loading && downloadingId === invoice.id}
                    >
                      <Download className="h-4 w-4" />
                      {loading && downloadingId === invoice.id ? "Génération en cours..." : "Télécharger PDF"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
      
      {/* Dialog pour créer une nouvelle facture */}
      <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle facture</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour créer une nouvelle facture.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              Cette fonctionnalité sera disponible prochainement.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewInvoiceDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateInvoice}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

};

export default FacturesPage;
