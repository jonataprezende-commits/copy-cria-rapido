import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface TriggerOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export const allTriggers: TriggerOption[] = [
  { id: "urgencia", emoji: "⚡", label: "Urgência", description: "Só até hoje" },
  { id: "escassez", emoji: "🔥", label: "Escassez", description: "Últimas vagas" },
  { id: "prova_social", emoji: "👥", label: "Prova Social", description: "10k compraram" },
  { id: "autoridade", emoji: "🏆", label: "Autoridade", description: "15 anos exp." },
  { id: "reciprocidade", emoji: "🎁", label: "Reciprocidade", description: "Bônus grátis" },
  { id: "curiosidade", emoji: "🤔", label: "Curiosidade", description: "O segredo..." },
];

interface MentalTriggersProps {
  selected: string[];
  onChange: (triggers: string[]) => void;
}

export function MentalTriggers({ selected, onChange }: MentalTriggersProps) {
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro";

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else {
      if (!isPro && selected.length >= 3) {
        toast.error("Disponível no Plano Pro");
        return;
      }
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-1">Gatilhos mentais (opcional)</p>
      <p className="text-xs text-muted-foreground mb-3">Selecione os gatilhos que a IA deve usar no copy.</p>
      <div className="grid grid-cols-3 gap-2">
        {allTriggers.map((trigger) => {
          const isSelected = selected.includes(trigger.id);
          return (
            <button
              key={trigger.id}
              type="button"
              onClick={() => handleToggle(trigger.id)}
              className={`p-2.5 rounded-lg text-left transition-all duration-150 border ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/20"
              }`}
            >
              <span className="text-base">{trigger.emoji}</span>
              <p className="text-xs font-medium text-foreground mt-1">{trigger.label}</p>
              <p className="text-[10px] text-muted-foreground">{trigger.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
