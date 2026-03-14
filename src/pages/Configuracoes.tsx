import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const Configuracoes = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);
    if (error) {
      toast.error("Erro ao salvar.");
    } else {
      toast.success("Alterações salvas!");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao abrir portal de assinatura.");
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erro ao iniciar checkout.");
    }
  };

  const isPro = profile?.plan === "pro";

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

        <div className="bg-card rounded-lg shadow-premium p-6 space-y-6">
          <div>
            <Label className="text-sm font-medium text-foreground">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 bg-background"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">E-mail</Label>
            <Input value={user?.email || ""} className="mt-1.5 h-11 bg-background" disabled />
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Plano atual</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPro ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {isPro ? "Pro ✨" : "Grátis"}
              </span>
              {isPro ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="text-foreground"
                >
                  Gerenciar assinatura
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleUpgrade}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150"
                >
                  Fazer upgrade para Pro
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
              className="text-foreground"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold text-destructive mb-2">Zona de perigo</h3>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;
