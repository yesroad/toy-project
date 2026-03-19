'use client';

import { useState, useMemo } from 'react';
import type { Ingredient } from '@/types/api/routeApi/response';
import { parseServings, scaleAmount } from '@/lib/serving-scale';

const SCALE_STEPS = [0.5, 1, 1.5, 2, 3] as const;
type ScaleStep = (typeof SCALE_STEPS)[number];

export function useServingScaler(ingredients: Ingredient[], servings?: string) {
  const baseServings = servings ? parseServings(servings) : 2;
  const [scaleIdx, setScaleIdx] = useState(1); // 기본값: index 1 = 1x

  const scale = SCALE_STEPS[scaleIdx];
  const currentServings = Math.round(baseServings * scale);

  const scaledIngredients = useMemo(
    () => ingredients.map((ing) => ({ ...ing, amount: scaleAmount(ing.amount, scale) })),
    [ingredients, scale],
  );

  const decrease = () => setScaleIdx((prev) => Math.max(0, prev - 1));
  const increase = () => setScaleIdx((prev) => Math.min(SCALE_STEPS.length - 1, prev + 1));

  return {
    currentServings,
    scaledIngredients,
    decrease,
    increase,
    canDecrease: scaleIdx > 0,
    canIncrease: scaleIdx < SCALE_STEPS.length - 1,
  };
}
