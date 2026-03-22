import { ImageResponse } from 'next/og';
import { getRecipeCache } from '@/services/supabaseService';

export const runtime = 'edge';
export const alt = 'CookClip 레시피';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ videoId: string }>;
}

export default async function RecipeOgImage({ params }: Props) {
  const { videoId } = await params;
  const recipe = await getRecipeCache(videoId).catch(() => null);

  // 레시피 없으면 기본 OG 이미지 스타일로 폴백
  if (!recipe?.thumbnail) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a10 60%, #1f1208 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, color: 'white' }}>
            Cook<span style={{ color: '#c4724a' }}>Clip</span>
          </div>
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* 레시피 썸네일 전체 배경 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.thumbnail}
          alt={recipe.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* 하단 그라데이션 오버레이 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '65%',
            background: 'linear-gradient(to top, rgba(26,15,10,0.95) 0%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* 텍스트 영역 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* 브랜드 */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              color: '#c4724a',
              letterSpacing: 1,
            }}
          >
            🍳 CookClip
          </div>

          {/* 레시피 제목 */}
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              letterSpacing: -1,
            }}
          >
            {recipe.title.length > 40 ? `${recipe.title.slice(0, 40)}…` : recipe.title}
          </div>

          {/* 채널명 + 메타 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', fontSize: 22, color: '#c8b09a' }}>
              {recipe.channelName}
            </div>
            {recipe.cookingTime ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: '#e8a87c',
                  background: 'rgba(196,114,74,0.2)',
                  border: '1px solid rgba(196,114,74,0.4)',
                  borderRadius: 100,
                  padding: '4px 14px',
                }}
              >
                ⏱ {recipe.cookingTime}분
              </div>
            ) : null}
            {recipe.servings ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: '#e8a87c',
                  background: 'rgba(196,114,74,0.2)',
                  border: '1px solid rgba(196,114,74,0.4)',
                  borderRadius: 100,
                  padding: '4px 14px',
                }}
              >
                🍽 {recipe.servings}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
