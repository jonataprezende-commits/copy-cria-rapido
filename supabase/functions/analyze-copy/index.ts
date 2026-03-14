import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return new Response(JSON.stringify({ error: "Usuário não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userId = userData.user.id;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (!profile) return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const isPro = profile.plan === "pro" || profile.plan === "agency";
    if (!isPro && (profile.analyses_used || 0) >= (profile.analyses_limit || 2)) {
      return new Response(JSON.stringify({ error: "limit_reached" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { copyText, platform } = await req.json();

    const systemPrompt = `Você é o melhor analista de copywriting do Brasil.
Analise este copy para ${platform}: '${copyText}'
Retorne APENAS JSON válido:
{
  "nota_geral": 7.2,
  "classificacao": "Pode melhorar",
  "breakdown": { "clareza": 8, "headline": 6, "cta": 7, "gatilhos": 5, "adequacao": 8 },
  "feedbacks": { "clareza": "...", "headline": "...", "cta": "...", "gatilhos": "...", "adequacao": "..." },
  "pontos_positivos": ["..."],
  "pontos_negativos": ["..."],
  "versao_melhorada": { "titulo": "...", "texto": "...", "cta": "..." },
  "resumo": "Diagnóstico em 2 frases."
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Analise: "${copyText}"` }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    const result = JSON.parse(content);

    // Save to analyses table
    await supabase.from("analyses").insert({ user_id: userId, original_copy: copyText, platform, score: result.nota_geral, breakdown: result.breakdown, positives: result.pontos_positivos, negatives: result.pontos_negativos, improved_copy: result.versao_melhorada });

    // Increment usage
    if (!isPro) {
      await supabase.from("profiles").update({ analyses_used: (profile.analyses_used || 0) + 1 }).eq("id", userId);
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[ANALYZE-COPY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
