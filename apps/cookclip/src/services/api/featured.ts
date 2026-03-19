import Services from '@workspace/services';
import type { VideoItem } from '@/types/api/routeApi/response';

interface FeaturedRecipesResponse {
  videos: VideoItem[];
}

class FeaturedServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getFeaturedRecipes(): Promise<FeaturedRecipesResponse> {
    return this.get<FeaturedRecipesResponse>('');
  }
}

const featuredServices = new FeaturedServices({
  baseURL: '/api/supabase/featured-recipes',
});

export default featuredServices;
