import { NextResponse } from 'next/server';
import he from 'he';
import { parseTimedTextXml } from '@/lib/caption';
import {
  filterVideo,
  parseDurationSeconds,
  normalizeThumbnailUrl,
  HARD_EXCLUDE_KEYWORDS,
} from '@/lib/youtube';
import { getCachedSearch, setCachedSearch } from '@/lib/youtubeCache';
import { serverEnv } from '@/env/server';
import type { SearchResult, VideoItem } from '@/types/api/routeApi/response';
import type {
  YouTubeSearchResponse,
  YouTubeVideoDetailsResponse,
  YouTubeVideoSnippetResponse,
} from '@/types/api/youtube/response';

class ApiRouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

async function parseErrorPayload(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json().catch(() => null);
  }

  const text = await res.text().catch(() => '');
  return text.trim() === '' ? null : text;
}

function extractUpstreamMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return fallback;
}

/**
 * videos.list API로 영상 상세 정보(통계, 스니펫, contentDetails)를 배치 조회
 * @returns videoId → { viewCount, categoryId, durationSeconds, description, tags } 맵
 */
async function getVideoDetails(
  videoIds: string[],
  apiKey: string,
): Promise<
  Map<
    string,
    {
      viewCount: number;
      categoryId: string;
      durationSeconds: number;
      description: string;
      tags: string[];
    }
  >
> {
  if (videoIds.length === 0) return new Map();

  const params = new URLSearchParams({
    part: 'statistics,snippet,contentDetails',
    id: videoIds.join(','),
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) return new Map();

  const data: YouTubeVideoDetailsResponse = await res.json();
  const detailsMap = new Map<
    string,
    {
      viewCount: number;
      categoryId: string;
      durationSeconds: number;
      description: string;
      tags: string[];
    }
  >();

  for (const item of data.items) {
    detailsMap.set(item.id, {
      viewCount: parseInt(item.statistics.viewCount ?? '0', 10),
      categoryId: item.snippet.categoryId ?? '',
      durationSeconds: parseDurationSeconds(item.contentDetails?.duration ?? ''),
      description: item.snippet.description,
      tags: item.snippet.tags ?? [],
    });
  }
  return detailsMap;
}

async function searchVideos(q: string, pageToken?: string): Promise<SearchResult> {
  const cacheKey = pageToken ?? '';

  const cached = await getCachedSearch(q, cacheKey).catch(() => null);
  if (cached) return cached;

  const apiKey = serverEnv.youtubeDataApiKey;

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${q} 레시피`,
    type: 'video',
    maxResults: '25',
    regionCode: 'KR',
    relevanceLanguage: 'ko',
    key: apiKey,
    ...(pageToken && { pageToken }),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) {
    const payload = await parseErrorPayload(res);
    throw new ApiRouteError(
      extractUpstreamMessage(payload, `YouTube API 오류: ${res.status}`),
      res.status,
      payload,
    );
  }

  const data: YouTubeSearchResponse = await res.json();

  // 1차 필터: Hard exclude 키워드만 (검색 단계에서 명백한 비요리 영상 제거)
  const hardFiltered = data.items.filter(
    (item) =>
      !HARD_EXCLUDE_KEYWORDS.some((kw) =>
        item.snippet.title.toLowerCase().includes(kw.toLowerCase()),
      ),
  );

  // videos.list로 상세 정보 배치 조회 (statistics + snippet + contentDetails)
  const videoIds = hardFiltered.map((item) => item.id.videoId);
  const detailsMap = await getVideoDetails(videoIds, apiKey);

  // 통합 필터: 다중 신호(카테고리, 키워드, 조회수, duration) 종합 판별
  const videos: VideoItem[] = hardFiltered
    .filter((item) => {
      const details = detailsMap.get(item.id.videoId);
      return filterVideo({
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        description: details?.description ?? '',
        tags: details?.tags,
        categoryId: details?.categoryId,
        viewCount: details?.viewCount ?? 0,
        durationSeconds: details?.durationSeconds ?? 0,
      });
    })
    .map((item) => ({
      videoId: item.id.videoId,
      title: he.decode(item.snippet.title),
      channelName: item.snippet.channelTitle,
      thumbnail: normalizeThumbnailUrl(item.snippet.thumbnails),
      publishedAt: item.snippet.publishedAt,
    }));

  const result: SearchResult = {
    videos,
    nextPageToken: data.nextPageToken,
  };

  void setCachedSearch(q, cacheKey, result).catch(() => {
    // 캐시 저장 실패는 응답에 영향 없음
  });

  return result;
}

type CaptionResult = { text: string; lang: 'ko' | 'en' };

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
 */
async function getCaptionTracksFromPage(videoId: string): Promise<CaptionTrackInfo[]> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) return [];

  const html = await res.text();

  // captionTracks 배열 시작 위치를 찾아 괄호 카운팅으로 정확히 추출
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
      const lang = vssId.replace(/^a\./, '').replace(/^\./, '') || 'ko';
      return { baseUrl: track.baseUrl, lang, isAsr };
    });
  } catch {
    return [];
  }
}

async function getCaption(videoId: string): Promise<CaptionResult> {
  const tracks = await getCaptionTracksFromPage(videoId);
  if (tracks.length === 0) throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);

  // 우선순위: 수동 ko > 수동 en > ASR ko > ASR en
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
        const lang: 'ko' | 'en' = track.lang === 'en' ? 'en' : 'ko';
        return { text, lang };
      }
    } catch {
      continue;
    }
  }

  throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
}

async function getVideoDetail(videoId: string): Promise<{
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
  const thumbnail = thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? '';

  return {
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail,
    channelName: item.snippet.channelTitle,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'search') {
    const q = searchParams.get('q');
    const pageToken = searchParams.get('pageToken') ?? undefined;

    if (!q || q.trim() === '') {
      return NextResponse.json({ error: '검색어(q)가 필요합니다' }, { status: 400 });
    }

    try {
      const result = await searchVideos(q.trim(), pageToken);
      return NextResponse.json(result);
    } catch (error) {
      const status = error instanceof ApiRouteError ? error.status : 503;
      const message =
        error instanceof ApiRouteError ? error.message : 'YouTube 검색에 실패했습니다';

      return NextResponse.json(
        {
          error: message,
          ...(error instanceof ApiRouteError && error.details ? { details: error.details } : {}),
        },
        { status },
      );
    }
  }

  if (action === 'caption') {
    const videoId = searchParams.get('videoId');

    if (!videoId || videoId.trim() === '') {
      return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
    }

    try {
      const result = await getCaption(videoId.trim());
      return NextResponse.json({ caption: result.text, lang: result.lang });
    } catch {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }
  }

  if (action === 'videoDetail') {
    const videoId = searchParams.get('videoId');

    if (!videoId || videoId.trim() === '') {
      return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
    }

    try {
      const { title, description, thumbnail, channelName } = await getVideoDetail(videoId.trim());
      return NextResponse.json({ title, description, thumbnail, channelName });
    } catch {
      return NextResponse.json({ error: '영상 정보를 가져올 수 없습니다' }, { status: 503 });
    }
  }

  return NextResponse.json(
    { error: 'action 파라미터가 필요합니다 (search | caption | videoDetail)' },
    { status: 400 },
  );
}
