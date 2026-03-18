import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Grátis",
    price: "R$0",
    period: "/mês",
    description: "Para começar a testar",
    cta: "Começar grátis",
    highlighted: false,
    features: [
      { text: "5 gerações por mês", included: true },
      { text: "Meta Ads e Google Ads", included: true },
      { text: "3 variações por geração", included: true },
      { text: "2 análises por mês", included: true },
      { text: "Histórico salvo", included: false },
      { text: "Exportação", included: false },
    ],
  },
  {
    name: "Pro",
    price: "R$29",
    period: "/mês",
    description: "Para profissionais de marketing",
    cta: "Assinar Pro",
    highlighted: true,
    badge: "Mais popular",
    features: [
      { text: "Gerações ilimitadas", included: true },
      { text: "Todas as plataformas", included: true },
      { text: "10 variações por geração", included: true },
      { text: "Campanha 50 anúncios", included: true },
      { text: "Análises e reescritas ilimitadas", included: true },
      { text: "Coach de copy + XP", included: true },
    ],
  },

];

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4" id="precos">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-h1 text-foreground mb-4 text-balance">
          Preços simples, sem surpresas
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          Comece grátis. Faça upgrade quando precisar.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`relative p-8 rounded-lg text-left ${
                plan.highlighted
                  ? "bg-card shadow-premium-hover ring-2 ring-primary"
                  : "bg-card shadow-premium"
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}>
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate("/entrar")}
                className={`w-full h-11 font-semibold transition-all duration-150 ${
                  plan.highlighted
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
