export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import path from "path";

const HISTORY_SENTINEL = "###UCT_HISTORY###";

const PERSONA_PROMPT = `
You are Touhemi 🐧, the friendly official assistant for UCT 2.0 — Unmasking Cyber Threats, a national cybersecurity congress organized by the IEEE Computer Science Chapter at ISIMA (Institut Supérieur d'Informatique de Mahdia), Tunisia.

== YOUR JOB ==
Answer any question about UCT 2.0 using ONLY the knowledge base below. Be helpful and warm. Answer as fully as needed to be genuinely helpful. Never truncate a useful answer artificially. Reply in the same language the user writes in — French, English, or Tunisian Arabic. Match their register.

== CRITICAL: LANGUAGE & TYPO TOLERANCE ==
Users will make typos, use alternate spellings, Tunisian Arabic, or French. ALWAYS infer intent and answer regardless of spelling. Never refuse due to a spelling variation. Examples:
- "organisers" = "organizers" ✓
- "wein ysir" = "where is it" ✓
- "programme" = "program" ✓
- "ki naamlo l inscription" = "how to register" ✓
- "ctf comp" = "ctf competition" ✓
- "chkoun" = "who" ✓
- "waqteh" = "when" ✓
- "cybersécurité" = "cybersecurity" ✓

== CONFIDENCE RULE ==
If you are 60% or more confident about what the user is asking, answer it. Only fall back if the topic is genuinely unrelated to UCT or IEEE CS ISIMA.
`.trim();

const BEHAVIOR_RULES = `
== BEHAVIOR RULES ==

--- OUT OF SCOPE ---
Politely decline and redirect if the question is completely unrelated to UCT, IEEE CS ISIMA, or Tunisia's cybersecurity scene.

--- FALLBACK ---
If genuinely unsure, or neither the knowledge base nor the live website content covers it: "I don't have that detail yet — check @ieee.uct or email ieee.cs.isima@gmail.com."
Never invent facts that aren't in the knowledge base or website content.
`.trim();

export async function POST(req: Request) {
  console.log('[Touhemi] Function started');

  let user_message = '';
  let history: any[] = [];

  try {
    const body = await req.json();
    user_message = body.user_message ?? '';
    history = body.history ?? [];
    console.log('[Touhemi] Body parsed, message:', user_message.slice(0, 50));
  } catch (e) {
    console.error('[Touhemi] Failed to parse body:', e);
    return NextResponse.json({ bot_reply: 'Bad request.' }, { status: 400 });
  }

  console.log('[Touhemi] API key present:', !!process.env.OPENROUTER_API_KEY);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { bot_reply: "Assistant unavailable — API key not configured." },
      { status: 500 }
    );
  }

  console.log('[Touhemi] API key present:', !!apiKey, '| model: openai/gpt-oss-20b:free');

  const knowledgeText = "(knowledge base unavailable — only use the FALLBACK contact info)";

  const SYSTEM_PROMPT = `${PERSONA_PROMPT}\n\n== UCT 2.0 KNOWLEDGE BASE ==\n\n${knowledgeText}\n\n${BEHAVIOR_RULES}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: user_message },
  ];

  const openrouterRes = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "UCT 2.0 Chat",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        max_tokens: 800,
        messages,
        stream: true,
      }),
    }
  );

  if (!openrouterRes.ok || !openrouterRes.body) {
    const err = await openrouterRes.json().catch(() => ({}));
    const isQuotaExhausted = openrouterRes.status === 429 || openrouterRes.status === 402;

    console.error(
      isQuotaExhausted
        ? "[Touhemi] OpenRouter out of credits/rate-limited — check https://openrouter.ai/settings/credits:"
        : "[Touhemi] OpenRouter error:",
      err
    );
    console.error('[Touhemi] Status:', openrouterRes.status, '| Body:', err);

    const bot_reply = isQuotaExhausted
      ? "Touhemi is over capacity right now — please try again in a bit, or email ieee.cs.isima@gmail.com."
      : "Something went wrong — try again or email ieee.cs.isima@gmail.com.";

    return NextResponse.json(
      { bot_reply },
      { status: isQuotaExhausted ? 503 : 502 }
    );
  }

  const upstreamReader = openrouterRes.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let botReply = "";
      let buffer = "";
      let finished = false;

      try {
        while (!finished) {
          const { done, value } = await upstreamReader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();

            if (data === "[DONE]") {
              finished = true;
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const token = parsed?.choices?.[0]?.delta?.content;
              if (token) {
                botReply += token;
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // ignore malformed/keep-alive SSE lines
            }
          }
        }
      } catch (streamErr) {
        console.error("[Touhemi] Stream read error:", streamErr);
      }

      if (!botReply) {
        botReply = "I didn't get a response — try again or email ieee.cs.isima@gmail.com.";
        controller.enqueue(encoder.encode(botReply));
      }

      const updatedHistory = [
        ...history,
        { role: "user", content: user_message },
        { role: "assistant", content: botReply },
      ];

      // The updated history (including this reply) only exists once the
      // stream is done — but HTTP headers ship before the body, so they
      // can't carry data that isn't known yet. It's appended to the body
      // instead, behind a sentinel the client strips before rendering.
      controller.enqueue(encoder.encode(HISTORY_SENTINEL + JSON.stringify(updatedHistory)));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
