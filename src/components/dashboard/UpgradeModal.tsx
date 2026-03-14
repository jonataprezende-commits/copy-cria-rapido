import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  "Gerações ilimitadas",
  "Todas as plataformas",
  "10 variações por geração",
  "Histórico completo",
  "Exportar em DOCX e CSV",
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Você usou suas 5 gerações gratuitas deste mês 🎯
          </DialogTitle>
          <DialogDescription className="text-center">
            Assine o Pro e gere copies ILIMITADOS por apenas
          </DialogDescription>
        </DialogHeader>

        <div className="text-center my-4">
          <span className="text-4xl font-bold text-foreground">R$29</span>
          <span className="text-muted-foreground">/mês</span>
        </div>

        <div className="space-y-3 my-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            <Zap className="w-4 h-4 mr-2" />
            {loading ? "Redirecionando..." : "Assinar Pro agora →"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Continuar no plano grátis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
