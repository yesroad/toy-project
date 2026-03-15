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

// 앱 내부에서 사용하는 정제된 영상 타입
export interface VideoItem {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  publishedAt: string;
}

export interface SearchResult {
  videos: VideoItem[];
  nextPageToken?: string;
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
