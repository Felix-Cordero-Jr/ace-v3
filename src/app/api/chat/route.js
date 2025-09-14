// src/app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing "query" string.' }, { status: 400 });
    }

    const upstreamUrl =
      process.env.CHAT_API_URL ||
      'https://will-api-45901355656.us-south1.run.app/query';

    const r = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      // You can forward auth headers here if the upstream requires them
    });

    const contentType = r.headers.get('content-type') || '';
    const raw = await r.text();
    let data = raw;

    if (contentType.includes('application/json')) {
      try { data = JSON.parse(raw); } catch {}
    }

    // Normalize likely fields: answer/response/result/output
    const answer =
      (typeof data === 'object' && (data.answer || data.response || data.result || data.output)) ||
      (typeof data === 'string' ? data : raw);

    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: 'Upstream error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
