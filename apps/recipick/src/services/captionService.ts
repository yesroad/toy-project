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

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
};

/**
 * YouTube 영상 페이지에서 서명된 자막 track URL 목록 추출.
 * 직접 timedtext API 호출 시 서버 IP 차단(429)되므로, 브라우저처럼 페이지를 열어
 * ytInitialPlayerResponse의 서명된 URL(signature/expire 포함)을 사용.
 * Vercel(AWS IP)에서는 YouTube HTML 스크래핑이 차단되므로 타임아웃을 3초로 단축.
 */
export async function getCaptionTracksFromPage(videoId: string): Promise<CaptionTrackInfo[]> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(3000),
    headers: BROWSER_HEADERS,
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
  const tracks = await getCaptionTracksFromPage(videoId);
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
        headers: BROWSER_HEADERS,
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
