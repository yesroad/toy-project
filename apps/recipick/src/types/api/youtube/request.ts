// YouTube Data API v3 요청 파라미터 타입

export interface YouTubeSearchParams {
  part: string;
  q: string;
  type: string;
  maxResults: string;
  regionCode: string;
  relevanceLanguage: string;
  key: string;
  pageToken?: string;
}
