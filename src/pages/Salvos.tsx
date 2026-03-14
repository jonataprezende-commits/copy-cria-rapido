import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Heart, Copy, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SavedCopy {
  id: string;
  copy_text: string;
  platform: string | null;
  label: string | null;
  created_at: string;
}

const Salvos = () => {
  const { user } = useAuth();
  const [savedCopies, setSavedCopies] = useState<SavedCopy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_copies")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSavedCopies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_copies").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao deletar.");
      return;
    }
    setSavedCopies((prev) => prev.filter((c) => c.id !== id));
    toast.success("Copy removido dos salvos.");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Salvos</h1>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : savedCopies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Favorite os copies que você mais gostou para encontrar rápido depois.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {savedCopies.map((copy) => (
              <div key={copy.id} className="bg-card rounded-lg shadow-premium p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {copy.platform || "—"} • {new Date(copy.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(copy.copy_text)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(copy.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                {copy.label && (
                  <p className="font-semibold text-foreground text-sm mb-1">{copy.label}</p>
                )}
                <p className="text-sm text-muted-foreground whitespace-pre-line">{copy.copy_text}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Salvos;
