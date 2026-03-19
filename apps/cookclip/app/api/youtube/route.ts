import { NextResponse } from 'next/server';
import he from 'he';
import {
  filterVideo,
  parseDurationSeconds,
  normalizeThumbnailUrl,
  HARD_EXCLUDE_KEYWORDS,
} from '@/lib/youtube';
import { getCachedSearch, setCachedSearch } from '@/lib/youtubeCache';
import { serverEnv } from '@/env/server';
import { getCaption, getVideoDetail } from '@/services/captionService';
import { ApiRouteError } from '../_shared/errors';
import type { SearchResult, VideoItem } from '@/types/api/routeApi/response';
import type {
  YouTubeSearchResponse,
  YouTubeVideoDetailsResponse,
} from '@/types/api/youtube/response';

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

  const hardFiltered = data.items.filter(
    (item) =>
      !HARD_EXCLUDE_KEYWORDS.some((kw) =>
        item.snippet.title.toLowerCase().includes(kw.toLowerCase()),
      ),
  );

  const videoIds = hardFiltered.map((item) => item.id.videoId);
  const detailsMap = await getVideoDetails(videoIds, apiKey);

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

  void setCachedSearch(q, cacheKey, result).catch(() => {});

  return result;
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
