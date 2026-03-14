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

    const userId = userData.user.id;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!profile) return new Response(JSON.stringify({ error: "Perfil não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const isPro = profile.plan === "pro" || profile.plan === "agency";
    if (!isPro && (profile.coach_sessions_used || 0) >= (profile.coach_sessions_limit || 5)) {
      return new Response(JSON.stringify({ error: "limit_reached" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { headline, body, cta, platform, objective } = await req.json();

    const systemPrompt = `Você é um coach de copywriting brasileiro.
Avalie este copy para ${platform} com objetivo ${objective}:
Headline: '${headline}'
Corpo: '${body}'
CTA: '${cta}'
Retorne APENAS JSON válido:
{
  "notas": { "persuasao": 8, "clareza": 10, "urgencia": 3, "cta": 7, "gatilhos": 5 },
  "feedbacks": { "persuasao": "...", "clareza": "...", "urgencia": "...", "cta": "...", "gatilhos": "..." },
  "nota_final": 6.6,
  "desafio": "...",
  "versao_coach": { "headline": "...", "body": "...", "cta": "..." }
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Avalie o copy acima.` }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI error: ${aiResponse.status}`);
    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices?.[0]?.message?.content);

    // Calculate XP
    let xpEarned = 0;
    if (isPro) {
      xpEarned = 10;
      if (result.nota_final >= 8) xpEarned = 20;
      if (result.nota_final >= 10) xpEarned = 50;

      const newXp = (profile.xp || 0) + xpEarned;
      let newLevel = "Iniciante";
      if (newXp > 600) newLevel = "Expert";
      else if (newXp > 300) newLevel = "Avançado";
      else if (newXp > 100) newLevel = "Intermediário";

      await supabase.from("profiles").update({ xp: newXp, xp_level: newLevel }).eq("id", userId);
    }

    // Save session
    await supabase.from("coach_sessions").insert({
      user_id: userId, headline, body, cta, platform,
      scores: result.notas, feedbacks: result.feedbacks,
      final_score: result.nota_final, xp_earned: xpEarned,
    });

    if (!isPro) {
      await supabase.from("profiles").update({ coach_sessions_used: (profile.coach_sessions_used || 0) + 1 }).eq("id", userId);
    }

    return new Response(JSON.stringify({ ...result, xp_earned: xpEarned }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[COACH-COPY] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
