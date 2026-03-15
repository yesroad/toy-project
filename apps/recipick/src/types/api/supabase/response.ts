// Supabase recipe_cache 테이블 행 타입
import type { Ingredient, CoupangLinks } from '@/types/api/routeApi/response';

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
}
