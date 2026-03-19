import { NextResponse } from 'next/server';
import { getIngredientLinks } from '@/services/ingredientService';

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
    const links = await getIngredientLinks(names);
    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ links: {} });
  }
}
