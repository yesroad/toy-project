import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/env/server';
import type { CoupangLinks } from '@/types/api/routeApi/response';
import type { IngredientLinkRow } from '@/types/api/supabase/response';

const TABLE = 'ingredient_links';

export async function getIngredientLinks(names: string[]): Promise<CoupangLinks> {
  if (names.length === 0) return {};

  const supabase = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey);
  const quotedNames = names.map((n) => `"${n.replace(/"/g, '\\"')}"`).join(',');
  const { data, error } = await supabase
    .from(TABLE)
    .select('name, link, aliases')
    .or(`name.in.(${quotedNames}),aliases.ov.{${quotedNames}}`);

  if (error) {
    console.error('[ingredientService] getIngredientLinks error:', error);
    return {};
  }
  if (!data) return {};

  const links: CoupangLinks = {};
  for (const row of data as (Pick<IngredientLinkRow, 'name' | 'link'> & {
    aliases?: string[];
  })[]) {
    if (names.includes(row.name)) {
      links[row.name] = row.link;
    }
    for (const reqName of names) {
      if (!links[reqName] && row.aliases?.includes(reqName)) {
        links[reqName] = row.link;
      }
    }
  }

  return links;
}
