export const runtime = 'nodejs';

import { NextResponse } from "next/server";

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

const KNOWLEDGE_BASE = `
--- EVENT ---
- Full name: Unmasking Cyber Threats — 2nd Edition (UCT 2.0)
- Type: National Cybersecurity Congress
- Dates: 26–27 September 2026
- Location: Mahdia, Tunisia (exact venue shared with registered participants)
- Organizer: IEEE Computer Science Chapter at ISIMA Student Branch
- Tracks: Overnight CTF + Technical Challenge (in parallel)
- Round table with prominent cybersecurity experts
- Focus: technical depth, competitions, networking

--- PROGRAM ---
Day 1 (Sep 26):
  12:00 – Check In
  13:30 – Opening Ceremony
  15:00 – Conference / Talks
  17:00 – Workshops
  19:00 – Dinner
  20:00 – Party
  22:00 – Overnight CTF starts + Karaoke
  23:00 – Movie night

Day 2 (Sep 27):
  09:00 – End of CTF & Breakfast
  09:30 – Tour of Mahdia OR Murder Mystery Game (participant choice)
  12:00 – Lunch
  13:00 – Technical Challenge pitching (jury evaluation)
  15:00 – Break
  15:30 – Closing Ceremony & Awards

--- CTF ---
- Overnight jeopardy-style CTF from Day 1 night through Day 2 morning
- Categories: Web Exploitation (SQLi, XSS, SSRF), Reverse Engineering, Cryptography, OSINT, Forensics
- Beginner-friendly with progressive difficulty
- Teams of 2–4 recommended; solo registration allowed (organizers help with matching)

--- TECHNICAL CHALLENGE ---
- Separate track from CTF
- Teams solve a real-world cybersecurity scenario
- Pitch and defend to a jury on Day 2 at 13:00

--- PRE-EVENT TRAINING ---
- Free 14-session online workshop series on Cybersecurity Basics & CTF Methodology
- Runs July–September 2026, open to all Tunisian university students
- No application required
- Topics: Intro to Cybersecurity, Networking, Linux, Web Security, Crypto, OSINT, Forensics, Scripting for CTFs, practice CTF

--- AMBASSADORS ---
- Represent UCT at their university, promote and drive registrations
- Applications open until July 13 — form in the Ambassadors section of the website

--- REGISTRATION ---
- General registration not yet open
- Ambassador applications open until July 13
- Follow @ieee.uct on Instagram for the announcement

--- SPEAKERS & PARTNERS ---
- Lineup being finalized — prominent figures from Tunisia's cybersecurity scene
- Sponsorship inquiries: ieee.cs.isima@gmail.com

--- CONTACT ---
- Email: ieee.cs.isima@gmail.com
- Instagram: @ieee.uct
- Organized by: IEEE CS Chapter ISIMA Student Branch, Mahdia, Tunisia
`.trim();

const BEHAVIOR_RULES = `
== BEHAVIOR RULES ==

--- OUT OF SCOPE ---
Politely decline and redirect if the question is completely unrelated to UCT, IEEE CS ISIMA, or Tunisia's cybersecurity scene.

--- FALLBACK ---
If genuinely unsure, or the knowledge base doesn't cover it: "I don't have that detail yet — check @ieee.uct or email ieee.cs.isima@gmail.com."
Never invent facts that aren't in the knowledge base.
`.trim();

const SYSTEM_PROMPT = `${PERSONA_PROMPT}\n\n== UCT 2.0 KNOWLEDGE BASE ==\n\n${KNOWLEDGE_BASE}\n\n${BEHAVIOR_RULES}`;

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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { bot_reply: "Assistant unavailable — API key not configured." },
      { status: 500 }
    );
  }

  console.log('[Touhemi] API key present:', !!apiKey, '| model: openai/gpt-oss-20b:free');

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
