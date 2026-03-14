import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">CopyHunter</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Feito com IA para marketeiros brasileiros 🇧🇷
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#precos" className="hover:text-foreground transition-colors duration-150">Preços</a>
          <a href="/entrar" className="hover:text-foreground transition-colors duration-150">Entrar</a>
        </div>
      </div>
    </footer>
  );
}
