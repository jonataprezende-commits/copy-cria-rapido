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

interface Cena {
  tempo: string;
  visual: string;
  narracao: string;
  emocao: string;
}

interface RoteiroResult {
  cenas: Cena[];
  dica_edicao: string;
}

const Roteiro = () => {
  const { profile, refreshProfile } = useAuth();
  const [productName, setProductName] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("15");
  const [platform, setPlatform] = useState("tiktok");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RoteiroResult | null>(null);
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
      const { data, error } = await supabase.functions.invoke("roteiro", {
        body: { produto: productName, publico: audience, duracao: parseInt(duration), plataforma: platform },
      });

      if (error) throw error;
      if (data?.error === "limite_atingido") {
        setShowUpgrade(true);
        return;
      }
      if (data?.error) throw new Error(data.error);

      setResults(data);
      toast.success("Roteiro gerado com sucesso!");
      await refreshProfile();
    } catch (e: any) {
      console.error("Roteiro error:", e);
      toast.error(e.message || "Erro ao gerar roteiro. Tente novamente.");
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
                Gerador de Roteiro para Vídeos Curtos
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto/Serviço</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Aplicativo de Meditação"
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Público-alvo</Label>
                  <Input
                    id="audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ex: Pessoas estressadas buscando relaxamento"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração do Vídeo (segundos)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 segundos</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="45">45 segundos</SelectItem>
                      <SelectItem value="60">60 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reels">Instagram Reels</SelectItem>
                      <SelectItem value="shorts">YouTube Shorts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading || !productName || !audience} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Gerar Roteiro
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
                  <h3 className="text-xl font-bold text-foreground mb-3">Cenas do Roteiro</h3>
                  <div className="space-y-4">
                    {results.cenas.map((cena, i) => (
                      <div key={i} className="bg-card rounded-lg shadow-premium p-4">
                        <p className="font-semibold text-foreground">Tempo: {cena.tempo}</p>
                        <p className="text-muted-foreground text-sm mt-1">Visual: {cena.visual}</p>
                        <p className="text-muted-foreground text-sm mt-1">Narração: {cena.narracao}</p>
                        <p className="text-muted-foreground text-sm mt-1">Emoção: {cena.emocao}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Dica de Edição</h3>
                  <div className="bg-card rounded-lg shadow-premium p-4">
                    <p className="text-muted-foreground text-sm">{results.dica_edicao}</p>
                  </div>
                </div>
              </div>
            )}
            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Preencha o formulário ao lado para gerar um roteiro de vídeo curto.
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

export default Roteiro;
