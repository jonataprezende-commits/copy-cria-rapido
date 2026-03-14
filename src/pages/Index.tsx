import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-lg">CopyHunter</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/entrar")}
              className="text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate("/entrar")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Criar conta grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-6">
              <Zap className="w-3 h-3" /> Gerador de copy com IA
            </span>
            <h1 className="text-display text-foreground mb-6 text-balance max-w-4xl mx-auto">
              Chega de copy ruim. Gere anúncios que vendem em 10 segundos.
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Cole o nome do seu produto e receba 10 variações de copy profissional para Meta, Google, TikTok e mais.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <HeroDemo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-8"
          >
            <Button
              size="lg"
              onClick={() => navigate("/entrar")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 text-base"
            >
              Criar copy grátis agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <PlatformSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
