export const userRecipesKeys = {
  all: ['userRecipes'] as const,
  saved: () => [...userRecipesKeys.all, 'saved'] as const,
};
