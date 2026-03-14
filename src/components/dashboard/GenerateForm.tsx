import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const platforms = [
  { value: "meta", label: "Meta Ads (Feed + Stories)" },
  { value: "google", label: "Google Ads (Pesquisa)" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "instagram", label: "Instagram (Feed + Stories)" },
  { value: "linkedin", label: "LinkedIn Ads" },
  { value: "email", label: "E-mail Marketing" },
  { value: "campanha", label: "🔒 Campanha Completa (Pro)" },
];

const tones = [
  { value: "profissional", label: "Profissional" },
  { value: "desconttraido", label: "Descontraído" },
  { value: "urgencia", label: "Urgência / Escassez" },
  { value: "emocional", label: "Emocional / Storytelling" },
  { value: "engracado", label: "Engraçado / Irreverente" },
  { value: "autoridade", label: "Autoridade / Técnico" },
];

const objectives = ["Cliques", "Vendas", "Cadastros", "Seguidores"];

interface GenerateFormProps {
  onGenerate: (data: {
    productName: string;
    description: string;
    audience: string;
    platform: string;
    tone: string;
    objective: string;
  }) => void;
  isLoading: boolean;
}

export function GenerateForm({ onGenerate, isLoading }: GenerateFormProps) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("meta");
  const [tone, setTone] = useState("urgencia");
  const [objective, setObjective] = useState("Vendas");
  const { profile } = useAuth();

  const isPro = profile?.plan === "pro";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ productName, description, audience, platform, tone, objective });
  };

  // Filter platforms for free users
  const availablePlatforms = isPro
    ? platforms
    : platforms.filter((p) => ["meta", "google"].includes(p.value) || p.value === "campanha");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label className="text-sm font-medium text-foreground">Nome do produto ou serviço</Label>
        <Input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="ex: Curso de Excel para Iniciantes"
          className="mt-1.5 h-11 bg-background"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground">Descrição em 1 frase</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ex: Curso online com certificado para quem quer dominar planilhas"
          className="mt-1.5 bg-background resize-none"
          rows={2}
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground">Público-alvo</Label>
        <Input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="ex: Mulheres de 30 a 45 anos interessadas em finanças"
          className="mt-1.5 h-11 bg-background"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-foreground">Plataforma</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="mt-1.5 h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePlatforms.map((p) => (
                <SelectItem
                  key={p.value}
                  value={p.value}
                  disabled={p.value === "campanha" && !isPro}
                >
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">Tom de voz</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="mt-1.5 h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-foreground">Objetivo do anúncio</Label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {objectives.map((obj) => (
            <button
              key={obj}
              type="button"
              onClick={() => setObjective(obj)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                objective === obj
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !productName.trim()}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all duration-150"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? "Gerando..." : "Gerar Copy com IA →"}
      </Button>
    </form>
  );
}
