// Types for vineyard management data
export interface ProductionLot {
  id: string;
  name: string;
  vintage: string;
  varietal: string;
  status: 'harvest' | 'fermentation' | 'aging' | 'bottling' | 'ready';
  quantity: number;
  harvestDate: string;
  bottlingDate: string | null;
  notes: string;
  tankId: string;
}

export interface Tank {
  id: string;
  name: string;
  capacity: number;
  currentVolume: number;
  contents: string;
  status: 'empty' | 'filling' | 'fermenting' | 'aging' | 'ready';
  temperature: number;
  lastChecked: string;
}

export interface StockAlert {
  id: string;
  cuveeId: string;
  cuveeName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'low' | 'ok';
  createdAt: string;
}

// Storage keys
const PRODUCTION_LOTS_KEY = 'production-lots';
const TANKS_KEY = 'tanks';

// Sample data for initialization
const initialLots: ProductionLot[] = [
  {
    id: "lot-2023-cab-01",
    name: "Cabernet Sauvignon 2023 - Lot 1",
    vintage: "2023",
    varietal: "Cabernet Sauvignon",
    status: "aging",
    quantity: 2500,
    harvestDate: "2023-09-15",
    bottlingDate: null,
    notes: "Excellente récolte, fermentation terminée, transfert en barrique le 15/10/2023",
    tankId: "tank-02"
  },
  {
    id: "lot-2023-chard-01",
    name: "Chardonnay 2023 - Lot 1",
    vintage: "2023",
    varietal: "Chardonnay",
    status: "bottling",
    quantity: 1800,
    harvestDate: "2023-08-20",
    bottlingDate: "2024-03-10",
    notes: "Fermentation à basse température, notes florales prononcées",
    tankId: "tank-03"
  },
  {
    id: "lot-2023-merlot-01",
    name: "Merlot 2023 - Lot 1",
    vintage: "2023",
    varietal: "Merlot",
    status: "fermentation",
    quantity: 3000,
    harvestDate: "2023-10-05",
    bottlingDate: null,
    notes: "Vendanges manuelles, première fermentation en cours",
    tankId: "tank-04"
  }
];

const initialTanks: Tank[] = [
  {
    id: "tank-01",
    name: "Cuve 1",
    capacity: 5000,
    currentVolume: 0,
    contents: "",
    status: "empty",
    temperature: 15,
    lastChecked: new Date().toISOString()
  },
  {
    id: "tank-02",
    name: "Cuve 2",
    capacity: 3000,
    currentVolume: 2500,
    contents: "Cabernet Sauvignon 2023",
    status: "aging",
    temperature: 16,
    lastChecked: new Date().toISOString()
  },
  {
    id: "tank-03",
    name: "Cuve 3",
    capacity: 2000,
    currentVolume: 1800,
    contents: "Chardonnay 2023",
    status: "ready",
    temperature: 12,
    lastChecked: new Date().toISOString()
  },
  {
    id: "tank-04",
    name: "Cuve 4",
    capacity: 4000,
    currentVolume: 3000,
    contents: "Merlot 2023",
    status: "fermenting",
    temperature: 18,
    lastChecked: new Date().toISOString()
  }
];

// Vineyard management service functions
export const getProductionLots = (): ProductionLot[] => {
  const savedLots = localStorage.getItem(PRODUCTION_LOTS_KEY);
  if (savedLots) {
    return JSON.parse(savedLots);
  }
  // Initialize with sample data
  localStorage.setItem(PRODUCTION_LOTS_KEY, JSON.stringify(initialLots));
  return initialLots;
};

export const getTanks = (): Tank[] => {
  const savedTanks = localStorage.getItem(TANKS_KEY);
  if (savedTanks) {
    return JSON.parse(savedTanks);
  }
  // Initialize with sample data
  localStorage.setItem(TANKS_KEY, JSON.stringify(initialTanks));
  return initialTanks;
};

export const saveProductionLots = (lots: ProductionLot[]): void => {
  localStorage.setItem(PRODUCTION_LOTS_KEY, JSON.stringify(lots));
  
  // Sync with cuvees if applicable
  syncWithCuvees(lots);
};

export const saveTanks = (tanks: Tank[]): void => {
  localStorage.setItem(TANKS_KEY, JSON.stringify(tanks));
};

// Sync production data with cuvees for better integration
const syncWithCuvees = (lots: ProductionLot[]): void => {
  try {
    const savedCuvees = localStorage.getItem('cuvees');
    if (!savedCuvees) return;
    
    const cuvees = JSON.parse(savedCuvees);
    const readyLots = lots.filter(lot => lot.status === 'ready' && lot.bottlingDate);
    
    // Create or update cuvees based on ready production lots
    readyLots.forEach(lot => {
      const existingCuvee = cuvees.find((c: any) => 
        c.nom.includes(lot.varietal) && c.annee === lot.vintage
      );
      
      if (!existingCuvee) {
        // Could potentially add new cuvees based on completed production lots
        // This would create a true link between production and inventory
      }
    });
    
    localStorage.setItem('cuvees', JSON.stringify(cuvees));
  } catch (error) {
    console.error("Error syncing production lots with cuvees:", error);
  }
};

export const generateStockAlerts = (): StockAlert[] => {
  const savedCuvees = localStorage.getItem('cuvees');
  const alerts: StockAlert[] = [];
  
  if (savedCuvees) {
    const cuvees = JSON.parse(savedCuvees);
    
    cuvees.forEach((cuvee: any) => {
      const stock = parseInt(cuvee.stock || "0");
      let status: 'critical' | 'low' | 'ok' = 'ok';
      
      if (stock <= 5) {
        status = 'critical';
      } else if (stock <= 15) {
        status = 'low';
      }
      
      if (status !== 'ok') {
        alerts.push({
          id: `alert-${cuvee.id}`,
          cuveeId: cuvee.id,
          cuveeName: `${cuvee.nom} ${cuvee.annee}`,
          currentStock: stock,
          threshold: status === 'critical' ? 5 : 15,
          status,
          createdAt: new Date().toISOString()
        });
      }
    });
  } else {
    // Create sample alerts if no cuvees exist
    alerts.push({
      id: "alert-sample-1",
      cuveeId: "sample-1",
      cuveeName: "Grande Réserve 2020",
      currentStock: 3,
      threshold: 5,
      status: "critical",
      createdAt: new Date().toISOString()
    });
    
    alerts.push({
      id: "alert-sample-2",
      cuveeId: "sample-2",
      cuveeName: "Cuvée Prestige 2021",
      currentStock: 12,
      threshold: 15,
      status: "low",
      createdAt: new Date().toISOString()
    });
  }
  
  return alerts;
};

export const getStatusText = (status: ProductionLot['status'] | Tank['status']): string => {
  const statusMap: Record<string, string> = {
    'harvest': 'Récolte',
    'fermentation': 'Fermentation',
    'aging': 'Élevage',
    'bottling': 'Mise en bouteille',
    'ready': 'Prêt',
    'empty': 'Vide',
    'filling': 'Remplissage',
    'fermenting': 'Fermentation'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status: ProductionLot['status'] | Tank['status']): string => {
  const colorMap: Record<string, string> = {
    'harvest': 'bg-green-100 text-green-800',
    'fermentation': 'bg-purple-100 text-purple-800',
    'aging': 'bg-amber-100 text-amber-800',
    'bottling': 'bg-blue-100 text-blue-800',
    'ready': 'bg-emerald-100 text-emerald-800',
    'empty': 'bg-gray-100 text-gray-800',
    'filling': 'bg-blue-100 text-blue-800',
    'fermenting': 'bg-purple-100 text-purple-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Add a new production lot
export const addProductionLot = (lot: Omit<ProductionLot, 'id'>): ProductionLot => {
  const lots = getProductionLots();
  const newLot = {
    ...lot,
    id: `lot-${Date.now()}`
  };
  
  lots.push(newLot);
  saveProductionLots(lots);
  return newLot;
};

// Update a production lot
export const updateProductionLot = (id: string, updates: Partial<ProductionLot>): ProductionLot | null => {
  const lots = getProductionLots();
  const index = lots.findIndex(lot => lot.id === id);
  
  if (index === -1) return null;
  
  lots[index] = { ...lots[index], ...updates };
  saveProductionLots(lots);
  return lots[index];
};

// Delete a production lot
export const deleteProductionLot = (id: string): boolean => {
  const lots = getProductionLots();
  const filteredLots = lots.filter(lot => lot.id !== id);
  
  if (filteredLots.length === lots.length) return false;
  
  saveProductionLots(filteredLots);
  return true;
};

// Similar CRUD operations for tanks
export const addTank = (tank: Omit<Tank, 'id'>): Tank => {
  const tanks = getTanks();
  const newTank = {
    ...tank,
    id: `tank-${Date.now()}`
  };
  
  tanks.push(newTank);
  saveTanks(tanks);
  return newTank;
};

export const updateTank = (id: string, updates: Partial<Tank>): Tank | null => {
  const tanks = getTanks();
  const index = tanks.findIndex(tank => tank.id === id);
  
  if (index === -1) return null;
  
  tanks[index] = { ...tanks[index], ...updates };
  saveTanks(tanks);
  return tanks[index];
};

export const deleteTank = (id: string): boolean => {
  const tanks = getTanks();
  const filteredTanks = tanks.filter(tank => tank.id !== id);
  
  if (filteredTanks.length === tanks.length) return false;
  
  saveTanks(filteredTanks);
  return true;
};
