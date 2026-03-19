/**
 * Edge Runtime으로 YouTube 자막을 조회하는 내부 API.
 * Vercel Edge Runtime은 Cloudflare 네트워크 사용 → AWS Lambda IP 차단 우회.
 * captionService.ts에서 1차 시도로 호출하며, 실패 시 기존 방식으로 fallback.
 *
 * Edge Runtime은 server-only 모듈 사용 불가이므로 lib/caption에서 직접 import.
 */
export const runtime = 'edge';

import { parseYouTubeCaptionXml } from '@/lib/caption';

const CLIENTS = [
  {
    name: 'ANDROID_NEW',
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
    userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)',
  },
  {
    name: 'ANDROID_OLD',
    clientName: 'ANDROID',
    clientVersion: '17.31.35',
    userAgent: 'com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip',
  },
  {
    name: 'IOS',
    clientName: 'IOS',
    clientVersion: '19.45.4',
    userAgent: 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X)',
  },
] as const;

const WEB_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getTracksFromPlayer(
  videoId: string,
  client: (typeof CLIENTS)[number],
): Promise<Array<{ baseUrl: string; languageCode: string; kind?: string }>> {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': client.userAgent },
      body: JSON.stringify({
        context: { client: { clientName: client.clientName, clientVersion: client.clientVersion } },
        videoId,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  } catch {
    return [];
  }
}

async function fetchCaptionContent(url: string, userAgent: string): Promise<string | null> {
  for (const fmt of ['', '&fmt=srv3']) {
    try {
      const res = await fetch(`${url}${fmt}`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': userAgent },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const text = parseYouTubeCaptionXml(xml);
      if (text.trim().length > 0) return text;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchSimpleCaption(
  videoId: string,
  lang: string,
  kind: string,
): Promise<string | null> {
  const kindParam = kind ? `&kind=${kind}` : '';
  for (const fmt of ['', '&fmt=srv3']) {
    const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kindParam}${fmt}`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': WEB_UA },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const text = parseYouTubeCaptionXml(xml);
      if (text.trim().length > 0) return text;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: Request) {
  let videoId: string;
  try {
    ({ videoId } = await request.json());
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (!videoId || typeof videoId !== 'string') {
    return Response.json({ error: 'videoId required' }, { status: 400 });
  }

  // 1. 여러 클라이언트로 signed track 목록 조회
  let tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }> = [];
  let successUA: string = CLIENTS[0].userAgent;

  for (const client of CLIENTS) {
    tracks = await getTracksFromPlayer(videoId, client);
    if (tracks.length > 0) {
      successUA = client.userAgent;
      break;
    }
  }

  // 2. signed track이 있으면 콘텐츠 fetch 시도
  if (tracks.length > 0) {
    const ordered = [
      tracks.find((t) => t.languageCode === 'ko' && t.kind !== 'asr'),
      tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr'),
      tracks.find((t) => t.languageCode?.startsWith('ko')),
      tracks.find((t) => t.languageCode?.startsWith('en')),
      tracks[0],
    ].filter((t): t is NonNullable<typeof t> => t !== undefined);

    const seen = new Set<string>();
    const uniqueTracks = ordered.filter((t) => {
      if (seen.has(t.baseUrl)) return false;
      seen.add(t.baseUrl);
      return true;
    });

    for (const track of uniqueTracks) {
      const text = await fetchCaptionContent(track.baseUrl, successUA);
      if (text) {
        const lang = track.languageCode.startsWith('en') ? 'en' : 'ko';
        return Response.json({ text, lang });
      }
    }
  }

  // 3. simple timedtext URL fallback
  const candidates = [
    { lang: 'ko', kind: 'asr' },
    { lang: 'ko', kind: '' },
    { lang: 'en', kind: 'asr' },
    { lang: 'en', kind: '' },
  ];

  for (const { lang, kind } of candidates) {
    const text = await fetchSimpleCaption(videoId, lang, kind);
    if (text) {
      return Response.json({ text, lang: lang as 'ko' | 'en' });
    }
  }

  return Response.json({ error: 'no_caption_content' }, { status: 404 });
}
