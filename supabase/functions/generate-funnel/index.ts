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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const { productName, description, audience, price, niche } = await req.json()
    const ctx = `Produto: ${productName}. Descrição: ${description || ""}. Público: ${audience || ""}. Preço: R$${price || ""}. Nicho: ${niche || ""}.`
    const clean = (s: string) => s.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    const [anunciosRaw, landingRaw, emailsRaw, scriptRaw] = await Promise.all([

      callAI(`Você é copywriter especialista. ${ctx}
Gere 5 anúncios (3 Meta Ads + 2 Google Ads) em português brasileiro.
Retorne APENAS JSON sem markdown:
{"anuncios":[{"plataforma":"Meta Ads","titulo":"...","texto":"...","cta":"..."}]}`),

      callAI(`Você é copywriter especialista. ${ctx}
Crie estrutura completa de landing page em português brasileiro.
Retorne APENAS JSON sem markdown:
{"landing":{"hero":{"headline":"...","subheadline":"...","cta":"..."},"dor":"...","solucao":"...","beneficios":["...","...","...","...","...","..."],"depoimentos":[{"nome":"...","texto":"..."},{"nome":"...","texto":"..."},{"nome":"...","texto":"..."}],"garantia":"...","faq":[{"pergunta":"...","resposta":"..."},{"pergunta":"...","resposta":"..."},{"pergunta":"...","resposta":"..."},{"pergunta":"...","resposta":"..."},{"pergunta":"...","resposta":"..."}],"cta_final":{"texto":"...","urgencia":"..."}}}`),

      callAI(`Você é especialista em email marketing. ${ctx}
Crie sequência de 5 emails em português brasileiro.
Retorne APENAS JSON sem markdown:
{"emails":[{"numero":1,"tema":"Boas-vindas","assunto":"...","preheader":"...","corpo":"...","cta":"..."},{"numero":2,"tema":"O problema","assunto":"...","preheader":"...","corpo":"...","cta":"..."},{"numero":3,"tema":"A solução","assunto":"...","preheader":"...","corpo":"...","cta":"..."},{"numero":4,"tema":"Quebra de objeções","assunto":"...","preheader":"...","corpo":"...","cta":"..."},{"numero":5,"tema":"Oferta final","assunto":"...","preheader":"...","corpo":"...","cta":"..."}]}`),

      callAI(`Você é especialista em VSL. ${ctx}
Crie script de vídeo de 60 segundos em português brasileiro.
Retorne APENAS JSON sem markdown:
{"script":[{"tempo":"0-5s","titulo":"Gancho","texto":"..."},{"tempo":"5-15s","titulo":"Problema","texto":"..."},{"tempo":"15-30s","titulo":"Solução","texto":"..."},{"tempo":"30-45s","titulo":"Prova","texto":"..."},{"tempo":"45-55s","titulo":"Oferta","texto":"..."},{"tempo":"55-60s","titulo":"CTA","texto":"..."}]}`)
    ])

    return new Response(JSON.stringify({
      anuncios: JSON.parse(clean(anunciosRaw)).anuncios,
      landing: JSON.parse(clean(landingRaw)).landing,
      emails: JSON.parse(clean(emailsRaw)).emails,
      script: JSON.parse(clean(scriptRaw)).script,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
