import { NextResponse } from 'next/server';

const sanitizeFileName = (value = 'download') =>
  value.replace(/[^a-zA-Z0-9._\-() ]+/g, '_').trim() || 'download';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl  = searchParams.get('url');
  const download   = searchParams.get('download') === '1';
  // Optional: caller passes the real human-readable filename (e.g. "photo_123.jpg")
  const fileNameParam = searchParams.get('filename') || '';

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Unsupported url protocol' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(parsedUrl.toString());

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream request failed with status ${upstreamResponse.status}` },
        { status: upstreamResponse.status }
      );
    }

    const headers = new Headers(upstreamResponse.headers);
    headers.set(
      'Cache-Control',
      download ? 'no-store' : 'public, max-age=3600, stale-while-revalidate=86400'
    );

    // ── Filename resolution ──────────────────────────────────────────────────
    // Priority:
    //   1. `filename` query param  — the real human-readable name from the app
    //   2. Content-Disposition from upstream
    //   3. Last path segment of the URL (always a garbled Telegram ID — last resort)
    let resolvedFileName = '';
    if (fileNameParam) {
      resolvedFileName = sanitizeFileName(fileNameParam);
    } else {
      // Try upstream Content-Disposition first
      const upstreamCD = upstreamResponse.headers.get('Content-Disposition') || '';
      const cdMatch = upstreamCD.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/i);
      if (cdMatch?.[1]) {
        resolvedFileName = sanitizeFileName(cdMatch[1]);
      } else {
        // Fallback: use path segment but strip leading "file_" Telegram junk
        const pathSeg = parsedUrl.pathname.split('/').pop() || 'download';
        resolvedFileName = sanitizeFileName(pathSeg);
      }
    }

    headers.set(
      'Content-Disposition',
      `${download ? 'attachment' : 'inline'}; filename="${resolvedFileName}"`
    );

    // ── Content-Type: read from upstream first, then infer from filename ─────
    const upstreamCT = upstreamResponse.headers.get('Content-Type') || '';
    if (!upstreamCT || upstreamCT === 'application/octet-stream' || !download) {
      const nameLower = (resolvedFileName || targetUrl).toLowerCase();
      if (nameLower.endsWith('.pdf'))              headers.set('Content-Type', 'application/pdf');
      else if (nameLower.endsWith('.png'))         headers.set('Content-Type', 'image/png');
      else if (nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg'))
                                                   headers.set('Content-Type', 'image/jpeg');
      else if (nameLower.endsWith('.webp'))        headers.set('Content-Type', 'image/webp');
      else if (nameLower.endsWith('.gif'))         headers.set('Content-Type', 'image/gif');
      else if (nameLower.endsWith('.mp4'))         headers.set('Content-Type', 'video/mp4');
      else if (nameLower.endsWith('.mp3'))         headers.set('Content-Type', 'audio/mpeg');
      else if (nameLower.endsWith('.mov'))         headers.set('Content-Type', 'video/quicktime');
      else if (nameLower.endsWith('.webm'))        headers.set('Content-Type', 'video/webm');
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy url' },
      { status: 502 }
    );
  }
}