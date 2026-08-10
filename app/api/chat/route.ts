export const runtime = 'nodejs';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log('[Touhemi] Started');

  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('[Touhemi] Key present:', !!apiKey, '| Key length:', apiKey?.length ?? 0);

  if (!apiKey) {
    return NextResponse.json({ bot_reply: 'No API key.' }, { status: 500 });
  }

  const { user_message } = await req.json();
  console.log('[Touhemi] Message:', user_message);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b:free',
      max_tokens: 100,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: user_message }
      ]
    })
  });

  console.log('[Touhemi] OpenRouter status:', res.status);
  const data = await res.json();
  console.log('[Touhemi] Response:', JSON.stringify(data).slice(0, 200));

  const reply = data?.choices?.[0]?.message?.content ?? 'No reply.';
  return NextResponse.json({ bot_reply: reply });
}
