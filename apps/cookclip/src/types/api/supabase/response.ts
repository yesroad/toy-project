// Supabase 테이블 행 타입
import type { Ingredient, CoupangLinks, RecipeStep } from '@/types/api/routeApi/response';

export interface IngredientLinkRow {
  name: string;
  label: string | null;
  link: string;
  created_at: string;
}

export interface RecipeCacheRow {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  ingredients: Ingredient[];
  steps: string[];
  coupang_links: CoupangLinks | null;
  raw_caption: string | null;
  created_at: string;
  updated_at: string;
  // Phase 2 확장 컬럼 (NULLABLE — 기존 행 호환)
  servings: string | null;
  cooking_time_minutes: number | null;
  difficulty: string | null;
  calories: number | null;
  tips: string[] | null;
  notes: string[] | null;
  step_details: RecipeStep[] | null;
  dish_name: string | null; // Phase 3 — 요리명 (SEO 집계 페이지용)
}

export type RecipeUnavailableReason = 'NO_CAPTION' | 'INSUFFICIENT_INGREDIENTS';

export interface RecipeUnavailableRow {
  video_id: string;
  reason: RecipeUnavailableReason;
  created_at: string;
}
