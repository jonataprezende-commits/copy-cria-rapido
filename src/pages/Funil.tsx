import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Layers, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const niches = [
  { value: "dropshipping", label: "🛒 Dropshipping" },
  { value: "infoproduto", label: "📚 Infoproduto" },
  { value: "servico_local", label: "🏠 Serviço Local" },
  { value: "saas", label: "💻 SaaS" },
  { value: "afiliado", label: "🤝 Afiliado" },
  { value: "ecommerce", label: "🛍 E-commerce" },
];

const Funil = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [niche, setNiche] = useState("infoproduto");
  const [includeAds, setIncludeAds] = useState(true);
  const [includeLanding, setIncludeLanding] = useState(true);
  const [includeEmails, setIncludeEmails] = useState(true);
  const [includeScript, setIncludeScript] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro";

  if (!isPro) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="blur-sm pointer-events-none select-none bg-card rounded-lg shadow-premium p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Funil completo em 1 clique</h2>
              <p className="text-muted-foreground text-sm">Do anúncio à venda. A IA monta todo o funil do seu produto.</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 rounded-lg">
              <Lock className="w-10 h-10 text-muted-foreground/40 mb-4" />
              <h3 className="font-bold text-foreground mb-2">Disponível no Plano Pro</h3>          </div>
          </div>
        </main>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-funnel", {
        body: { productName, description, audience, price, niche, includeAds, includeLanding, includeEmails, includeScript },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data);
      toast.success("Funil gerado com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar funil.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySection = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Layers className="w-5 md:w-6 h-5 md:h-6 text-accent" />
          Funil completo em 1 clique
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">Do anúncio à venda. A IA monta todo o funil do seu produto.</p>

        {!results ? (
          <div className="max-w-lg mx-auto bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Nome do produto</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1.5 h-11 bg-background text-base" required />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Descrição completa</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 bg-background resize-none text-base" rows={3} required />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Público-alvo</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 h-11 bg-background text-base" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Preço (R$)</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ex: 497" className="mt-1.5 h-11 bg-background text-base" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Nicho</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger className="mt-1.5 h-11 bg-background text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {niches.map((n) => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { id: "ads", label: "5 anúncios (Meta + Google)", state: includeAds, set: setIncludeAds },
                { id: "landing", label: "Estrutura de landing page", state: includeLanding, set: setIncludeLanding },
                { id: "emails", label: "Sequência de 5 e-mails", state: includeEmails, set: setIncludeEmails },
                { id: "script", label: "Script de vídeo 60 segundos", state: includeScript, set: setIncludeScript },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2 min-h-[44px]">
                  <Checkbox id={item.id} checked={item.state} onCheckedChange={(v) => item.set(!!v)} />
                  <label htmlFor={item.id} className="text-sm text-foreground">{item.label}</label>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={loading || !productName.trim()} className="w-full h-12 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base">
              {loading ? "Gerando funil..." : "Gerar funil completo →"}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="anuncios">
            <TabsList className="mb-4 overflow-x-auto flex w-full md:w-auto">
              <TabsTrigger value="anuncios" className="text-xs md:text-sm whitespace-nowrap">Anúncios</TabsTrigger>
              <TabsTrigger value="landing" className="text-xs md:text-sm whitespace-nowrap">Landing Page</TabsTrigger>
              <TabsTrigger value="emails" className="text-xs md:text-sm whitespace-nowrap">E-mails</TabsTrigger>
              <TabsTrigger value="script" className="text-xs md:text-sm whitespace-nowrap">Script de Vídeo</TabsTrigger>
            </TabsList>
            <TabsContent value="anuncios" className="space-y-3">
              {results.anuncios?.map((ad: any, i: number) => (
                <div key={i} className="bg-card rounded-lg shadow-premium p-3 md:p-4">
                  <p className="text-xs text-muted-foreground mb-1">{ad.plataforma}</p>
                  <p className="font-semibold text-foreground text-sm">{ad.titulo}</p>
                  <p className="text-sm text-muted-foreground mt-1">{ad.texto}</p>
                  <p className="text-sm text-primary font-medium mt-1">CTA: {ad.cta}</p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="landing">
              {results.landing && (
                <div className="bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-6">
                  {Object.entries(results.landing).map(([key, value]: [string, any]) => (
                    <div key={key} className="border-b border-border pb-4 last:border-0">
                      <h4 className="text-sm font-semibold text-foreground capitalize mb-2">{key.replace(/_/g, " ")}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</p>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => handleCopySection(JSON.stringify(results.landing, null, 2))} className="text-foreground min-h-[44px]">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copiar estrutura completa
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="emails" className="space-y-3">
              {results.emails?.map((email: any, i: number) => (
                <div key={i} className="bg-card rounded-lg shadow-premium p-4 md:p-5">
                  <p className="text-xs text-muted-foreground mb-1">E-mail {i + 1} — {email.tema || email.nome}</p>
                  <p className="font-semibold text-foreground text-sm">Assunto: {email.assunto}</p>
                  <p className="text-xs text-muted-foreground">Preheader: {email.preheader}</p>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{email.corpo}</p>
                  <p className="text-sm text-primary font-medium mt-2">CTA: {email.cta}</p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="script">
              {results.script && (
                <div className="bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
                  {(Array.isArray(results.script) ? results.script : Object.entries(results.script).map(([key, val]: [string, any]) => ({
                    titulo: key.charAt(0).toUpperCase() + key.slice(1),
                    tempo: val?.tempo || "",
                    texto: val?.texto || "",
                  }))).map((segment: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-xs font-mono text-primary font-bold whitespace-nowrap">{segment.tempo}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{segment.titulo}</p>
                        <p className="text-sm text-muted-foreground">{segment.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Funil;
