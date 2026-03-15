import { isCookingChannel, normalizeThumbnailUrl } from '@/lib/youtube';
import { parseTimedTextXml } from '@/lib/caption';
import type { YouTubeSearchResponse, SearchResult, VideoItem } from '@/types/youtube.types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube 영상 검색 (요리 채널 필터링 포함)
 */
export async function searchVideos(query: string, pageToken?: string): Promise<SearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query} 레시피 요리`,
    type: 'video',
    maxResults: '20',
    regionCode: 'KR',
    relevanceLanguage: 'ko',
    key: apiKey,
    ...(pageToken && { pageToken }),
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`, {
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data: YouTubeSearchResponse = await res.json();

  const videos: VideoItem[] = data.items
    .filter((item) => isCookingChannel(item.snippet.channelTitle, item.snippet.title))
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

/**
 * YouTube 자동 생성 자막(timedtext) 다운로드
 * OAuth 없이 접근 가능한 공개 자막 엔드포인트 사용
 */
export async function getCaption(videoId: string): Promise<string> {
  const url = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&fmt=srv3`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok || res.status === 204) {
    // 한국어 자막 없으면 자동생성(asr) 시도
    const asrUrl = `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}&kind=asr&fmt=srv3`;
    const asrRes = await fetch(asrUrl, { cache: 'no-store' });

    if (!asrRes.ok) {
      throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
    }

    const xml = await asrRes.text();
    return parseTimedTextXml(xml);
  }

  const xml = await res.text();
  return parseTimedTextXml(xml);
}
