import { NextResponse } from 'next/server';
import { getRecentRecipes } from '@/services/supabaseService';

export async function GET() {
  const videos = await getRecentRecipes(12);
  return NextResponse.json({ videos });
}
