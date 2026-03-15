import Services from '@workspace/services';
import type { Recipe } from '@/types/api/routeApi/response';

interface SupabaseCacheResponse {
  recipe: Recipe | null;
}

class SupabaseServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getCachedRecipe(videoId: string): Promise<SupabaseCacheResponse> {
    return this.get<SupabaseCacheResponse>('', { videoId });
  }

  setCachedRecipe(recipe: Omit<Recipe, 'cached'>): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('', { recipe });
  }
}

const supabaseServices = new SupabaseServices({
  baseURL: `/api/supabase`,
});

export default supabaseServices;
