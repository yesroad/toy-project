import { cache } from 'react';
import type { Metadata } from 'next';
import { getRecipeCache, getSaveCount } from '@/services/supabaseService';
import { serverEnv } from '@/env/server';
import RecipePageView from './RecipePageView';

interface Props {
  params: Promise<{ videoId: string }>;
}

const MIN_SAVE_COUNT_FOR_RATING = 2;

// 같은 요청 내 generateMetadata + page 간 중복 DB 호출 제거
const getCachedRecipe = cache((videoId: string) => getRecipeCache(videoId).catch(() => null));
const getCachedSaveCount = cache((videoId: string) => getSaveCount(videoId).catch(() => 0));

function buildDescription(recipe: NonNullable<Awaited<ReturnType<typeof getRecipeCache>>>) {
  const base = `재료 ${recipe.ingredients.length}가지, 조리 ${recipe.steps.length}단계`;
  const time = recipe.cookingTime ? `, 약 ${recipe.cookingTime}분` : '';
  const servings = recipe.servings ? `, ${recipe.servings}` : '';
  return `${recipe.channelName}의 ${recipe.title} 레시피 — ${base}${time}${servings}`;
}

function buildRecipeJsonLd(
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipeCache>>>,
  description: string,
  saveCount: number,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    author: { '@type': 'Person', name: recipe.channelName },
    image: recipe.thumbnail,
    description,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    ...(recipe.cookingTime && {
      cookTime: `PT${recipe.cookingTime}M`,
      totalTime: `PT${recipe.cookingTime}M`,
    }),
    ...(recipe.servings && { recipeYield: recipe.servings }),
    ...(recipe.calories && {
      nutrition: { '@type': 'NutritionInformation', calories: `${recipe.calories} kcal` },
    }),
    ...(saveCount >= MIN_SAVE_COUNT_FOR_RATING && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 5,
        ratingCount: saveCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

function buildBreadcrumbJsonLd(
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipeCache>>>,
  videoId: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: serverEnv.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: recipe.title,
        item: `${serverEnv.siteUrl}/recipe/${videoId}`,
      },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  const recipe = await getCachedRecipe(videoId);

  if (!recipe) {
    return {
      title: '레시피 분석 중',
      description: 'CookClip이 유튜브 요리 영상에서 레시피를 자동으로 추출합니다.',
      alternates: { canonical: `${serverEnv.siteUrl}/recipe/${videoId}` },
    };
  }

  const title = `${recipe.title} 레시피`;
  const description = buildDescription(recipe);

  return {
    title,
    description,
    alternates: { canonical: `${serverEnv.siteUrl}/recipe/${videoId}` },
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
  const [recipe, saveCount] = await Promise.all([
    getCachedRecipe(videoId),
    getCachedSaveCount(videoId),
  ]);

  const recipeJsonLd = recipe ? buildRecipeJsonLd(recipe, buildDescription(recipe), saveCount) : null;
  const breadcrumbJsonLd = recipe ? buildBreadcrumbJsonLd(recipe, videoId) : null;

  return (
    <>
      {recipeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <RecipePageView videoId={videoId} />
    </>
  );
}
