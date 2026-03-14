import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Exportar = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Exportar</h1>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Lock className="w-10 h-10 text-muted-foreground/40 mb-4" />
          <h3 className="font-bold text-foreground mb-2">Disponível no plano Pro</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Exporte seus copies em TXT, CSV ou DOCX com o plano Pro.
          </p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150">
            Assinar Pro — R$29/mês
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Exportar;
