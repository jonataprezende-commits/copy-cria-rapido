import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const platformPrompts: Record<string, string> = {
  meta: "Meta Ads: títulos curtos, CTA direto, benefício emocional",
  google: "Google Ads: títulos até 30 chars, palavras-chave no início",
  tiktok: "TikTok: tom jovem, gancho nos primeiros 3s, linguagem de tendência",
  instagram: "Instagram: visual, copy curto, emojis, hashtags",
  headlines: "Headlines: apenas headlines variados, poderosos e chamativos",
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
    const isPro = profile?.plan === "pro" || profile?.plan === "agency";
    if (!isPro) return new Response(JSON.stringify({ error: "Disponível apenas no Plano Pro" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { productName, description, audience, objective } = await req.json();
    const platforms = ["meta", "google", "tiktok", "instagram", "headlines"];

    const generateForPlatform = async (platform: string) => {
      const prompt = `Gere 10 variações de anúncio para ${platform}.
${platformPrompts[platform] || ""}
Produto: ${productName}. Descrição: ${description}. Público: ${audience}. Objetivo: ${objective}.
Escreva em português brasileiro.
Retorne APENAS JSON: { "copies": [{ "id": 1, "titulo": "...", "texto": "...", "cta": "..." }] }`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) throw new Error(`AI error for ${platform}: ${res.status}`);
      const data = await res.json();
      return JSON.parse(data.choices?.[0]?.message?.content);
    };

    // Run all 5 in parallel
    const results = await Promise.all(platforms.map(generateForPlatform));

    const campaignData: Record<string, any> = {};
    platforms.forEach((p, i) => {
      campaignData[p] = results[i].copies || [];
    });

    // Save
    await supabase.from("generations").insert({
      user_id: userId,
      product_name: productName,
      product_description: description,
      target_audience: audience,
      platform: "campaign_50",
      objective,
      copies: campaignData,
    });

    await supabase.rpc("increment_generations_used", { user_uuid: userId });

    return new Response(JSON.stringify(campaignData), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[GENERATE-CAMPAIGN] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
