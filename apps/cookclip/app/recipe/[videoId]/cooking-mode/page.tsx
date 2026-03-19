import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRecipeCache } from '@/services/supabaseService';
import CookingModeView from '@/views/cooking-mode/CookingModeView';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ videoId: string }>;
}

export default async function CookingModePage({ params }: Props) {
  const { videoId } = await params;
  const recipe = await getRecipeCache(videoId);
  if (!recipe || recipe.steps.length === 0) notFound();

  return (
    <CookingModeView
      videoId={videoId}
      title={recipe.title}
      steps={recipe.steps}
      stepDetails={recipe.stepDetails}
    />
  );
}
