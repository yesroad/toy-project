import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'CookClip — 유튜브 요리 영상 레시피 자동 추출';

export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a10 60%, #1f1208 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 우측 상단 glow */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -60,
            width: 520,
            height: 520,
            background: 'radial-gradient(circle, rgba(196,114,74,0.22) 0%, transparent 68%)',
            borderRadius: '50%',
          }}
        />
        {/* 좌측 하단 glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: 160,
            width: 320,
            height: 320,
            background: 'radial-gradient(circle, rgba(196,114,74,0.1) 0%, transparent 68%)',
            borderRadius: '50%',
          }}
        />

        {/* 메인 콘텐츠 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
          {/* 로고 + 브랜드명 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 88,
                height: 88,
                background: '#c4724a',
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                boxShadow: '0 8px 32px rgba(196,114,74,0.5)',
              }}
            >
              🍳
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 80,
                fontWeight: 800,
                letterSpacing: -3,
                color: 'white',
                lineHeight: 1,
              }}
            >
              Cook
              <span style={{ color: '#c4724a' }}>Clip</span>
            </div>
          </div>

          {/* 슬로건 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 28, color: '#c8b09a', lineHeight: 1.4 }}>
              유튜브 요리 영상 URL만 넣으면
            </div>
            <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.4, gap: 0 }}>
              <span style={{ color: '#e8935a', fontWeight: 700 }}>재료와 레시피</span>
              <span style={{ color: '#c8b09a' }}>를 자동으로 정리해 드려요</span>
            </div>
          </div>

          {/* 기능 칩 */}
          <div style={{ display: 'flex', gap: 10 }}>
            {['🥕 재료 자동 추출', '📋 조리 순서', '⏱ 조리시간', '🛒 장보기 목록'].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    background: 'rgba(196,114,74,0.12)',
                    border: '1px solid rgba(196,114,74,0.28)',
                    borderRadius: 100,
                    padding: '9px 18px',
                    color: '#e8a87c',
                    fontSize: 17,
                    display: 'flex',
                  }}
                >
                  {feature}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
