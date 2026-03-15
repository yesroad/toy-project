export const recipeKeys = {
  all: ['recipe'] as const,
  detail: (videoId: string) => [...recipeKeys.all, 'detail', videoId] as const,
};
