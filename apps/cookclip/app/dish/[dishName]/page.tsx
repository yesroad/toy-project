import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getRecipesByDishName } from '@/services/supabaseService';
import { serverEnv } from '@/env/server';

interface Props {
  params: Promise<{ dishName: string }>;
}

const getDishRecipes = cache((dishName: string) => getRecipesByDishName(dishName).catch(() => []));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dishName } = await params;
  const decoded = decodeURIComponent(dishName);
  const recipes = await getDishRecipes(decoded);

  if (recipes.length === 0) {
    return { title: `${decoded} 레시피`, robots: { index: false } };
  }

  const title = `${decoded} 레시피 모음 — 유튜버별 비교`;
  const description = `${decoded} 레시피 ${recipes.length}가지. ${recipes
    .map((r) => r.channelName)
    .slice(0, 3)
    .join(', ')} 등 유명 유튜버의 ${decoded} 만드는 법을 한눈에 비교하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `${serverEnv.siteUrl}/dish/${encodeURIComponent(decoded)}` },
    openGraph: {
      title,
      description,
      images: recipes[0]?.thumbnail
        ? [{ url: recipes[0].thumbnail, width: 1280, height: 720, alt: `${decoded} 레시피` }]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: recipes[0]?.thumbnail ? [recipes[0].thumbnail] : [],
    },
  };
}

export default async function DishPage({ params }: Props) {
  const { dishName } = await params;
  const decoded = decodeURIComponent(dishName);
  const recipes = await getDishRecipes(decoded);

  if (recipes.length === 0) notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: serverEnv.siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${decoded} 레시피`,
        item: `${serverEnv.siteUrl}/dish/${encodeURIComponent(decoded)}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${decoded} 레시피 모음`,
    numberOfItems: recipes.length,
    itemListElement: recipes.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${serverEnv.siteUrl}/recipe/${r.videoId}`,
      name: r.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">
            홈
          </Link>
          <span className="mx-2">/</span>
          <span>{decoded} 레시피</span>
        </nav>

        <h1 className="text-2xl font-bold mb-2">{decoded} 레시피 모음</h1>
        <p className="text-gray-600 mb-8">
          유튜버 {recipes.length}명의 <strong>{decoded}</strong> 레시피를 비교해보세요.
        </p>

        <ul className="space-y-4">
          {recipes.map((recipe) => (
            <li key={recipe.videoId}>
              <Link
                href={`/recipe/${recipe.videoId}`}
                className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#c4724a] hover:shadow-sm transition-all group"
              >
                <div className="relative w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={recipe.thumbnail}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#c4724a] font-medium mb-1">{recipe.channelName}</p>
                  <h2 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#c4724a] transition-colors">
                    {recipe.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-2">AI 레시피 추출 완료</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
