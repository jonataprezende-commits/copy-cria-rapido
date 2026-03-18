import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

interface FabricaResult {
  headlines: string[];
  copies: { titulo: string; corpo: string; cta: string }[];
  hooks: string[];
  ctas: string[];
  criativos: string[];
}

const Fabrica = () => {
  const { profile, refreshProfile } = useAuth();
  const [productName, setProductName] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("meta");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FabricaResult | null>(null);
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
      const { data, error } = await supabase.functions.invoke("fabrica", {
        body: { produto: productName, publico: audience, plataforma: platform },
      });

      if (error) throw error;
      if (data?.error === "limite_atingido") {
        setShowUpgrade(true);
        return;
      }
      if (data?.error) throw new Error(data.error);

      setResults(data);
      toast.success("Conteúdo gerado com sucesso!");
      await refreshProfile();
    } catch (e: any) {
      console.error("Fabrica error:", e);
      toast.error(e.message || "Erro ao gerar conteúdo. Tente novamente.");
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
                Fábrica de Conteúdo
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto/Serviço</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Curso de Marketing Digital"
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Público-alvo</Label>
                  <Textarea
                    id="audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ex: Empreendedores digitais que querem escalar vendas"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Plataforma Principal</Label>
                  <Select value={platform} onValueChange={setPlatform}>
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
                <Button onClick={handleGenerate} disabled={isLoading || !productName || !audience} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Gerar Conteúdo Completo
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
                  <h3 className="text-xl font-bold text-foreground mb-3">Headlines</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.headlines.map((h, i) => (
                      <li key={i} className="text-muted-foreground">{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Copies</h3>
                  <div className="space-y-4">
                    {results.copies.map((c, i) => (
                      <div key={i} className="bg-muted p-3 rounded-md">
                        <p className="font-semibold text-foreground">{c.titulo}</p>
                        <p className="text-muted-foreground text-sm mt-1">{c.corpo}</p>
                        <p className="text-primary text-sm mt-1">CTA: {c.cta}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Hooks Virais</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.hooks.map((h, i) => (
                      <li key={i} className="text-muted-foreground">{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">CTAs</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.ctas.map((c, i) => (
                      <li key={i} className="text-muted-foreground">{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Ideias de Criativos</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.criativos.map((c, i) => (
                      <li key={i} className="text-muted-foreground">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Preencha o formulário ao lado para gerar um pacote completo de conteúdo.
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

export default Fabrica;
