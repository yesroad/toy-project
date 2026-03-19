export const searchKeys = {
  all: ['search'] as const,
  list: (query: string) => [...searchKeys.all, 'list', query] as const,
  cached: (query: string) => [...searchKeys.all, 'cached', query] as const,
};
