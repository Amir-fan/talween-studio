import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.IMAGE_TO_LINE_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY/GOOGLE_API_KEY/IMAGE_TO_LINE_KEY in environment.' }, { status: 500 });
    }

    const urls = [
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    ];

    const results: any = {};
    for (const url of urls) {
      try {
        const res = await fetch(url);
        const json = await res.json();
        results[url.includes('/v1beta/') ? 'v1beta' : 'v1'] = {
          ok: res.ok,
          status: res.status,
          count: json?.models?.length || 0,
          names: (json?.models || []).map((m: any) => m?.name || m?.baseModel),
          raw: json
        };
      } catch (e: any) {
        results[url.includes('/v1beta/') ? 'v1beta' : 'v1'] = { ok: false, error: e?.message || String(e) };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}


