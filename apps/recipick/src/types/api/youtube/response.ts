// YouTube Data API v3 응답 타입

export interface YouTubeThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
  channelTitle: string;
  liveBroadcastContent: string;
}

export interface YouTubeVideoId {
  kind: string;
  videoId: string;
}

export interface YouTubeSearchItem {
  kind: string;
  etag: string;
  id: YouTubeVideoId;
  snippet: YouTubeVideoSnippet;
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

// YouTube Videos API (statistics)
export interface YouTubeVideoStatisticsItem {
  kind: string;
  etag: string;
  id: string;
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export interface YouTubeVideoStatisticsResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoStatisticsItem[];
}

// YouTube Captions API
export interface CaptionTrack {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    videoId: string;
    lastUpdated: string;
    trackKind: string;
    language: string;
    name: string;
    audioTrackType: string;
    isCC: boolean;
    isLarge: boolean;
    isEasyReader: boolean;
    isDraft: boolean;
    isAutoSynced: boolean;
    status: string;
  };
}

export interface CaptionListResponse {
  kind: string;
  etag: string;
  items: CaptionTrack[];
}
