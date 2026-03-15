import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CoupangLinks } from '@/types/api/routeApi/response';
import type { IngredientLinkRow } from '@/types/api/supabase/response';

const TABLE = 'ingredient_links';

async function createSupabaseClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods },
  );
}

/**
 * GET /api/ingredient-links?names=간장,진간장,소금
 *
 * 재료명 배열을 받아 ingredient_links 테이블에서 exact match 조회.
 * 매칭된 재료만 { [name]: link } 형태로 반환 (미매칭은 포함 안 함).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const namesParam = searchParams.get('names');

  if (!namesParam || namesParam.trim() === '') {
    return NextResponse.json({ links: {} });
  }

  const names = namesParam
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return NextResponse.json({ links: {} });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.from(TABLE).select('name, link').in('name', names);

    if (error || !data) {
      return NextResponse.json({ links: {} });
    }

    const links: CoupangLinks = {};
    for (const row of data as Pick<IngredientLinkRow, 'name' | 'link'>[]) {
      links[row.name] = row.link;
    }

    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ links: {} });
  }
}
