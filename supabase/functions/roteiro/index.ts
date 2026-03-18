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
    const { produto, publico, duracao, plataforma } = await req.json();

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

    const prompt = `Você é um roteirista profissional para vídeos curtos de marketing. Crie um roteiro de vídeo de ${duracao} segundos para o produto: ${produto}, público-alvo: ${publico}, plataforma: ${plataforma}.

Retorne APENAS JSON válido sem markdown, contendo:
- cenas: um array de objetos com tempo, visual, narracao e emocao para cada cena
- dica_edicao: uma dica de edição para o vídeo

Formato JSON esperado:
{
  "cenas": [
    { "tempo": "0-5s", "visual": "Pessoa feliz usando o produto", "narracao": "Cansado de...?", "emocao": "Curiosidade" },
    { "tempo": "5-10s", "visual": "Problema sendo resolvido pelo produto", "narracao": "Com o ${produto}, seus problemas acabaram!", "emocao": "Alívio" },
    ...
  ],
  "dica_edicao": "Use transições rápidas e música animada."
}`;

    const raw = await callAI(prompt);
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(clean);

    await supabaseClient.from("generations").insert({
      user_id: userId,
      type: "roteiro",
      input: { produto, publico, duracao, plataforma },
      output: result,
      platform: plataforma,
      product_name: `Roteiro para ${produto}`,
    });

    await supabaseClient.rpc("increment_generations_used", { user_uuid: userId });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[ROTEIRO] Error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
