import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";  
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CuveesPage from "./pages/CuveesPage";
import AddCuveePage from "./pages/AddCuveePage";
import EditCuveePage from "./pages/EditCuveePage";
import CataloguePage from "./pages/CataloguePage";
import CommandesPage from "./pages/CommandesPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ProductionPage from "./pages/ProductionPage";
import FacturesPage from "./pages/FacturesPage";
import ClientsPage from "./pages/ClientsPage";
import StatistiquesPage from "./pages/StatistiquesPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ClientDashboard from "./pages/ClientDashboard";
import VineyardManagementPage from "./pages/VineyardManagementPage";
import PartnerCountriesPage from "./pages/PartnerCountriesPage";

const queryClient = new QueryClient();

const App = () => {

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <Layout />
                  </SidebarProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="client-dashboard" element={<ClientDashboard />} />
              <Route path="cuvees">
                <Route index element={<CuveesPage />} />
                <Route path="ajouter" element={<AddCuveePage />} />
                <Route path="modifier/:id" element={<EditCuveePage />} />
              </Route>
              <Route path="production" element={<ProductionPage />} />
              <Route path="vineyard-management" element={<VineyardManagementPage />} />
              <Route path="catalogue" element={<CataloguePage />} />
              <Route path="commandes" element={<CommandesPage />} />
              <Route path="factures" element={<FacturesPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="statistiques" element={<StatistiquesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="payment-success" element={<PaymentSuccessPage />} />
              <Route path="partner-countries" element={<PartnerCountriesPage />} />
            </Route>
            <Route path="/en_maintenance" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)};

export default App;
