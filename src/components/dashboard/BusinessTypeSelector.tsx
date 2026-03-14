import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type BusinessType = "dropshipping" | "infoproduto" | "servico_local" | "saas" | "afiliado" | "ecommerce";

export interface TemplateConfig {
  label: string;
  emoji: string;
  productPlaceholder: string;
  audiencePlaceholder: string;
  defaultTone: string;
}

export const templates: Record<BusinessType, TemplateConfig> = {
  dropshipping: {
    label: "Dropshipping",
    emoji: "🛒",
    productPlaceholder: "ex: Massageador portátil LED",
    audiencePlaceholder: "ex: Pessoas 25-45 interessadas em bem-estar",
    defaultTone: "urgencia",
  },
  infoproduto: {
    label: "Infoproduto",
    emoji: "📚",
    productPlaceholder: "ex: Curso de Excel para iniciantes",
    audiencePlaceholder: "ex: Profissionais que querem aumentar a renda",
    defaultTone: "emocional",
  },
  servico_local: {
    label: "Serviço Local",
    emoji: "🏠",
    productPlaceholder: "ex: Clínica de estética em São Paulo",
    audiencePlaceholder: "ex: Mulheres 30-50 na região",
    defaultTone: "profissional",
  },
  saas: {
    label: "SaaS",
    emoji: "💻",
    productPlaceholder: "ex: Software de gestão financeira",
    audiencePlaceholder: "ex: Empreendedores de pequenas empresas",
    defaultTone: "profissional",
  },
  afiliado: {
    label: "Afiliado",
    emoji: "🤝",
    productPlaceholder: "ex: Curso de tráfego pago (Hotmart)",
    audiencePlaceholder: "ex: Pessoas que querem trabalhar online",
    defaultTone: "urgencia",
  },
  ecommerce: {
    label: "E-commerce",
    emoji: "🛍",
    productPlaceholder: "ex: Loja de roupas femininas online",
    audiencePlaceholder: "ex: Mulheres 20-40 anos",
    defaultTone: "desconttraido",
  },
};

const businessTypes: BusinessType[] = ["dropshipping", "infoproduto", "servico_local", "saas", "afiliado", "ecommerce"];

interface BusinessTypeSelectorProps {
  selected: BusinessType;
  onChange: (type: BusinessType) => void;
}

export function BusinessTypeSelector({ selected, onChange }: BusinessTypeSelectorProps) {
  const { user } = useAuth();

  const handleChange = (type: BusinessType) => {
    onChange(type);
    // Save preference
    if (user) {
      supabase.from("profiles").update({ preferred_template: type } as any).eq("id", user.id).then(() => {});
    }
  };

  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-muted-foreground mb-2">Tipo de negócio</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {businessTypes.map((type) => {
          const t = templates[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleChange(type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                selected === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
