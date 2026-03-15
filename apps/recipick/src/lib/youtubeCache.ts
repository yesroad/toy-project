import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/env/server';
import type { SearchResult } from '@/types/api/routeApi/response';

const CACHE_TTL_HOURS = 24;

function createAdminClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function getCachedSearch(
  query: string,
  pageToken: string,
): Promise<SearchResult | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('youtube_search_cache')
    .select('result, created_at')
    .eq('query', query)
    .eq('page_token', pageToken)
    .single();

  if (error || !data) return null;

  const createdAt = new Date(data.created_at as string);
  const expiredAt = new Date(createdAt.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);

  if (new Date() > expiredAt) {
    // TTL 초과 레코드 삭제 (비차단)
    void supabase
      .from('youtube_search_cache')
      .delete()
      .eq('query', query)
      .eq('page_token', pageToken);
    return null;
  }

  return data.result as SearchResult;
}

export async function setCachedSearch(
  query: string,
  pageToken: string,
  result: SearchResult,
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('youtube_search_cache')
    .upsert(
      { query, page_token: pageToken, result, created_at: new Date().toISOString() },
      { onConflict: 'query,page_token' },
    );
}
