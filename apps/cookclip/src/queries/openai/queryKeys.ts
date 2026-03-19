export const openaiKeys = {
  recipe: {
    all: ['openai', 'recipe'] as const,
    analyze: (caption: string) => [...openaiKeys.recipe.all, 'analyze', caption] as const,
  },
};
