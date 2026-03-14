import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Heart } from "lucide-react";

const Salvos = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Salvos</h1>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            Favorite os copies que você mais gostou para encontrar rápido depois.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Salvos;
