
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

interface NotImplementedPageProps {
  title: string;
  description?: string;
}

const NotImplementedPage = ({ 
  title,
  description = "Cette fonctionnalité sera bientôt disponible." 
}: NotImplementedPageProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Construction size={64} className="text-wine mb-4" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button onClick={() => navigate(-1)}>
        <ArrowLeft size={18} className="mr-2" /> Retour
      </Button>
    </div>
  );
};

export default NotImplementedPage;
