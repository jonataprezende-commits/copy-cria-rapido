import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { GenerateForm } from "@/components/dashboard/GenerateForm";
import { CopyResults } from "@/components/dashboard/CopyResults";
import { SkeletonLoader } from "@/components/dashboard/SkeletonLoader";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { PenTool } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams, Navigate } from "react-router-dom";

interface CopyVariation {
  id: number;
  titulo: string;
  texto: string;
  cta: string;
  contagem_chars: number;
  por_que_funciona: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Algo deu errado.</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CopyVariation[] | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState("meta");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [lastFormData, setLastFormData] = useState<any>(null);
  const { profile, user, loading, refreshProfile, checkSubscription } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Assinatura Pro ativada com sucesso! 🎉");
      checkSubscription();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  const handleGenerate = async (data: {
    productName: string;
    description: string;
    audience: string;
    platform: string;
    tone: string;
    objective: string;
    businessType?: string;
    triggers?: string[];
  }) => {
    const isPro = profile?.plan === "pro";
    if (profile && !isPro && profile.generations_used >= profile.generations_limit) {
      setShowUpgrade(true);
      return;
    }

    setIsLoading(true);
    setResults(null);
    setCurrentPlatform(data.platform);
    setLastFormData(data);

    try {
      const { data: result, error } = await supabase.functions.invoke("generate-copy", {
        body: data,
      });

      if (error) throw error;

      if (result.error === "limit_reached") {
        setShowUpgrade(true);
        return;
      }

      if (result.error) throw new Error(result.error);

      setResults(result.copies);
      setGenerationId(result.generation_id);
      toast.success("Geração concluída com sucesso!");
      await refreshProfile();
    } catch (e: any) {
      console.error("Generate error:", e);
      toast.error(e.message || "Erro ao gerar copy. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = profile?.plan === "pro";
  const used = profile?.generations_used ?? 0;
  const limit = profile?.generations_limit ?? 5;
  const usagePercent = isPro ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {!isPro && (
          <div className="mb-4 md:mb-6 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${usagePercent}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {used} de {limit} gerações usadas este mês
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
          <div className="lg:col-span-5">
            <div className="bg-card rounded-lg shadow-premium p-4 md:p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Gerar Copy
              </h2>
              <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          <div className="lg:col-span-7">
            {isLoading && <SkeletonLoader />}
            {results && !isLoading && (
              <CopyResults
                copies={results}
                platform={currentPlatform}
                generationId={generationId}
                onRegenerate={() => lastFormData && handleGenerate(lastFormData)}
              />
            )}
            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <PenTool className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Preencha o formulário ao lado e gere seu primeiro copy em 10 segundos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

const Dashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default Dashboard;
