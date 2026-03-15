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
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], max_tokens: 1500 })
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { copyText, platform } = await req.json()

    const prompt = `Você é o melhor analista de copywriting do Brasil.
Analise este copy para ${platform}: "${copyText}"
Retorne APENAS JSON válido sem markdown:
{
  "nota_geral": 7.2,
  "classificacao": "Pode melhorar",
  "breakdown": { "clareza": 8, "headline": 6, "cta": 7, "gatilhos": 5, "adequacao": 8 },
  "feedbacks": { "clareza": "...", "headline": "...", "cta": "...", "gatilhos": "...", "adequacao": "..." },
  "pontos_positivos": ["...", "..."],
  "pontos_negativos": ["...", "..."],
  "versao_melhorada": { "titulo": "...", "texto": "...", "cta": "..." },
  "resumo": "Diagnóstico em duas frases."
}`

    const raw = await callAI(prompt)
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const result = JSON.parse(clean)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
