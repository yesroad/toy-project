export const featuredKeys = {
  all: ['featured'] as const,
  recipes: () => [...featuredKeys.all, 'recipes'] as const,
};
