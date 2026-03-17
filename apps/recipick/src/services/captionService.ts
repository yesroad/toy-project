import 'server-only';
import { parseTimedTextXml } from '@/lib/caption';
import { serverEnv } from '@/env/server';
import type { YouTubeVideoSnippetResponse } from '@/types/api/youtube/response';

export type CaptionResult = { text: string; lang: 'ko' | 'en' };

interface CaptionTrackInfo {
  baseUrl: string;
  lang: string;
  isAsr: boolean;
}

// YouTube Android 앱이 내부적으로 사용하는 Innertube API 키 (공개값)
const INNERTUBE_API_KEY = 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM394';

const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '17.31.35',
    androidSdkVersion: 30,
    userAgent: 'com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip',
    hl: 'ko',
    gl: 'KR',
  },
};

/**
 * YouTube Innertube API로 자막 track 목록 조회.
 * HTML 스크래핑과 달리 서버 IP(Vercel AWS) 차단을 받지 않음.
 * YouTube Android 앱이 사용하는 /youtubei/v1/player 엔드포인트 활용.
 */
async function getCaptionTracksViaInnertube(videoId: string): Promise<CaptionTrackInfo[]> {
  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, context: INNERTUBE_CONTEXT }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];

  const data = await res.json();
  const tracks: Array<{ baseUrl: string; vssId?: string; languageCode?: string }> =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

  return tracks.map((track) => {
    const vssId = track.vssId ?? '';
    const isAsr = vssId.startsWith('a.');
    const langRaw = track.languageCode ?? (vssId.replace(/^a\./, '').replace(/^\./, '') || 'ko');
    const lang = langRaw.split('-')[0];
    return { baseUrl: track.baseUrl, lang, isAsr };
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
  // Innertube 우선 시도 → 실패 시 HTML 스크래핑 fallback
  let tracks = await getCaptionTracksViaInnertube(videoId);
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
