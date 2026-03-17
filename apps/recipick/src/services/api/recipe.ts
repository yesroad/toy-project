import Services from '@workspace/services';
import type { RecipeResponse } from '@/types/api/routeApi/response';

class RecipeServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
    this.getAxiosInstance().defaults.timeout = 120_000; // 2분: OpenAI + YouTube 스크래핑 소요 시간 고려
  }

  getRecipe(videoId: string): Promise<RecipeResponse> {
    return this.post<RecipeResponse>('', { videoId });
  }
}

const recipeServices = new RecipeServices({
  baseURL: `/api/recipe`,
});

export default recipeServices;
