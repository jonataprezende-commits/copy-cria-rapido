import { motion } from "framer-motion";
import { Zap, ArrowRight, CheckCircle, Sparkles, Flame, TrendingUp, Clock, Zap as ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      title: "Gerar Copy em 10 Segundos",
      description: "Preencha o nome do seu produto e receba 10 variações de copy profissional e otimizado para conversão.",
      icon: Zap,
      color: "text-primary",
    },
    {
      title: "Fábrica de Conteúdo Completa",
      description: "Gere headlines, hooks virais, CTAs e ideias de criativos em um único clique.",
      icon: Sparkles,
      color: "text-accent",
    },
    {
      title: "Melhorar Copy Existente",
      description: "Analise seus anúncios e receba sugestões de melhoria com nota de qualidade.",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Roteiro de Vídeo Automático",
      description: "Crie roteiros profissionais para TikTok, Reels e Shorts em segundos.",
      icon: Flame,
      color: "text-accent",
    },
  ];

  const stats = [
    { value: "10M+", label: "Copies gerados" },
    { value: "50K+", label: "Usuários ativos" },
    { value: "3.2x", label: "Aumento em CTR" },
    { value: "24/7", label: "Suporte IA" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-6">
                <Zap className="w-3 h-3" /> Gerador de copy com IA
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
                Gere anúncios que vendem em <span className="text-primary">10 segundos</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Chega de copy ruim. CopyHunter gera copies profissionais, otimizados e prontos para converter usando IA avançada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={() => navigate("/entrar")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 text-base"
                >
                  Começar grátis agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                >
                  Ver demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                ✨ 5 gerações grátis por mês • Sem cartão de crédito • Acesso imediato
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <HeroDemo />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-border"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tudo que você precisa para criar anúncios que vendem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              De copies a roteiros de vídeo, CopyHunter é seu assistente de marketing completo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedFeature(i)}
                    className={`w-full text-left p-6 rounded-lg transition-all duration-200 ${
                      selectedFeature === i
                        ? "bg-card shadow-premium ring-2 ring-primary"
                        : "bg-card shadow-premium hover:shadow-premium-hover"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className={`w-6 h-6 ${feature.color} flex-shrink-0 mt-1`} />
                      <div>
                        <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              key={selectedFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-lg shadow-premium p-8 flex items-center justify-center min-h-96"
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full ${features[selectedFeature].color} bg-primary/10 flex items-center justify-center mx-auto mb-4`}>
                  {(() => {
                    const Icon = features[selectedFeature].icon;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{features[selectedFeature].title}</h3>
                <p className="text-muted-foreground mb-6">{features[selectedFeature].description}</p>
                <Button
                  onClick={() => navigate("/entrar")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Experimentar agora
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            Por que escolher CopyHunter?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "10x Mais Rápido",
                description: "Gere copies em segundos, não em horas. Aumente sua produtividade exponencialmente.",
                icon: Clock,
              },
              {
                title: "Otimizado para Conversão",
                description: "Cada copy é gerado com técnicas de copywriting comprovadas e psicologia do consumidor.",
                icon: TrendingUp,
              },
              {
                title: "Múltiplas Plataformas",
                description: "Meta Ads, Google Ads, TikTok, LinkedIn, Email e muito mais. Tudo em um lugar.",
                icon: Sparkles,
              },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-card rounded-lg shadow-premium p-8"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Pronto para revolucionar seus anúncios?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a 50 mil profissionais de marketing que já estão usando CopyHunter.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/entrar")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 text-base"
            >
              Começar grátis agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <PlatformSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
      <script
        src="https://pollinations.ai/embed/chat.js"
        data-bot-name="copyhunter-bot"
        data-bot-avatar="https://copyhunter.app/logo.png" // Placeholder, replace with actual bot avatar path
        data-bot-color="#7C3AED"
        data-bot-welcome-message="Olá! Sou seu assistente CopyHunter. Como posso ajudar a criar copies incríveis hoje?"
      ></script>
    </div>
  );
};

export default Index;
