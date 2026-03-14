import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Zap, Copy, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const objectives = ["Vendas", "Leads", "Cliques", "Seguidores"];

interface CampaignCopy {
  id: number;
  titulo: string;
  texto: string;
  cta: string;
}

interface CampaignResults {
  meta: CampaignCopy[];
  google: CampaignCopy[];
  tiktok: CampaignCopy[];
  instagram: CampaignCopy[];
  headlines: CampaignCopy[];
}

const Campanha = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("Vendas");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, label: "" });
  const [results, setResults] = useState<CampaignResults | null>(null);
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "agency";

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setResults(null);
    setProgress({ current: 0, label: "Iniciando..." });

    try {
      const platformOrder = [
        { key: "meta", label: "Meta Ads", count: 10 },
        { key: "google", label: "Google Ads", count: 20 },
        { key: "tiktok", label: "TikTok", count: 30 },
        { key: "instagram", label: "Instagram", count: 40 },
        { key: "headlines", label: "Headlines", count: 50 },
      ];

      const { data, error } = await supabase.functions.invoke("generate-campaign", {
        body: { productName, description, audience, objective },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProgress({ current: 50, label: "Finalizando... 50/50 ✓" });
      setResults(data);
      toast.success("50 anúncios gerados com sucesso! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar campanha.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!results) return;
    const all = Object.values(results).flat();
    const text = all.map((c: any) => `${c.titulo}\n${c.texto}\nCTA: ${c.cta}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Todos os 50 anúncios copiados!");
  };

  const exportCsv = () => {
    if (!results) return;
    const rows = [["Plataforma", "Título", "Texto", "CTA"]];
    Object.entries(results).forEach(([platform, copies]) => {
      (copies as CampaignCopy[]).forEach((c) => {
        rows.push([platform, c.titulo, c.texto, c.cta]);
      });
    });
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campanha-50-anuncios.csv";
    a.click();
    toast.success("CSV exportado!");
  };

  if (!isPro) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="blur-sm pointer-events-none select-none bg-card rounded-lg shadow-premium p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Gere 50 anúncios em 1 clique</h2>
              <p className="text-muted-foreground">Todas as plataformas. Um produto. Zero esforço.</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 rounded-lg">
              <Lock className="w-10 h-10 text-muted-foreground/40 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Desbloqueie com o Plano Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">R$29/mês</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Hero */}
        <div className="bg-primary/5 rounded-lg p-8 mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Gere 50 anúncios em 1 clique</h1>
          <p className="text-sm text-muted-foreground">Todas as plataformas. Um produto. Zero esforço.</p>
        </div>

        {!results ? (
          <div className="max-w-lg mx-auto bg-card rounded-lg shadow-premium p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Nome do produto</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1.5 h-11 bg-background" required />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Descrição em 1 frase</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 bg-background resize-none" rows={2} required />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Público-alvo</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 h-11 bg-background" required />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Objetivo</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {objectives.map((obj) => (
                  <button key={obj} type="button" onClick={() => setObjective(obj)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      objective === obj ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>{obj}</button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !productName.trim()}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base">
              <Zap className="w-4 h-4 mr-2" />
              {loading ? "Gerando..." : "⚡ Gerar 50 anúncios agora"}
            </Button>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="text-sm text-primary font-medium animate-pulse">{progress.label}</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">50 anúncios gerados para {productName}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyAll} className="text-foreground">
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copiar todos
                </Button>
                <Button size="sm" variant="outline" onClick={exportCsv} className="text-foreground">
                  <Download className="w-3.5 h-3.5 mr-1" /> CSV
                </Button>
              </div>
            </div>

            <Tabs defaultValue="meta">
              <TabsList className="mb-4">
                <TabsTrigger value="meta">Meta Ads — {results.meta?.length || 0}</TabsTrigger>
                <TabsTrigger value="google">Google Ads — {results.google?.length || 0}</TabsTrigger>
                <TabsTrigger value="tiktok">TikTok — {results.tiktok?.length || 0}</TabsTrigger>
                <TabsTrigger value="instagram">Instagram — {results.instagram?.length || 0}</TabsTrigger>
                <TabsTrigger value="headlines">Headlines — {results.headlines?.length || 0}</TabsTrigger>
              </TabsList>
              {Object.entries(results).map(([key, copies]) => (
                <TabsContent key={key} value={key} className="space-y-3">
                  {(copies as CampaignCopy[]).map((copy, i) => (
                    <div key={i} className="bg-card rounded-lg shadow-premium p-4">
                      <p className="font-semibold text-foreground text-sm">{copy.titulo}</p>
                      <p className="text-sm text-muted-foreground mt-1">{copy.texto}</p>
                      <p className="text-sm text-primary font-medium mt-1">CTA: {copy.cta}</p>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Campanha;
