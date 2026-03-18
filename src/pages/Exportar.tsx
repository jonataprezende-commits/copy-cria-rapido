import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Exportar = () => {
  const { profile, user } = useAuth();
  const isPro = profile?.plan === "pro" || profile?.plan === "agency";
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user || !isPro) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setGenerations(data);
      setLoading(false);
    };
    fetch();
  }, [user, isPro]);

  const exportAsTxt = () => {
    const text = generations
      .map((g) => {
        const copies = Array.isArray(g.copies) ? g.copies : [];
        return `=== ${g.product_name} (${g.platform}) ===\n${copies
          .map((c: any) => `${c.titulo}\n${c.texto}\nCTA: ${c.cta}\n`)
          .join("\n")}`;
      })
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "copyhunter-export.txt";
    a.click();

    if (user) {
      supabase.from("usage_logs").insert({ user_id: user.id, action: "export", platform: "txt" });
    }
    toast.success("Exportação concluída!");
  };

  const exportAsDocx = async () => {
    setExporting(true);
    try {
      const { Document, Packer, Paragraph } = await import("docx");

      const sections = generations.map((g) => {
        const copies = Array.isArray(g.copies) ? g.copies : [];
        return [
          new Paragraph({
            text: g.product_name,
            heading: "Heading1",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Plataforma: ${g.platform} | Data: ${new Date(g.created_at).toLocaleDateString("pt-BR")}`,
            spacing: { after: 400 },
          }),
          ...copies.map((c: any) => [
            new Paragraph({
              text: c.titulo,
              bold: true,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: c.texto,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `CTA: ${c.cta}`,
              italics: true,
              spacing: { after: 300 },
            }),
          ]).flat(),
        ];
      }).flat();

      const doc = new Document({
        sections: [
          {
            children: sections,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "copyhunter-export.docx";
      a.click();

      if (user) {
        supabase.from("usage_logs").insert({ user_id: user.id, action: "export", platform: "docx" });
      }
      toast.success("Exportação em DOCX concluída!");
    } catch (e) {
      console.error("DOCX export error:", e);
      toast.error("Erro ao exportar em DOCX.");
    } finally {
      setExporting(false);
    }
  };

  const exportAsCsv = () => {
    const rows = [["Produto", "Plataforma", "Título", "Texto", "CTA", "Chars"]];
    generations.forEach((g) => {
      const copies = Array.isArray(g.copies) ? g.copies : [];
      copies.forEach((c: any) => {
        rows.push([g.product_name, g.platform, c.titulo, c.texto, c.cta, String(c.contagem_chars)]);
      });
    });

    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "copyhunter-export.csv";
    a.click();

    if (user) {
      supabase.from("usage_logs").insert({ user_id: user.id, action: "export", platform: "csv" });
    }
    toast.success("Exportação concluída!");
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

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Exportar</h1>

        {!isPro ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Lock className="w-10 h-10 text-muted-foreground/40 mb-4" />
            <h3 className="font-bold text-foreground mb-2">Disponível no plano Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte seus copies em TXT, CSV ou DOCX com o plano Pro.
            </p>
            <Button
              onClick={handleUpgrade}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-150"
            >
              Assinar Pro — R$29/mês
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Download className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhuma geração disponível para exportar.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-premium p-6 max-w-lg">
            <p className="text-sm text-muted-foreground mb-4">
              {generations.length} gerações disponíveis para exportação.
            </p>
            <div className="space-y-3">
              <Button onClick={exportAsTxt} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Exportar como TXT
              </Button>
              <Button onClick={exportAsDocx} disabled={exporting} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold">
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Exportando..." : "Exportar como DOCX"}
              </Button>
              <Button onClick={exportAsCsv} variant="outline" className="w-full text-foreground">
                <Download className="w-4 h-4 mr-2" />
                Exportar como CSV
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Exportar;
