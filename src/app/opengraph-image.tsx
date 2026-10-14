import { ImageResponse } from 'next/og';

export const alt = 'Everything ZCode — конфиги для ZCode / Z.ai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Static OG image: dark card, emerald gradient wordmark, toolkit stats. */
export default function OpengraphImage() {
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
          background: 'linear-gradient(135deg, #0c1210 0%, #101815 55%, #0c1210 100%)',
          position: 'relative',
        }}
      >
        {/* glow */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            left: 240,
            width: 720,
            height: 320,
            borderRadius: 9999,
            background: 'rgba(16,185,129,0.16)',
            filter: 'blur(90px)',
            display: 'flex',
          }}
        />
        {/* grid hint */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 34,
            padding: '10px 28px',
            borderRadius: 9999,
            border: '1px solid rgba(16,185,129,0.4)',
            background: 'rgba(16,185,129,0.10)',
            color: '#34d399',
            fontSize: 26,
          }}
        >
          ⚡ 45 production-ready конфигов для Z.ai
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 96, fontWeight: 800, color: '#fafafa' }}>
          <span style={{ color: '#fafafa' }}>Everything&nbsp;</span>
          <span
            style={{
              backgroundImage: 'linear-gradient(90deg, #10b981, #6ee7b7, #10b981)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ZCode
          </span>
        </div>

        <div style={{ display: 'flex', color: '#a1a1aa', fontSize: 30, marginTop: 26 }}>
          агенты · команды · скиллы · правила · хуки · контексты
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
          {['8 агентов', '10 команд', '8 скиллов', '6 правил', '7 хуков'].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e4e4e7',
                fontSize: 24,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
