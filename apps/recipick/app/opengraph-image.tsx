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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #f0e8dc 0%, #faf7f2 60%, #f5ede0 100%)',
        }}
      >
        {/* 로고 + 브랜드명 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              width: '108px',
              height: '108px',
              background: '#c4724a',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              boxShadow: '0 8px 32px rgba(196,114,74,0.35)',
            }}
          >
            🍳
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '92px',
              fontWeight: 800,
              letterSpacing: '-3px',
              color: '#3d2b1f',
            }}
          >
            Cook
            <span style={{ color: '#c4724a' }}>Clip</span>
          </div>
        </div>

        {/* 슬로건 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '32px',
            color: '#7d6550',
            textAlign: 'center',
            lineHeight: 1.6,
            gap: '4px',
          }}
        >
          <span>
            유튜브 요리 영상을{' '}
            <span style={{ color: '#c4724a', fontWeight: 700 }}>clip</span>하고
          </span>
          <span>레시피와 재료를 한 번에 확인하세요</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
