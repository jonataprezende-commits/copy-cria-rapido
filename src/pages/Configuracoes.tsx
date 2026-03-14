import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Configuracoes = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

        <div className="bg-card rounded-lg shadow-premium p-6 space-y-6">
          <div>
            <Label className="text-sm font-medium text-foreground">Nome</Label>
            <Input defaultValue="Rafael Costa" className="mt-1.5 h-11 bg-background" />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">E-mail</Label>
            <Input defaultValue="rafael@email.com" className="mt-1.5 h-11 bg-background" disabled />
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Plano atual</h3>
            <div className="flex items-center gap-3">
              <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium text-muted-foreground">Grátis</span>
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150"
              >
                Fazer upgrade para Pro
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="text-foreground">Salvar alterações</Button>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-destructive mb-2">Zona de perigo</h3>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Excluir minha conta
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;
