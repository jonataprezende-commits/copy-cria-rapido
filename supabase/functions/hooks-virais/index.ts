import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callAI(prompt: string): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], max_tokens: 2000 })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Configure OPENAI_API_KEY ou GEMINI_API_KEY nos Secrets do Supabase.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { nicho, estilo } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Usuário não autenticado");
    const userId = userData.user.id;

    const { data: profile, error: profileError } = await supabaseClient.from("profiles").select("*").eq("id", userId).single();
    if (profileError || !profile) throw new Error("Perfil não encontrado");

    const isPro = profile.plan === "pro" || profile.plan === "agency";
    if (!isPro && profile.generations_used >= profile.generations_limit) {
      return new Response(JSON.stringify({ error: "limite_atingido", message: "Você atingiu o limite do plano grátis" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const prompt = `Você é um especialista em criar hooks virais para redes sociais. Gere 20 hooks para o nicho: ${nicho}, com o estilo: ${estilo}.

Retorne APENAS JSON válido sem markdown, contendo um array de objetos com o número, texto e tipo do hook.

Formato JSON esperado:
{
  "hooks": [
    { "numero": 1, "texto": "Hook 1", "tipo": "Curiosidade" },
    { "numero": 2, "texto": "Hook 2", "tipo": "Polêmica" },
    ...
  ]
}`;

    const raw = await callAI(prompt);
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(clean);

    await supabaseClient.from("generations").insert({
      user_id: userId,
      type: "hooks-virais",
      input: { nicho, estilo },
      output: result,
      platform: "tiktok/reels",
      product_name: `Hooks para ${nicho}`,
    });

    await supabaseClient.rpc("increment_generations_used", { user_uuid: userId });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[HOOKS-VIRAIS] Error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
