
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapping des chemins aux noms affichables
const pathMap: Record<string, string> = {
  "": "Accueil",
  "cuvees": "Cuvées",
  "cuvees/ajouter": "Ajouter une cuvée",
  "cuvees/modifier": "Modifier une cuvée",
  "production": "Production",
  "stocks": "Stocks",
  "catalogue": "Catalogue",
  "commandes": "Commandes",
  "factures": "Factures",
  "clients": "Clients",
  "statistiques": "Statistiques",
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Si on est sur la page d'accueil, on n'affiche pas de fil d'Ariane
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Fil d'Ariane" className="breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="breadcrumb-item">
          <Link to="/" className="flex items-center text-sm font-medium hover:text-wine">
            <Home size={18} />
            <span className="ml-1 hidden md:inline-block">Accueil</span>
          </Link>
        </li>
        
        {pathnames.map((name, index) => {
          // Construire le chemin pour ce niveau
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          
          // Chercher un nom affichable pour ce chemin
          let displayName = pathMap[pathnames.slice(0, index + 1).join("/")] || name;
          
          return (
            <li key={routeTo} className="breadcrumb-item">
              <div className="flex items-center">
                <ChevronRight size={16} className="breadcrumb-separator" />
                {isLast ? (
                  <span className={cn("breadcrumb-active")}>{displayName}</span>
                ) : (
                  <Link 
                    to={routeTo}
                    className="ml-1 text-sm font-medium hover:text-wine"
                  >
                    {displayName}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
