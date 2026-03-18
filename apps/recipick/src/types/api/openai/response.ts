// OpenAI Structured Outputs 응답 타입
import type { Ingredient, RecipeStep } from '@/types/api/routeApi/response';

export interface RecipeAnalysis {
  ingredients: Ingredient[];
  steps: string[];
  // Phase 2 확장 필드 (optional)
  servings?: string;
  cookingTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  calories?: number;
  tips?: string[];
  notes?: string[];
  stepDetails?: RecipeStep[];
}
