import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [demoResults, setDemoResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gerarDemo = async () => {
    if (!productName.trim()) return;

    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Você é um copywriter especialista em marketing digital. Gere exatamente 3 variações curtas e persuasivas de copy para anúncio. Retorne APENAS JSON válido sem markdown: {\"copies\": [\"copy1\", \"copy2\", \"copy3\"]}",
            },
            {
              role: "user",
              content: `Produto: ${productName}. Gere 3 copies de anúncio curtos (máximo 15 palavras cada) e persuasivos em português brasileiro. Foque em benefício e urgência.`,
            },
          ],
          model: "openai",
          seed: Math.floor(Math.random() * 1000),
        }),
      });

      const text = await response.text();

      try {
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const data = JSON.parse(clean);
        const copies = data.copies || [];

        if (copies.length > 0) {
          setDemoResults(copies);
          setShowResults(true);
        } else {
          throw new Error("Nenhum copy gerado");
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        // Fallback com copies baseados no input
        const fallbackCopies = [
          `Descubra ${productName} — Resultados em dias`,
          `${productName}: A solução que você estava esperando`,
          `Experimente ${productName} e veja a diferença`,
        ];
        setDemoResults(fallbackCopies);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Demo generation error:", error);
      // Fallback com copies baseados no input
      const fallbackCopies = [
        `Descubra ${productName} — Resultados em dias`,
        `${productName}: A solução que você estava esperando`,
        `Experimente ${productName} e veja a diferença`,
      ];
      setDemoResults(fallbackCopies);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-lg shadow-premium p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Digite o nome do seu produto..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gerarDemo()}
            className="flex-1 h-12 text-base bg-background border-input focus-visible:ring-primary"
          />
          <Button
            onClick={gerarDemo}
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

          {showResults && !isLoading && demoResults.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4"
            >
              {demoResults.map((copy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.3 }}
                  className="p-4 rounded-md bg-background border border-border"
                >
                  <p className="text-xs text-muted-foreground mb-2">Variação {index + 1}</p>
                  <p className="font-semibold text-foreground text-sm">
                    <TypewriterText text={copy} delay={index * 0.4} />
                  </p>
                </motion.div>
              ))}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Quer ver mais variações e recursos avançados?{" "}
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
