import type { Metadata } from 'next';
import { getRecipeCache } from '@/services/supabaseService';
import RecipePageView from './RecipePageView';

interface Props {
  params: Promise<{ videoId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  const recipe = await getRecipeCache(videoId).catch(() => null);

  if (!recipe) {
    return {
      title: '레시피 분석 중',
      description: 'Recipick이 유튜브 요리 영상에서 레시피를 자동으로 추출합니다.',
    };
  }

  const title = `${recipe.title} 레시피`;
  const description = `${recipe.channelName}의 ${recipe.title} — 재료 ${recipe.ingredients.length}가지, 조리 ${recipe.steps.length}단계`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: recipe.thumbnail
        ? [{ url: recipe.thumbnail, width: 1280, height: 720, alt: recipe.title }]
        : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: recipe.thumbnail ? [recipe.thumbnail] : [],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { videoId } = await params;
  return <RecipePageView videoId={videoId} />;
}
