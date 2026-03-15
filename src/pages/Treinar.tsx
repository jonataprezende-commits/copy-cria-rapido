import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

const objectives = ["Cliques", "Vendas", "Cadastros", "Seguidores"];

const scoreLabels: Record<string, string> = {
  persuasao: "Persuasão",
  clareza: "Clareza",
  urgencia: "Urgência",
  cta: "CTA",
  gatilhos: "Gatilhos",
};

interface CoachResult {
  notas: Record<string, number>;
  feedbacks: Record<string, string>;
  nota_final: number;
  desafio: string;
  versao_coach: { headline: string; body: string; cta: string };
}

const Treinar = () => {
  const [platform, setPlatform] = useState("meta");
  const [objective, setObjective] = useState("Vendas");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [showCoachVersion, setShowCoachVersion] = useState(false);
  const { profile, user, refreshProfile } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "agency";
  const used = (profile as any)?.coach_sessions_used ?? 0;
  const limit = (profile as any)?.coach_sessions_limit ?? 5;

  const handleEvaluate = async () => {
    if (!isPro && used >= limit) {
      toast.error("Você atingiu o limite de avaliações gratuitas deste mês.");
      return;
    }
    if (!headline.trim() || !body.trim()) return;
    setLoading(true);
    setResult(null);
    setShowCoachVersion(false);

    try {
      const { data, error } = await supabase.functions.invoke("coach-copy", {
        body: { headline, body, cta, platform, objective },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);

      if (isPro && data.xp_earned) {
        toast.success(`+${data.xp_earned} XP!`);
      }
      toast.success("Avaliação concluída!");
      await refreshProfile();
    } catch (e: any) {
      toast.error(e.message || "Erro ao avaliar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <GraduationCap className="w-5 md:w-6 h-5 md:h-6 text-primary" />
          Treinar Copy
        </h1>
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">Escreva um copy do zero e receba feedback da IA.</p>

        {!isPro && (
          <p className="text-xs text-muted-foreground mb-4">{used} de {limit} avaliações usadas este mês</p>
        )}

        <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
          {/* Editor */}
          <div className="bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Plataforma</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Objetivo</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {objectives.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Headline</Label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Escreva seu headline:" className="mt-1.5 h-11 bg-background text-base" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Corpo</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escreva o corpo:" className="mt-1.5 bg-background resize-none text-base" rows={4} />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">CTA</Label>
              <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Escreva seu CTA:" className="mt-1.5 h-11 bg-background text-base" />
            </div>
            <Button onClick={handleEvaluate} disabled={loading || !headline.trim()} className="w-full h-11 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {loading ? "Avaliando..." : "Avaliar copy →"}
            </Button>
          </div>

          {/* Results */}
          {result ? (
            <div className="space-y-4">
              {/* Scores */}
              <div className="bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
                {Object.entries(result.notas).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{scoreLabels[key] || key}</span>
                      <span className="text-muted-foreground">{value}/10</span>
                    </div>
                    <Progress value={value * 10} className="h-2" />
                    <p className="text-[11px] text-muted-foreground mt-1">{result.feedbacks[key]}</p>
                  </div>
                ))}
                <div className="pt-3 border-t border-border text-center">
                  <p className={`text-3xl font-extrabold ${result.nota_final >= 8 ? "text-green-600" : result.nota_final >= 5 ? "text-accent" : "text-destructive"}`}>
                    {result.nota_final.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Nota final</p>
                </div>
              </div>

              {/* Challenge */}
              <div className="bg-accent/10 rounded-lg p-4 md:p-5 border border-accent/30">
                <h4 className="text-sm font-semibold text-accent mb-2">🎯 Desafio do coach</h4>
                <p className="text-sm text-foreground">{result.desafio}</p>
              </div>

              {/* Coach version */}
              <Button variant="outline" onClick={() => setShowCoachVersion(!showCoachVersion)} className="w-full text-foreground min-h-[44px]">
                {showCoachVersion ? "Esconder versão do coach" : "Ver versão do coach"}
              </Button>
              {showCoachVersion && (
                <div className="bg-card rounded-lg shadow-premium p-4 md:p-5 border-2 border-primary/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Seu copy</p>
                      <p className="text-sm text-foreground">{headline}</p>
                      <p className="text-sm text-muted-foreground mt-1">{body}</p>
                      <p className="text-sm text-primary mt-1">{cta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Versão do coach</p>
                      <p className="text-sm text-foreground font-medium">{result.versao_coach.headline}</p>
                      <p className="text-sm text-muted-foreground mt-1">{result.versao_coach.body}</p>
                      <p className="text-sm text-primary mt-1">{result.versao_coach.cta}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Escreva um copy ao lado e a IA vai avaliar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Treinar;
