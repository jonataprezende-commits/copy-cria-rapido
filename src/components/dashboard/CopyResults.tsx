import { useState } from "react";
import { Copy, Check, Heart, RefreshCw, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CopyVariation {
  id: number;
  titulo: string;
  texto: string;
  cta: string;
  contagem_chars: number;
  por_que_funciona: string;
}

interface CopyResultsProps {
  copies: CopyVariation[];
  platform: string;
  generationId?: string | null;
  onRegenerate: () => void;
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.015, duration: 0.01 }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
}

function CopyCard({ copy, index, platform, generationId }: { copy: CopyVariation; index: number; platform: string; generationId?: string | null }) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleCopy = () => {
    navigator.clipboard.writeText(`${copy.titulo}\n${copy.texto}\n${copy.cta}`);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = () => {
    const prompt = encodeURIComponent(`Professional advertisement creative for: ${copy.titulo}. High quality, marketing style.`);
    const url = `https://pollinations.ai/p/${prompt}?width=1080&height=1080&nologo=true`;
    window.open(url, "_blank");
    toast.success("Gerando imagem do criativo...");
  };

  const handleFavorite = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (favorited) {
        setFavorited(false);
        toast.success("Removido dos salvos");
      } else {
        const { error } = await supabase.from("saved_copies").insert({
          user_id: user.id,
          generation_id: generationId || null,
          copy_text: `${copy.titulo}\n${copy.texto}\nCTA: ${copy.cta}`,
          platform,
          label: copy.titulo,
        });
        if (error) throw error;

        await supabase.from("usage_logs").insert({
          user_id: user.id,
          action: "save_copy",
          platform,
        });

        setFavorited(true);
        toast.success("Salvo com sucesso!");
      }
    } catch (e) {
      toast.error("Erro ao salvar copy.");
    } finally {
      setSaving(false);
    }
  };

  const charLimit = 125;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      className="p-5 rounded-lg bg-card shadow-premium hover:shadow-premium-hover transition-shadow duration-150"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">Variação {copy.id}</span>
        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              copy.contagem_chars > charLimit
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {copy.contagem_chars}/{charLimit} chars
          </span>
          <button
            onClick={handleFavorite}
            disabled={saving}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
          >
            <Heart
              className={`w-4 h-4 ${
                favorited ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            onClick={handleGenerateImage}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
            title="Gerar Imagem do Criativo"
          >
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <p className="font-semibold text-foreground text-sm">
        <TypewriterText text={copy.titulo} delay={index * 0.3} />
      </p>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        <TypewriterText text={copy.texto} delay={index * 0.3 + 0.4} />
      </p>
      <p className="text-sm text-primary font-medium mt-2">
        <TypewriterText text={`CTA: ${copy.cta}`} delay={index * 0.3 + 0.8} />
      </p>
      <p className="text-xs text-muted-foreground mt-3 italic">
        💡 {copy.por_que_funciona}
      </p>
    </motion.div>
  );
}

const platformLabels: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
  instagram: "Instagram",
  linkedin: "LinkedIn Ads",
  email: "E-mail Marketing",
};

export function CopyResults({ copies, platform, generationId, onRegenerate }: CopyResultsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">
            {platformLabels[platform] || platform} — {copies.length} variações geradas
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="text-muted-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Gerar novamente
        </Button>
      </div>

      <div className="space-y-4">
        {copies.map((copy, i) => (
          <CopyCard key={copy.id} copy={copy} index={i} platform={platform} generationId={generationId} />
        ))}
      </div>
    </div>
  );
}
