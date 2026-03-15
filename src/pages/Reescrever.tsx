import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const platforms = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn Ads" },
  { value: "email", label: "E-mail Marketing" },
];

const versionTypes = [
  { id: "curta", label: "Versão curta (máx 80 chars)", pro: false },
  { id: "longa", label: "Versão longa (mín 200 chars, storytelling)", pro: false },
  { id: "agressiva", label: "Versão agressiva (urgência e escassez)", pro: false },
  { id: "emocional", label: "Versão emocional (empatia, transformação)", pro: false },
  { id: "tecnica", label: "Versão técnica [Pro]", pro: true },
  { id: "humoristica", label: "Versão humorística [Pro]", pro: true },
];

interface RewriteVersion {
  tipo: string;
  titulo: string;
  texto: string;
  cta: string;
  chars: number;
  gatilho_principal: string;
}

const Reescrever = () => {
  const [copyText, setCopyText] = useState("");
  const [platform, setPlatform] = useState("meta");
  const [selectedVersions, setSelectedVersions] = useState(["curta", "longa"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RewriteVersion[] | null>(null);
  const [showDiff, setShowDiff] = useState<string | null>(null);
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "agency";
  const used = (profile as any)?.rewrites_used ?? 0;
  const limit = (profile as any)?.rewrites_limit ?? 3;

  const toggleVersion = (id: string) => {
    const type = versionTypes.find((v) => v.id === id);
    if (type?.pro && !isPro) {
      toast.error("Disponível no Plano Pro");
      return;
    }
    setSelectedVersions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleRewrite = async () => {
    if (!isPro && used >= limit) {
      toast.error("Você atingiu o limite de reescritas gratuitas deste mês.");
      return;
    }
    if (!copyText.trim() || selectedVersions.length === 0) return;
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("rewrite-copy", {
        body: { copyText, platform, versions: selectedVersions },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data.versoes);
      toast.success("Reescrita concluída!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao reescrever.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Reescrever Copy</h1>
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">Cole um copy existente e receba múltiplas versões melhoradas.</p>

        {!isPro && (
          <p className="text-xs text-muted-foreground mb-4">{used} de {limit} reescritas usadas este mês</p>
        )}

        <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
          {/* Input */}
          <div className="bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Copy original</Label>
              <Textarea
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                placeholder="Cole o copy original aqui..."
                className="mt-1.5 bg-background resize-none text-base"
                rows={5}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1.5 h-11 bg-background text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Versões desejadas</Label>
              <div className="space-y-2">
                {versionTypes.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 min-h-[44px]">
                    <Checkbox
                      id={v.id}
                      checked={selectedVersions.includes(v.id)}
                      onCheckedChange={() => toggleVersion(v.id)}
                      disabled={v.pro && !isPro}
                    />
                    <label
                      htmlFor={v.id}
                      className={`text-sm ${v.pro && !isPro ? "text-muted-foreground/50" : "text-foreground"}`}
                    >
                      {v.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleRewrite}
              disabled={loading || !copyText.trim() || selectedVersions.length === 0}
              className="w-full h-11 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold md:relative md:bottom-auto fixed bottom-4 left-4 right-4 md:left-auto md:right-auto z-40 md:z-auto md:w-full"
              style={{ width: undefined }}
            >
              {loading ? "Reescrevendo..." : "Reescrever →"}
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-4 pb-16 md:pb-0">
            {results ? results.map((version, i) => (
              <div key={i} className="bg-card rounded-lg shadow-premium p-3 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground capitalize">{version.tipo}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {version.chars} chars
                    </span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {version.gatilho_principal}
                  </span>
                </div>
                <p className="font-semibold text-foreground text-sm">{version.titulo}</p>
                <p className="text-sm text-muted-foreground mt-2">{version.texto}</p>
                <p className="text-sm text-primary font-medium mt-2">CTA: {version.cta}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleCopy(`${version.titulo}\n${version.texto}\nCTA: ${version.cta}`)} className="text-foreground min-h-[44px]">
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDiff(showDiff === version.tipo ? null : version.tipo)}
                    className="text-muted-foreground min-h-[44px]"
                  >
                    {showDiff === version.tipo ? "Esconder diff" : "Ver o que mudou"}
                  </Button>
                </div>
                {showDiff === version.tipo && (
                  <div className="mt-3 p-3 bg-muted/50 rounded text-xs">
                    <p className="text-destructive line-through mb-1">{copyText.substring(0, 100)}...</p>
                    <p className="text-green-600">{version.texto.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            )) : !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <RefreshCw className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Cole um copy e escolha as versões desejadas.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reescrever;
