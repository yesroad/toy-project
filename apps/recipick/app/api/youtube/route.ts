import { NextResponse } from 'next/server';
import { parseTimedTextXml } from '@/lib/caption';
import {
  filterVideoByTitle,
  normalizeThumbnailUrl,
  CHANNEL_WHITELIST,
  MIN_VIEW_COUNT,
} from '@/lib/youtube';
import type { SearchResult, VideoItem } from '@/types/api/routeApi/response';
import type {
  YouTubeSearchResponse,
  YouTubeVideoStatisticsResponse,
} from '@/types/api/youtube/response';

/**
 * videos.list API로 조회수를 배치 조회
 * @returns videoId → viewCount 맵
 */
async function getVideoViewCounts(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, number>> {
  if (videoIds.length === 0) return new Map();

  const params = new URLSearchParams({
    part: 'statistics',
    id: videoIds.join(','),
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) return new Map();

  const data: YouTubeVideoStatisticsResponse = await res.json();
  const viewCountMap = new Map<string, number>();
  for (const item of data.items) {
    viewCountMap.set(item.id, parseInt(item.statistics.viewCount ?? '0', 10));
  }
  return viewCountMap;
}

async function searchVideos(q: string, pageToken?: string): Promise<SearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${q} 레시피 요리`,
    type: 'video',
    maxResults: '20',
    regionCode: 'KR',
    relevanceLanguage: 'ko',
    key: apiKey,
    ...(pageToken && { pageToken }),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

  const data: YouTubeSearchResponse = await res.json();

  // 1차 필터: 제목 키워드 (포함/제외)
  const titleFiltered = data.items.filter((item) => filterVideoByTitle(item.snippet.title));

  // 2차 필터: 조회수 (화이트리스트 채널은 통과)
  const videoIds = titleFiltered.map((item) => item.id.videoId);
  const viewCountMap = await getVideoViewCounts(videoIds, apiKey);

  const videos: VideoItem[] = titleFiltered
    .filter((item) => {
      if (CHANNEL_WHITELIST.includes(item.snippet.channelId)) return true;
      const viewCount = viewCountMap.get(item.id.videoId) ?? 0;
      return viewCount >= MIN_VIEW_COUNT;
    })
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail: normalizeThumbnailUrl(item.snippet.thumbnails),
      publishedAt: item.snippet.publishedAt,
    }));

  return {
    videos,
    nextPageToken: data.nextPageToken,
  };
}

async function getCaption(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&fmt=srv3`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok || res.status === 204) {
    const asrUrl = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&kind=asr&fmt=srv3`;
    const asrRes = await fetch(asrUrl, { cache: 'no-store' });
    if (!asrRes.ok) throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
    const xml = await asrRes.text();
    return parseTimedTextXml(xml);
  }

  const xml = await res.text();
  return parseTimedTextXml(xml);
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
    } catch {
      return NextResponse.json({ error: 'YouTube 검색에 실패했습니다' }, { status: 503 });
    }
  }

  if (action === 'caption') {
    const videoId = searchParams.get('videoId');

    if (!videoId || videoId.trim() === '') {
      return NextResponse.json({ error: 'videoId가 필요합니다' }, { status: 400 });
    }

    try {
      const caption = await getCaption(videoId.trim());
      return NextResponse.json({ caption });
    } catch {
      return NextResponse.json(
        { error: '자막이 없거나 접근할 수 없는 영상입니다' },
        { status: 422 },
      );
    }
  }

  return NextResponse.json(
    { error: 'action 파라미터가 필요합니다 (search | caption)' },
    { status: 400 },
  );
}
