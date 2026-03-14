import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Historico = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Histórico</h1>
        <div className="relative">
          {/* Blurred content for free plan */}
          <div className="space-y-4 blur-sm pointer-events-none select-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-premium p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground text-sm">Curso de Tráfego Pago</p>
                    <p className="text-xs text-muted-foreground mt-1">Meta Ads • Urgência • 10 mar 2026</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">3 variações</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  Aprenda tráfego pago do zero e conquiste seus primeiros clientes em 7 dias...
                </p>
              </div>
            ))}
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-card rounded-lg shadow-premium-hover p-8 text-center max-w-sm">
              <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">Disponível no plano Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça upgrade para acessar o histórico completo de todas as suas gerações.
              </p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150">
                Assinar Pro — R$29/mês
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Historico;
