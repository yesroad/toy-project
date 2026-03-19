import Services from '@workspace/services';
import type { VideoItem } from '@/types/api/routeApi/response';

interface SavedRecipeItemsResponse {
  videos: VideoItem[];
}

class UserRecipesServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getSavedRecipeItems(): Promise<SavedRecipeItemsResponse> {
    return this.get<SavedRecipeItemsResponse>('');
  }
}

const userRecipesServices = new UserRecipesServices({
  baseURL: '/api/user/saved-recipe-items',
});

export default userRecipesServices;
