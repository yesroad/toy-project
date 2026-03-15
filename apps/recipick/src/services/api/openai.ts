import Services from '@workspace/services';
import type { RecipeAnalysis } from '@/types/api/openai/response';

class OpenAIServices extends Services {
  constructor({ baseURL }: { baseURL: string }) {
    super({ baseURL });
  }

  analyzeRecipe(caption: string): Promise<RecipeAnalysis> {
    return this.post<RecipeAnalysis>('', { caption });
  }
}

const openaiServices = new OpenAIServices({
  baseURL: `/api/openai`,
});

export default openaiServices;
