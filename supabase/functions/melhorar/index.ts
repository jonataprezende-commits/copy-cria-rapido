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
    const { texto, plataforma } = await req.json();

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

    const prompt = `Você é um especialista em copywriting e análise de anúncios. Analise o seguinte texto para a plataforma ${plataforma}:

Texto: "${texto}"

Retorne APENAS JSON válido sem markdown, contendo:
- nota: uma nota de 0 a 10 para o copy
- classificacao: uma classificação como "Excelente", "Bom", "Pode melhorar", "Ruim"
- versao_melhorada: uma versão melhorada do copy
- sugestoes: um array de strings com sugestões de melhoria

Formato JSON esperado:
{
  "nota": 8.5,
  "classificacao": "Bom",
  "versao_melhorada": "Versão melhorada do copy aqui.",
  "sugestoes": ["Sugestão 1", "Sugestão 2", ...]
}`;

    const raw = await callAI(prompt);
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(clean);

    await supabaseClient.from("generations").insert({
      user_id: userId,
      type: "melhorar",
      input: { texto, plataforma },
      output: result,
      platform: plataforma,
      product_name: `Análise de copy para ${plataforma}`,
    });

    await supabaseClient.rpc("increment_generations_used", { user_uuid: userId });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[MELHORAR] Error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
