import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockCopies = [
  {
    titulo: "Aprenda Tráfego Pago do Zero",
    texto: "Mais de 8.400 alunos já faturam com anúncios. Começa hoje por R$1.",
    cta: "Quero começar agora",
  },
  {
    titulo: "Seu primeiro cliente em 7 dias",
    texto: "Método validado com R$50 de investimento. Acesso imediato + suporte.",
    cta: "Ver o método completo",
  },
  {
    titulo: "Pare de perder dinheiro com ads",
    texto: "Descubra o método que já gerou +R$2M em vendas para pequenos negócios.",
    cta: "Conhecer o método",
  },
];

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.01 }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.02, duration: 0.01 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function HeroDemo() {
  const [productName, setProductName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (!productName.trim()) return;
    setIsLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-lg shadow-premium p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Digite o nome do seu produto..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="flex-1 h-12 text-base bg-background border-input focus-visible:ring-primary"
          />
          <Button
            onClick={handleGenerate}
            disabled={!productName.trim() || isLoading}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-150"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Gerando..." : "Gerar exemplo"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-4"
            >
              {[80, 90, 70].map((w, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse-skeleton" style={{ width: `${w}%` }} />
                  <div className="h-3 bg-muted rounded animate-pulse-skeleton" style={{ width: `${w - 15}%` }} />
                </div>
              ))}
            </motion.div>
          )}

          {showResults && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4"
            >
              {mockCopies.map((copy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.3 }}
                  className="p-4 rounded-md bg-background border border-border"
                >
                  <p className="text-xs text-muted-foreground mb-1">Variação {index + 1}</p>
                  <p className="font-semibold text-foreground">
                    <TypewriterText text={copy.titulo} delay={index * 0.4} />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <TypewriterText text={copy.texto} delay={index * 0.4 + 0.5} />
                  </p>
                  <p className="text-xs text-primary font-medium mt-2">
                    <TypewriterText text={`CTA: ${copy.cta}`} delay={index * 0.4 + 1} />
                  </p>
                </motion.div>
              ))}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Quer ver as outras 7 variações?{" "}
                <a href="/entrar" className="text-primary font-medium hover:underline">
                  Crie sua conta grátis <ArrowRight className="inline w-3 h-3" />
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
