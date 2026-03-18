import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

interface MelhorarResult {
  nota: number;
  classificacao: string;
  versao_melhorada: string;
  sugestoes: string[];
}

const Melhorar = () => {
  const { profile, refreshProfile } = useAuth();
  const [textoOriginal, setTextoOriginal] = useState("");
  const [plataforma, setPlataforma] = useState("meta");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MelhorarResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleAnalyze = async () => {
    const isPro = profile?.plan === "pro" || profile?.plan === "agency";
    if (profile && !isPro && profile.generations_used >= profile.generations_limit) {
      setShowUpgrade(true);
      return;
    }

    setIsLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("melhorar", {
        body: { texto: textoOriginal, plataforma },
      });

      if (error) throw error;
      if (data?.error === "limite_atingido") {
        setShowUpgrade(true);
        return;
      }
      if (data?.error) throw new Error(data.error);

      setResults(data);
      toast.success("Análise e melhoria concluídas!");
      await refreshProfile();
    } catch (e: any) {
      console.error("Melhorar error:", e);
      toast.error(e.message || "Erro ao analisar e melhorar o texto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          <div className="lg:col-span-5">
            <div className="bg-card rounded-lg shadow-premium p-4 md:p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Melhorar Copy Existente
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="textoOriginal">Seu Copy Original</Label>
                  <Textarea
                    id="textoOriginal"
                    value={textoOriginal}
                    onChange={(e) => setTextoOriginal(e.target.value)}
                    placeholder="Cole seu texto aqui para análise e melhoria."
                    rows={8}
                  />
                </div>
                <div>
                  <Label htmlFor="plataforma">Plataforma</Label>
                  <Select value={plataforma} onValueChange={setPlataforma}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meta">Meta Ads (Facebook/Instagram)</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="tiktok">TikTok Ads</SelectItem>
                      <SelectItem value="email">E-mail Marketing</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading || !textoOriginal} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Analisar e Melhorar
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {results && !isLoading && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Resultado da Análise</h3>
                  <div className="bg-card rounded-lg shadow-premium p-4">
                    <p className="text-sm text-muted-foreground">Nota: <span className="font-semibold text-foreground">{results.nota}/10</span></p>
                    <p className="text-sm text-muted-foreground">Classificação: <span className="font-semibold text-foreground">{results.classificacao}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Versão Melhorada</h3>
                  <div className="bg-card rounded-lg shadow-premium p-4">
                    <p className="text-muted-foreground text-sm">{results.versao_melhorada}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Sugestões de Melhoria</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.sugestoes.map((s, i) => (
                      <li key={i} className="text-muted-foreground">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Cole seu copy no formulário ao lado para receber uma análise e sugestões de melhoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Melhorar;
