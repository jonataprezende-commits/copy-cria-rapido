import { motion } from "framer-motion";
import { Facebook, Search, Music, Instagram, Linkedin, Mail } from "lucide-react";

const platforms = [
  { name: "Meta Ads", icon: Facebook },
  { name: "Google Ads", icon: Search },
  { name: "TikTok Ads", icon: Music },
  { name: "Instagram", icon: Instagram },
  { name: "LinkedIn Ads", icon: Linkedin },
  { name: "E-mail", icon: Mail },
];

export function PlatformSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-h1 text-foreground mb-4 text-balance">
          Copy otimizado para cada plataforma
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
          Formato, tom e limite de caracteres respeitados automaticamente.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card shadow-premium hover:shadow-premium-hover transition-shadow duration-150"
            >
              <platform.icon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{platform.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
