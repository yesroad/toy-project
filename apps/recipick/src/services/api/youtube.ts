import Services from '@workspace/services';
import type { SearchResult } from '@/types/api/routeApi/response';

class YouTubeServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  searchVideos(query: string, pageToken?: string): Promise<SearchResult> {
    return this.get<SearchResult>('', {
      action: 'search',
      q: query,
      ...(pageToken && { pageToken }),
    });
  }

  getCaption(videoId: string): Promise<{ caption: string }> {
    return this.get<{ caption: string }>('', {
      action: 'caption',
      videoId,
    });
  }
}

const youtubeServices = new YouTubeServices({
  baseURL: `/api/youtube`,
});

export default youtubeServices;
