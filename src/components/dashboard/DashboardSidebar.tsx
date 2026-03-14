import { Zap, PenTool, Clock, Heart, Download, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", icon: PenTool, label: "Gerar Copy" },
  { to: "/historico", icon: Clock, label: "Histórico" },
  { to: "/salvos", icon: Heart, label: "Salvos" },
  { to: "/exportar", icon: Download, label: "Exportar" },
];

const bottomItems = [
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border">
        <a href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">CopyHunter</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => { e.preventDefault(); navigate(item.to); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Usage widget */}
      <div className="px-3 pb-3">
        <div className="bg-muted rounded-lg p-4 mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Plano Grátis</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">3 de 5 gerações</span>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: "60%" }} />
          </div>
          <Button
            onClick={() => {}}
            className="w-full mt-3 h-9 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold transition-all duration-150"
          >
            Fazer upgrade para Pro ↗
          </Button>
        </div>

        {/* Bottom nav */}
        {bottomItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => { e.preventDefault(); navigate(item.to); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </a>
          );
        })}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  );
}
