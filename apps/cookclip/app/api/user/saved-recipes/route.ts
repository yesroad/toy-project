import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/env/server';

async function getAuthenticatedUser() {
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
  return user;
}

const adminClient = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { data } = await adminClient
    .from('user_saved_recipes')
    .select('video_id')
    .eq('user_id', user.id);

  return NextResponse.json({ savedVideoIds: (data ?? []).map((r) => r.video_id) });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: 'videoId 필요' }, { status: 400 });

  await adminClient
    .from('user_saved_recipes')
    .upsert({ user_id: user.id, video_id: videoId }, { onConflict: 'user_id,video_id' });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) return NextResponse.json({ error: 'videoId 필요' }, { status: 400 });

  await adminClient
    .from('user_saved_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('video_id', videoId);

  return NextResponse.json({ success: true });
}
