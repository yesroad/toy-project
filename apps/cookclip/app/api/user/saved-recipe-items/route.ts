import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/env/server';

const adminClient = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: Parameters<typeof cookieStore.set>[2];
        }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { data: saved } = await adminClient
    .from('user_saved_recipes')
    .select('video_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!saved || saved.length === 0) return NextResponse.json({ videos: [] });

  const videoIds = saved.map((r) => r.video_id);
  const { data: recipes } = await adminClient
    .from('recipe_cache')
    .select('video_id, title, thumbnail, channel_name, created_at')
    .in('video_id', videoIds);

  const recipeMap = new Map((recipes ?? []).map((r) => [r.video_id, r]));

  const videos = saved
    .map((s) => {
      const r = recipeMap.get(s.video_id);
      if (!r) return null;
      return {
        videoId: r.video_id,
        title: r.title,
        thumbnail: r.thumbnail,
        channelName: r.channel_name,
        publishedAt: s.created_at,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ videos });
}
