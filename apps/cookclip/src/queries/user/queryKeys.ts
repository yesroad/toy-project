export const userKeys = {
  all: ['user'] as const,
  savedRecipes: () => [...userKeys.all, 'savedRecipes'] as const,
};
