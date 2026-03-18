import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Fernanda Lima",
    role: "Empreendedor Digital",
    text: "Parei de contratar redator para anúncios simples. O CopyHunter paga o custo em 1 dia de uso.",
    stars: 5,
  },
  {
    name: "Ricardo Alves",
    role: "Gestor de Tráfego",
    text: "Em 10 segundos tenho 10 variações prontas. Minha produtividade triplicou desde que comecei a usar.",
    stars: 5,
  },
  {
    name: "Camila Santos",
    role: "Freelancer de Marketing",
    text: "Uso o modo campanha completa e economizo horas por semana. Melhor investimento de R$29 que já fiz.",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-h1 text-foreground mb-4 text-balance">
          Marketeiros brasileiros já usam
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          Veja o que estão dizendo sobre o CopyHunter.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="text-left p-6 rounded-lg bg-background shadow-premium"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground text-sm mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
