import Services from '@workspace/services';
import type { RecipeResponse } from '@/types/api/routeApi/response';

class RecipeServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  getRecipe(videoId: string): Promise<RecipeResponse> {
    return this.post<RecipeResponse>('', { videoId });
  }
}

const recipeServices = new RecipeServices({
  baseURL: `/api/recipe`,
});

export default recipeServices;
