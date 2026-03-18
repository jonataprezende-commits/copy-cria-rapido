import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function callAI(prompt: string): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY")
  const geminiKey = Deno.env.get("GEMINI_API_KEY")

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], max_tokens: 2000 })
    })
    const data = await res.json()
    return data.choices[0].message.content
  }

  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    )
    const data = await res.json()
    return data.candidates[0].content.parts[0].text
  }

  throw new Error("Configure OPENAI_API_KEY ou GEMINI_API_KEY nos Secrets do Supabase.")
}

async function gerarPorPlataforma(platform: string, productName: string, description: string, audience: string, objective: string) {
  const prompt = `Gere exatamente 10 anúncios para ${platform} em português brasileiro.
Produto: "${productName}". ${description}. Público: ${audience}. Objetivo: ${objective}.
Retorne APENAS JSON sem markdown:
{"copies":[{"id":1,"titulo":"...","texto":"...","cta":"..."}]}`

  const raw = await callAI(prompt)
  const clean = raw.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim()
  try {
    const parsed = JSON.parse(clean);
    return parsed.copies.map((c: any) => ({ ...c, platform }));
  } catch (parseError) {
    console.error(`[GENERATE-CAMPAIGN] JSON Parse Error for ${platform}:`, parseError);
    console.error(`[GENERATE-CAMPAIGN] Raw AI response for ${platform}:`, raw);
    throw new Error(`Erro ao processar resposta da IA para ${platform}. Resposta bruta: ${raw.substring(0, 200)}...`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { productName, description, audience, objective } = await req.json()

    const [meta, google, tiktok, instagram, headlines] = await Promise.all([
      gerarPorPlataforma("Meta Ads", productName, description || "", audience || "", objective || "Vendas"),
      gerarPorPlataforma("Google Ads", productName, description || "", audience || "", objective || "Vendas"),
      gerarPorPlataforma("TikTok Ads", productName, description || "", audience || "", objective || "Vendas"),
      gerarPorPlataforma("Instagram Ads", productName, description || "", audience || "", objective || "Vendas"),
      gerarPorPlataforma("Headlines", productName, description || "", audience || "", objective || "Vendas"),
    ])

    return new Response(JSON.stringify({ meta, google, tiktok, instagram, headlines, total: 50 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
