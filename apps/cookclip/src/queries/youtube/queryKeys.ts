export const youtubeKeys = {
  search: {
    all: ['youtube', 'search'] as const,
    list: (query: string, pageToken?: string) =>
      [...youtubeKeys.search.all, query, pageToken ?? ''] as const,
  },
  caption: {
    all: ['youtube', 'caption'] as const,
    detail: (videoId: string) => [...youtubeKeys.caption.all, videoId] as const,
  },
};
