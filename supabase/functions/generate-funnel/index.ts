import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userData.user.id).single();
    if (profile?.plan !== "agency") {
      return new Response(JSON.stringify({ error: "Disponível apenas no Plano Agência" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { productName, description, audience, price, niche, includeAds, includeLanding, includeEmails, includeScript } = await req.json();

    const callAI = async (prompt: string) => {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`AI error: ${res.status}`);
      const data = await res.json();
      return JSON.parse(data.choices?.[0]?.message?.content);
    };

    const promises: Promise<any>[] = [];

    if (includeAds) {
      promises.push(callAI(`Gere 5 anúncios (3 Meta Ads, 2 Google Ads) para:
Produto: ${productName}. Preço: R$${price}. Público: ${audience}. Nicho: ${niche}.
Retorne JSON: { "anuncios": [{ "plataforma": "Meta Ads", "titulo": "...", "texto": "...", "cta": "..." }] }`));
    } else promises.push(Promise.resolve({ anuncios: [] }));

    if (includeLanding) {
      promises.push(callAI(`Crie a estrutura de uma landing page para:
Produto: ${productName}. Descrição: ${description}. Preço: R$${price}. Público: ${audience}.
Retorne JSON: { "landing": { "hero": "...", "dor": "...", "solucao": "...", "beneficios": ["..."], "depoimentos": ["..."], "garantia": "...", "faq": [{"pergunta":"...","resposta":"..."}], "cta_final": "..." } }`));
    } else promises.push(Promise.resolve({ landing: null }));

    if (includeEmails) {
      promises.push(callAI(`Crie uma sequência de 5 e-mails de vendas para:
Produto: ${productName}. Preço: R$${price}. Público: ${audience}.
E-mail 1: Boas-vindas. E-mail 2: O problema. E-mail 3: Solução + prova social. E-mail 4: Objeções. E-mail 5: Oferta + urgência.
Retorne JSON: { "emails": [{ "tema": "...", "assunto": "...", "preheader": "...", "corpo": "...", "cta": "..." }] }`));
    } else promises.push(Promise.resolve({ emails: [] }));

    if (includeScript) {
      promises.push(callAI(`Crie um script de vídeo de 60 segundos para:
Produto: ${productName}. Preço: R$${price}. Público: ${audience}.
Segmentos: [0-5s] Gancho, [5-15s] Problema, [15-30s] Solução, [30-45s] Prova, [45-55s] Oferta, [55-60s] CTA.
Retorne JSON: { "script": [{ "tempo": "0-5s", "titulo": "Gancho", "texto": "..." }] }`));
    } else promises.push(Promise.resolve({ script: [] }));

    const [adsResult, landingResult, emailsResult, scriptResult] = await Promise.all(promises);

    const funnelData = {
      anuncios: adsResult.anuncios || [],
      landing: landingResult.landing || null,
      emails: emailsResult.emails || [],
      script: scriptResult.script || [],
    };

    // Save
    await supabase.from("generations").insert({
      user_id: userData.user.id,
      product_name: productName,
      product_description: description,
      target_audience: audience,
      platform: "funnel",
      copies: funnelData,
    });

    return new Response(JSON.stringify(funnelData), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[GENERATE-FUNNEL] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
