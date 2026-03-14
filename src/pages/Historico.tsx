import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Generation {
  id: string;
  product_name: string;
  platform: string;
  tone: string | null;
  copies: any;
  created_at: string;
}

const platformLabels: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
  instagram: "Instagram",
  linkedin: "LinkedIn Ads",
  email: "E-mail Marketing",
};

const Historico = () => {
  const { profile, user } = useAuth();
  const isPro = profile?.plan === "pro";
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isPro) {
      setLoading(false);
      return;
    }

    const fetchGenerations = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setGenerations(data);
      setLoading(false);
    };

    fetchGenerations();
  }, [user, isPro]);

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao iniciar checkout.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Histórico</h1>

        {!isPro ? (
          <div className="relative">
            <div className="space-y-4 blur-sm pointer-events-none select-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg shadow-premium p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">Exemplo de geração</p>
                      <p className="text-xs text-muted-foreground mt-1">Meta Ads • Urgência</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">3 variações</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-card rounded-lg shadow-premium-hover p-8 text-center max-w-sm">
                <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">Disponível no plano Pro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upgrade para acessar o histórico completo de todas as suas gerações.
                </p>
                <Button
                  onClick={handleUpgrade}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150"
                >
                  Assinar Pro — R$29/mês
                </Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Suas gerações vão aparecer aqui. Comece gerando o primeiro copy.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map((gen) => {
              const copiesArr = Array.isArray(gen.copies) ? gen.copies : [];
              return (
                <div key={gen.id} className="bg-card rounded-lg shadow-premium p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{gen.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {platformLabels[gen.platform] || gen.platform} • {gen.tone || "—"} •{" "}
                        {new Date(gen.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {copiesArr.length} variações
                    </span>
                  </div>
                  {copiesArr.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {(copiesArr[0] as any)?.titulo} — {(copiesArr[0] as any)?.texto}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Historico;
