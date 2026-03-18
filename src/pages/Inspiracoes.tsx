import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

interface AnuncioInspirador {
  headline: string;
  copy: string;
  emocao: string;
  estrutura: string;
  por_que_funciona: string;
  agressividade: string;
  melhor_para: string;
}

interface InspiracoesResult {
  anuncios: AnuncioInspirador[];
}

const Inspiracoes = () => {
  const { profile, refreshProfile } = useAuth();
  const [nicho, setNicho] = useState("");
  const [plataforma, setPlataforma] = useState("meta");
  const [objetivo, setObjetivo] = useState("vendas");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<InspiracoesResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGenerate = async () => {
    const isPro = profile?.plan === "pro" || profile?.plan === "agency";
    if (profile && !isPro && profile.generations_used >= profile.generations_limit) {
      setShowUpgrade(true);
      return;
    }

    setIsLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("inspiracoes", {
        body: { nicho, plataforma, objetivo },
      });

      if (error) throw error;
      if (data?.error === "limite_atingido") {
        setShowUpgrade(true);
        return;
      }
      if (data?.error) throw new Error(data.error);

      setResults(data);
      toast.success("Inspirações geradas com sucesso!");
      await refreshProfile();
    } catch (e: any) {
      console.error("Inspiracoes error:", e);
      toast.error(e.message || "Erro ao gerar inspirações. Tente novamente.");
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
                Inspirações de Anúncios
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nicho">Nicho de Mercado</Label>
                  <Input
                    id="nicho"
                    value={nicho}
                    onChange={(e) => setNicho(e.target.value)}
                    placeholder="Ex: Fitness, Culinária, Tecnologia"
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
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="objetivo">Objetivo do Anúncio</Label>
                  <Select value={objetivo} onValueChange={setObjetivo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="leads">Geração de Leads</SelectItem>
                      <SelectItem value="engajamento">Engajamento</SelectItem>
                      <SelectItem value="trafego">Tráfego</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading || !nicho} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Gerar Inspirações
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
              <div className="space-y-4">
                {results.anuncios.map((anuncio, i) => (
                  <div key={i} className="bg-card rounded-lg shadow-premium p-4">
                    <p className="font-semibold text-foreground">Headline: {anuncio.headline}</p>
                    <p className="text-muted-foreground text-sm mt-1">Copy: {anuncio.copy}</p>
                    <p className="text-muted-foreground text-sm mt-1">Emoção: {anuncio.emocao}</p>
                    <p className="text-muted-foreground text-sm mt-1">Estrutura: {anuncio.estrutura}</p>
                    <p className="text-muted-foreground text-sm mt-1">Por que funciona: {anuncio.por_que_funciona}</p>
                    <p className="text-muted-foreground text-sm mt-1">Agressividade: {anuncio.agressividade}</p>
                    <p className="text-muted-foreground text-sm mt-1">Melhor para: {anuncio.melhor_para}</p>
                  </div>
                ))}
              </div>
            )}
            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Preencha o formulário ao lado para gerar inspirações de anúncios.
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

export default Inspiracoes;
