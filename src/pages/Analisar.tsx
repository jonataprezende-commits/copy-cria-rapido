import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FileSearch, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const platforms = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn Ads" },
  { value: "email", label: "E-mail Marketing" },
];

interface AnalysisResult {
  nota_geral: number;
  classificacao: string;
  breakdown: Record<string, number>;
  feedbacks: Record<string, string>;
  pontos_positivos: string[];
  pontos_negativos: string[];
  versao_melhorada: { titulo: string; texto: string; cta: string };
  resumo: string;
}

const breakdownLabels: Record<string, string> = {
  clareza: "Clareza da mensagem",
  headline: "Força do headline",
  cta: "Qualidade do CTA",
  gatilhos: "Gatilhos mentais usados",
  adequacao: "Adequação à plataforma",
};

const Analisar = () => {
  const [copyText, setCopyText] = useState("");
  const [platform, setPlatform] = useState("meta");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isPro = profile?.plan === "pro" || profile?.plan === "agency";
  const used = (profile as any)?.analyses_used ?? 0;
  const limit = (profile as any)?.analyses_limit ?? 2;

  const handleAnalyze = async () => {
    if (!isPro && used >= limit) {
      toast.error("Você atingiu o limite de análises gratuitas deste mês.");
      return;
    }
    if (!copyText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-copy", {
        body: { copyText, platform },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Análise concluída!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao analisar copy.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 4) return "text-destructive";
    if (score <= 7) return "text-accent";
    return "text-green-600";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 4) return "Precisa de atenção";
    if (score <= 7) return "Pode melhorar";
    return "Excelente";
  };

  const handleCopyImproved = () => {
    if (!result) return;
    const text = `${result.versao_melhorada.titulo}\n${result.versao_melhorada.texto}\nCTA: ${result.versao_melhorada.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Analise seu anúncio</h1>
        <p className="text-sm text-muted-foreground mb-6">Cole qualquer copy e descubra o que está funcionando.</p>

        {!isPro && (
          <p className="text-xs text-muted-foreground mb-4">{used} de {limit} análises usadas este mês</p>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="bg-card rounded-lg shadow-premium p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Copy para análise</Label>
                <Textarea
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                  placeholder="Cole aqui o copy que você quer analisar..."
                  className="mt-1.5 bg-background resize-none"
                  rows={6}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Plataforma</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !copyText.trim()}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? "Analisando..." : "Analisar agora →"}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Score */}
              <div className="bg-card rounded-lg shadow-premium p-6 text-center">
                <p className={`text-5xl font-extrabold ${getScoreColor(result.nota_geral)}`}>
                  {result.nota_geral.toFixed(1)}
                </p>
                <p className={`text-sm font-medium mt-1 ${getScoreColor(result.nota_geral)}`}>
                  {getScoreLabel(result.nota_geral)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{result.resumo}</p>
              </div>

              {/* Breakdown */}
              <div className="bg-card rounded-lg shadow-premium p-6 space-y-4">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{breakdownLabels[key] || key}</span>
                      <span className="text-muted-foreground">{value}/10</span>
                    </div>
                    <Progress value={value * 10} className="h-2" />
                    <p className="text-[11px] text-muted-foreground mt-1">{result.feedbacks[key]}</p>
                  </div>
                ))}
              </div>

              {/* Positives */}
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Pontos fortes</h4>
                <ul className="space-y-1">
                  {result.pontos_positivos.map((p, i) => (
                    <li key={i} className="text-sm text-green-600 dark:text-green-300">✓ {p}</li>
                  ))}
                </ul>
              </div>

              {/* Negatives */}
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-destructive mb-2">O que melhorar</h4>
                <ul className="space-y-1">
                  {result.pontos_negativos.map((p, i) => (
                    <li key={i} className="text-sm text-destructive/80">✗ {p}</li>
                  ))}
                </ul>
              </div>

              {/* Improved version */}
              <div className="bg-card rounded-lg shadow-premium p-6 border-2 border-primary/30">
                <h4 className="text-sm font-semibold text-foreground mb-3">Versão melhorada</h4>
                <p className="font-semibold text-foreground text-sm">{result.versao_melhorada.titulo}</p>
                <p className="text-sm text-muted-foreground mt-2">{result.versao_melhorada.texto}</p>
                <p className="text-sm text-primary font-medium mt-2">CTA: {result.versao_melhorada.cta}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={handleCopyImproved} className="text-foreground">
                    {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    Copiar versão melhorada
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileSearch className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Cole um copy ao lado e descubra como melhorar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analisar;
