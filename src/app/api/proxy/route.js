import { NextResponse } from 'next/server';

const sanitizeFileName = (value = 'download') => value.replace(/[^a-zA-Z0-9._-]+/g, '_');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const download = searchParams.get('download') === '1';

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
    headers.set('Cache-Control', download ? 'no-store' : 'public, max-age=3600, stale-while-revalidate=86400');
    
    // Force inline or attachment
    headers.set('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${sanitizeFileName(parsedUrl.pathname.split('/').pop() || 'download')}"`);

    // Override content type to proper format to ensure browsers preview it correctly instead of downloading
    const targetUrlLower = targetUrl.toLowerCase();
    if (!download) {
      if (targetUrlLower.endsWith('.pdf')) {
        headers.set('Content-Type', 'application/pdf');
      } else if (targetUrlLower.endsWith('.png')) {
        headers.set('Content-Type', 'image/png');
      } else if (targetUrlLower.endsWith('.jpg') || targetUrlLower.endsWith('.jpeg')) {
        headers.set('Content-Type', 'image/jpeg');
      } else if (targetUrlLower.endsWith('.webp')) {
        headers.set('Content-Type', 'image/webp');
      } else if (targetUrlLower.endsWith('.gif')) {
        headers.set('Content-Type', 'image/gif');
      } else if (targetUrlLower.endsWith('.mp4')) {
        headers.set('Content-Type', 'video/mp4');
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy url' },
      { status: 502 }
    );
  }
}