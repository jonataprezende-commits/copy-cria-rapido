import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const platformGuides: Record<string, string> = {
  meta: "Títulos até 40 chars, texto até 125 chars, CTA direto. Foco em benefício emocional.",
  google: "Títulos até 30 chars (3 títulos), descrições até 90 chars (2). Palavras-chave no início.",
  tiktok: "Tom jovem, gancho nos primeiros 3 segundos, linguagem de tendência, CTA com urgência.",
  instagram: "Visual primeiro, copy curto, emojis permitidos, hashtags no final, CTA no link da bio.",
  linkedin: "Tom profissional, dado ou estatística no início, foco em ROI e resultado de negócio.",
  email: "Assunto até 50 chars (evitar palavras de spam), preheader, corpo com 1 CTA claro.",
};

async function callAI(prompt: string, systemPrompt?: string, tools?: any): Promise<any> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY")
  const geminiKey = Deno.env.get("GEMINI_API_KEY")

  if (openaiKey) {
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });
    
    const body: any = { model: "gpt-4o", messages, max_tokens: 2000 };
    if (tools) {
      body.tools = tools;
      body.tool_choice = { type: "function", function: { name: tools[0].function.name } };
    }
    
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (tools) {
      return JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
    }
    return data.choices[0].message.content
  }

  if (geminiKey) {
    // Gemini tool calling format is different, but for simplicity we'll just ask for JSON
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      }
    )
    const data = await res.json()
    const text = data.candidates[0].content.parts[0].text;
    if (tools) {
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean);
    }
    return text;
  }

  throw new Error("Configure OPENAI_API_KEY ou GEMINI_API_KEY nos Secrets do Supabase.")
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  }

  try {
    

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPro = profile.plan === "pro" || profile.plan === "agency";
    if (!isPro && profile.generations_used >= profile.generations_limit) {
      return new Response(JSON.stringify({ error: "limit_reached", message: "Você atingiu o limite de gerações gratuitas deste mês." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productName, description, audience, platform, tone, objective, businessType, triggers } = await req.json();
    const numVariations = isPro ? 10 : 3;

    let triggersInstruction = "";
    if (triggers && triggers.length > 0) {
      triggersInstruction = `\nGatilhos mentais obrigatórios: ${triggers.join(", ")}. Use de forma natural no copy.`;
    }

    let businessInstruction = "";
    if (businessType) {
      businessInstruction = `\nEste copy é para um negócio do tipo: ${businessType}. Adapte os gatilhos, vocabulário e estrutura para este nicho.`;
    }

    const systemPrompt = `Você é o melhor copywriter de anúncios do Brasil.
Escreva SEMPRE em português brasileiro (pt-BR).
Gere ${numVariations} variações de copy para ${platform}.
Regras da plataforma ${platform}:
${platformGuides[platform] || "Copy persuasivo e direto."}
Tom desejado: ${tone}
Objetivo: ${objective}${businessInstruction}${triggersInstruction}
Para cada variação entregue:
- titulo
- texto
- cta (call to action)
- contagem_chars (contagem total de caracteres do titulo + texto + cta)
- por_que_funciona (1 frase explicando por que esse copy funciona)
${triggers && triggers.length > 0 ? "- gatilhos_usados (array com os nomes dos gatilhos usados nesta variação)" : ""}
Seja direto, persuasivo, use gatilhos mentais naturalmente.
Escreva como brasileiro — sem português de Portugal.
Use gírias e expressões brasileiras quando o tom for descontraído.`;

    const userPrompt = `Produto: ${productName}
Descrição: ${description}
Público-alvo: ${audience}
Plataforma: ${platform}
Tom: ${tone}
Objetivo: ${objective}

Gere ${numVariations} variações de copy.`;

    console.log("[GENERATE-COPY] Calling AI for user", userId);

    const tools = [
          {
            type: "function",
            function: {
              name: "return_copies",
              description: "Return the generated ad copies",
              parameters: {
                type: "object",
                properties: {
                  copies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        titulo: { type: "string" },
                        texto: { type: "string" },
                        cta: { type: "string" },
                        contagem_chars: { type: "number" },
                        por_que_funciona: { type: "string" },
                        gatilhos_usados: { type: "array", items: { type: "string" } },
                      },
                      required: ["id", "titulo", "texto", "cta", "contagem_chars", "por_que_funciona"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["copies"],
                additionalProperties: false,
              },
            },
          },
        ];
    
    // Add instruction to return JSON if using Gemini
    const finalSystemPrompt = systemPrompt + "\n\nIMPORTANT: You must return ONLY valid JSON matching the return_copies schema.";
    const copies = await callAI(userPrompt, finalSystemPrompt, tools);

    const { data: generation, error: genError } = await supabase.from("generations").insert({
      user_id: userId, product_name: productName, product_description: description,
      target_audience: audience, platform, tone, objective, copies: copies.copies,
    }).select().single();

    if (genError) console.error("[GENERATE-COPY] DB insert error:", genError);

    await supabase.rpc("increment_generations_used", { user_uuid: userId });
    await supabase.from("usage_logs").insert({ user_id: userId, action: "generate", platform });

    console.log("[GENERATE-COPY] Success for user", userId);

    return new Response(JSON.stringify({ copies: copies.copies, generation_id: generation?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GENERATE-COPY] Error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
