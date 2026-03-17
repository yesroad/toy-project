import 'server-only';
import { Innertube } from 'youtubei.js';
import { parseTimedTextXml } from '@/lib/caption';
import { serverEnv } from '@/env/server';
import type { YouTubeVideoSnippetResponse } from '@/types/api/youtube/response';

/**
 * Vercel Edge Runtime(/api/caption)을 통해 자막을 조회.
 * Edge Runtime은 Cloudflare 네트워크에서 실행 → AWS Lambda IP 차단 우회.
 * VERCEL_URL 또는 NEXT_PUBLIC_APP_URL 환경변수로 자기 자신에게 요청.
 */
async function getCaptionViaEdgeRoute(videoId: string): Promise<CaptionResult> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

  const res = await fetch(`${baseUrl}/api/caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`edge caption route failed: ${res.status}`);

  const data = await res.json();
  if (data.error || !data.text) throw new Error(data.error ?? 'no caption');

  return { text: data.text, lang: data.lang ?? 'ko' };
}

export type CaptionResult = { text: string; lang: 'ko' | 'en' };

interface CaptionTrackInfo {
  baseUrl: string;
  lang: string;
  isAsr: boolean;
}

/**
 * youtubei.js 라이브러리로 자막 track 목록 조회.
 * 라이브러리가 Innertube API 변경을 자동 추적하므로 직접 구현 대비 유지보수가 유리함.
 * retrieve_player: false → 플레이어 JS 로드 생략으로 초기화 속도 개선.
 */
async function getCaptionTracksViaYoutubeiJs(videoId: string): Promise<CaptionTrackInfo[]> {
  const yt = await Innertube.create({ retrieve_player: false, location: 'KR', lang: 'ko' });
  const info = await yt.getBasicInfo(videoId, { client: 'ANDROID' });
  const tracks = info.captions?.caption_tracks ?? [];

  return tracks.map((track) => {
    const vssId = track.vss_id ?? '';
    const isAsr = vssId.startsWith('a.');
    const langRaw = track.language_code ?? (vssId.replace(/^a\./, '').replace(/^\./, '') || 'ko');
    const lang = langRaw.split('-')[0];
    return { baseUrl: track.base_url, lang, isAsr };
  });
}

/**
 * HTML 스크래핑 fallback: Innertube 실패 시에만 사용.
 * Vercel(AWS IP)에서는 YouTube가 차단하는 경우가 많음.
 */
async function getCaptionTracksFromPage(videoId: string): Promise<CaptionTrackInfo[]> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const keyIndex = html.indexOf('"captionTracks":');
  if (keyIndex === -1) return [];

  const arrayStart = html.indexOf('[', keyIndex);
  if (arrayStart === -1) return [];

  let depth = 0;
  let arrayEnd = arrayStart;
  for (let i = arrayStart; i < html.length; i++) {
    const ch = html[i];
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }

  try {
    const rawJson = html
      .slice(arrayStart, arrayEnd + 1)
      .replace(/\\u0026/g, '&')
      .replace(/\\u003d/g, '=')
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>');
    const tracks: Array<{ baseUrl: string; vssId?: string }> = JSON.parse(rawJson);
    return tracks.map((track) => {
      const vssId = track.vssId ?? '';
      const isAsr = vssId.startsWith('a.');
      const lang = (vssId.replace(/^a\./, '').replace(/^\./, '') || 'ko').split('-')[0];
      return { baseUrl: track.baseUrl, lang, isAsr };
    });
  } catch {
    return [];
  }
}

export async function getCaption(videoId: string): Promise<CaptionResult> {
  // 1차: Edge Runtime 경유 (Cloudflare IP → AWS 차단 우회)
  try {
    return await getCaptionViaEdgeRoute(videoId);
  } catch {
    // Edge Route 실패 시 기존 방식으로 fallback
  }

  // 2차: youtubei.js 라이브러리
  let tracks = await getCaptionTracksViaYoutubeiJs(videoId).catch(() => [] as CaptionTrackInfo[]);
  if (tracks.length === 0) {
    tracks = await getCaptionTracksFromPage(videoId);
  }
  if (tracks.length === 0) throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);

  const orderedTracks = [
    tracks.find((t) => t.lang === 'ko' && !t.isAsr),
    tracks.find((t) => t.lang === 'en' && !t.isAsr),
    tracks.find((t) => t.lang === 'ko' && t.isAsr),
    tracks.find((t) => t.lang === 'en' && t.isAsr),
  ].filter((t): t is CaptionTrackInfo => t !== undefined);

  for (const track of orderedTracks) {
    try {
      const res = await fetch(`${track.baseUrl}&fmt=srv3`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const text = parseTimedTextXml(xml);
      if (text.trim().length > 0) {
        const lang: 'ko' | 'en' = track.lang.startsWith('en') ? 'en' : 'ko';
        return { text, lang };
      }
    } catch {
      continue;
    }
  }

  throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
}

export async function getVideoDetail(videoId: string): Promise<{
  title: string;
  description: string;
  thumbnail: string;
  channelName: string;
}> {
  const params = new URLSearchParams({
    part: 'snippet',
    id: videoId,
    key: serverEnv.youtubeDataApiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

  const data: YouTubeVideoSnippetResponse = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error('영상을 찾을 수 없습니다');

  const thumbnails = item.snippet.thumbnails;
  const thumbnail =
    thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '';

  return {
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail,
    channelName: item.snippet.channelTitle,
  };
}
