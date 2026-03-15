import 'server-only';

const LEGACY_ENV_KEYS = {
  youtubeDataApiKey: ['YOUTUBE_API_KEY'],
  supabaseUrl: ['NEXT_PUBLIC_SUPABASE_URL'],
  supabaseAnonKey: ['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY='],
} as const;

function readEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim() !== '') {
      return value;
    }
  }

  return undefined;
}

function requireEnv(options: { key: string; aliases?: readonly string[] }): string {
  const value = readEnv([options.key, ...(options.aliases ?? [])]);
  if (!value) {
    throw new Error(`${options.key} is not set`);
  }

  return value;
}

export const serverEnv = {
  get openAiApiKey(): string {
    return requireEnv({ key: 'OPENAI_API_KEY' });
  },
  get youtubeDataApiKey(): string {
    return requireEnv({
      key: 'YOUTUBE_DATA_API_KEY',
      aliases: LEGACY_ENV_KEYS.youtubeDataApiKey,
    });
  },
  get supabaseUrl(): string {
    return requireEnv({
      key: 'SUPABASE_URL',
      aliases: LEGACY_ENV_KEYS.supabaseUrl,
    });
  },
  get supabaseAnonKey(): string {
    return requireEnv({
      key: 'SUPABASE_SERVICE_ROLE_KEY=',
      aliases: LEGACY_ENV_KEYS.supabaseAnonKey,
    });
  },
  get supabaseServiceRoleKey(): string {
    return requireEnv({ key: 'SUPABASE_SERVICE_ROLE_KEY' });
  },
};
