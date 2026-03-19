export const supabaseKeys = {
  cache: {
    all: ['supabase', 'cache'] as const,
    detail: (videoId: string) => [...supabaseKeys.cache.all, videoId] as const,
  },
};
