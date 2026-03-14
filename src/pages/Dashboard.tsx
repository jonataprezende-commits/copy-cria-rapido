import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { GenerateForm } from "@/components/dashboard/GenerateForm";
import { CopyResults } from "@/components/dashboard/CopyResults";
import { SkeletonLoader } from "@/components/dashboard/SkeletonLoader";
import { PenTool } from "lucide-react";

const mockCopies = [
  {
    id: 1,
    titulo: "Aprenda Tráfego Pago do Zero",
    texto: "Mais de 8.400 alunos já faturam com anúncios. Começa hoje por R$1.",
    cta: "Quero começar agora",
    contagem_chars: 98,
    por_que_funciona: "Prova social + barreira de entrada baixíssima + urgência implícita",
  },
  {
    id: 2,
    titulo: "Seu primeiro cliente em 7 dias",
    texto: "Método validado com R$50 de investimento. Acesso imediato + suporte.",
    cta: "Ver o método completo",
    contagem_chars: 89,
    por_que_funciona: "Promessa específica de tempo + investimento pequeno = baixo risco percebido",
  },
  {
    id: 3,
    titulo: "Pare de perder dinheiro com ads",
    texto: "Descubra como transformar R$10/dia em clientes reais. Sem complicação.",
    cta: "Quero aprender agora",
    contagem_chars: 94,
    por_que_funciona: "Dor clara + solução acessível + CTA com desejo",
  },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<typeof mockCopies | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState("meta");

  const handleGenerate = (data: { platform: string }) => {
    setIsLoading(true);
    setResults(null);
    setCurrentPlatform(data.platform);
    setTimeout(() => {
      setIsLoading(false);
      setResults(mockCopies);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Usage bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
            <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
          </div>
          <span className="text-xs text-muted-foreground font-medium">3 de 5 gerações usadas este mês</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-lg shadow-premium p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Gerar Copy
              </h2>
              <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7">
            {isLoading && <SkeletonLoader />}
            {results && !isLoading && (
              <CopyResults
                copies={results}
                platform={currentPlatform}
                onRegenerate={() => handleGenerate({ platform: currentPlatform })}
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
    </div>
  );
};

export default Dashboard;
