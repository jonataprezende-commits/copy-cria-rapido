import { Zap, PenTool, Clock, Heart, Download, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

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
  const { profile, signOut, isSubscribed } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const isPro = profile?.plan === "pro";
  const used = profile?.generations_used ?? 0;
  const limit = profile?.generations_limit ?? 5;
  const usagePercent = isPro ? 0 : Math.min((used / limit) * 100, 100);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao iniciar checkout.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Sessão encerrada.");
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center px-5 border-b border-border">
        <a href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">CopyHunter</span>
        </a>
      </div>

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

      <div className="px-3 pb-3">
        <div className="bg-muted rounded-lg p-4 mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {isPro ? "Plano Pro ✨" : "Plano Grátis"}
          </p>
          {!isPro && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{used} de {limit} gerações</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${usagePercent}%` }} />
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full mt-3 h-9 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold transition-all duration-150"
              >
                {upgradeLoading ? "Aguarde..." : "Fazer upgrade para Pro ↗"}
              </Button>
            </>
          )}
          {isPro && (
            <p className="text-sm text-foreground font-medium">Gerações ilimitadas</p>
          )}
        </div>

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
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  );
}
