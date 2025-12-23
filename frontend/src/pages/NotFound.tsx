
import { AlertTriangle } from "lucide-react";

const NotFound = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertTriangle size={64} className="text-wine mb-4" />
      <p className="text-xl text-muted-foreground mb-8">
        Site Web en maintenance
      </p>
    </div>
  );
};

export default NotFound;
