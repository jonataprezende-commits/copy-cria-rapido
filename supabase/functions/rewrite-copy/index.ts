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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return new Response(JSON.stringify({ error: "Usuário não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userId = userData.user.id;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!profile) return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const isPro = profile.plan === "pro" || profile.plan === "agency";
    if (!isPro && (profile.rewrites_used || 0) >= (profile.rewrites_limit || 3)) {
      return new Response(JSON.stringify({ error: "limit_reached" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { copyText, platform, versions } = await req.json();
    const versionsStr = versions.join(", ");

    const systemPrompt = `Reescreva este copy para ${platform} em ${versions.length} versões.
Original: '${copyText}'
Definições:
- curta: máx 80 chars, headline + CTA direto
- longa: mín 200 chars, storytelling completo
- agressiva: imperativo, escassez e urgência obrigatórios
- emocional: empatia, transformação, CTA suave
- tecnica: dados, ROI, linguagem técnica
- humoristica: leve, ironia sutil, memorável
Versões solicitadas: ${versionsStr}
Retorne APENAS JSON válido:
{ "versoes": [{ "tipo": "curta", "titulo": "...", "texto": "...", "cta": "...", "chars": 95, "gatilho_principal": "Urgência" }] }`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Reescreva: "${copyText}"` }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices?.[0]?.message?.content);

    if (!isPro) {
      await supabase.from("profiles").update({ rewrites_used: (profile.rewrites_used || 0) + 1 }).eq("id", userId);
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[REWRITE-COPY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
