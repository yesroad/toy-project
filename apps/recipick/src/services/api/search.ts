import Services from '@workspace/services';
import type { CachedSearchResponse, SearchResult } from '@/types/api/routeApi/response';

class SearchServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getSearchVideos(query: string, pageToken?: string): Promise<SearchResult> {
    return this.get<SearchResult>('', {
      q: query,
      ...(pageToken && { pageToken }),
    });
  }

  getCachedVideos(query: string): Promise<CachedSearchResponse> {
    return this.get<CachedSearchResponse>('/cached', { q: query });
  }
}

const searchServices = new SearchServices({
  baseURL: `/api/search`,
});

export default searchServices;
