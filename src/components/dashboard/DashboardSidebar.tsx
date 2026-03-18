import { Zap, PenTool, Clock, Heart, Download, Settings, LogOut, FileSearch, RefreshCw, GraduationCap, Layers, Menu, X, Factory, Sparkles, ScrollText, Lightbulb, Barcode } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const topItems = [
  { to: "/campanha", icon: Zap, label: "Campanha 50x", badge: "NOVO", badgeColor: "bg-primary text-primary-foreground" },
];

const mainItems = [
  { to: "/fabrica", icon: Factory, label: "Fábrica de Conteúdo" },
  { to: "/hooks-virais", icon: Sparkles, label: "Hooks Virais" },
  { to: "/melhorar", icon: Lightbulb, label: "Melhorar Copy" },
  { to: "/roteiro", icon: ScrollText, label: "Roteiro de Vídeo" },
  { to: "/inspiracoes", icon: Lightbulb, label: "Inspirações de Anúncios" },
  { to: "/dashboard", icon: PenTool, label: "Gerar Copy" },
  { to: "/analisar", icon: FileSearch, label: "Analisar Copy" },
  { to: "/reescrever", icon: RefreshCw, label: "Reescrever" },
  { to: "/treinar", icon: GraduationCap, label: "Treinar Copy" },
  { to: "/codigo-de-barras", icon: Barcode, label: "Código de Barras" },

];

const historyItems = [
  { to: "/historico", icon: Clock, label: "Histórico" },
  { to: "/salvos", icon: Heart, label: "Salvos" },
  { to: "/exportar", icon: Download, label: "Exportar" },
];

const bottomItems = [
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const isPro = profile?.plan === "pro";

  const used = profile?.generations_used ?? 0;
  const limit = profile?.generations_limit ?? 5;
  const usagePercent = isPro ? 0 : Math.min((used / limit) * 100, 100);
  const xp = (profile as any)?.xp ?? 0;
  const xpLevel = (profile as any)?.xp_level ?? "Iniciante";

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

  const handleNav = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const renderNavItem = (item: any) => {
    const active = location.pathname === item.to;
    return (
      <a
        key={item.to}
        href={item.to}
        onClick={(e) => { e.preventDefault(); handleNav(item.to); }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 min-h-[44px] ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <item.icon className="w-[18px] h-[18px] shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
            {item.badge}
          </span>
        )}
      </a>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-border shrink-0">
        <a href="/" onClick={(e) => { e.preventDefault(); handleNav("/"); }} className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">CopyHunter</span>
        </a>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {topItems.map(renderNavItem)}
        <div className="h-px bg-border my-2" />
        {mainItems.map(renderNavItem)}
        <div className="h-px bg-border my-2" />
        {historyItems.map(renderNavItem)}
      </nav>

      <div className="px-3 pb-3 shrink-0">
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-primary">{xp} XP</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{xpLevel}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((xp % 100), 100)}%` }} 
            />
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 text-right">
            {100 - (xp % 100)} XP para o próximo nível
          </p>
        </div>

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
          {isPro && !isAgency && (
            <p className="text-sm text-foreground font-medium">Gerações ilimitadas</p>
          )}
          {isAgency && (
            <p className="text-sm text-foreground font-medium">Acesso completo</p>
          )}
        </div>

        {bottomItems.map(renderNavItem)}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 w-full min-h-[44px]"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </div>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-sm">CopyHunter</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="md:hidden h-14" />
    </>
  );
}

export function DashboardSidebar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0 shrink-0 hidden md:flex">
      <SidebarContent />
    </aside>
  );
}
