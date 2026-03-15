// OpenAI Structured Outputs 응답 타입
import type { Ingredient } from '@/types/api/routeApi/response';

export interface RecipeAnalysis {
  ingredients: Ingredient[];
  steps: string[];
}
