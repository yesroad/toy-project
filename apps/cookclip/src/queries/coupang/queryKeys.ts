export const coupangKeys = {
  all: ['coupang'] as const,
  link: (keyword: string, videoId?: string) =>
    [...coupangKeys.all, 'link', keyword, videoId ?? ''] as const,
};
