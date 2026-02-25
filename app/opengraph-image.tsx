import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '30 Days of Claude Code — Real business tools, different industry every day';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF7F2',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#c4704b',
          }}
        />

        {/* Day tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              color: '#c4704b',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Day 2 of 30
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.1,
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>30 Days of</span>
          <span style={{ color: '#c4704b' }}>Claude Code</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#4a4a4a',
            lineHeight: 1.5,
            maxWidth: '700px',
          }}
        >
          Real business tools. Different industry every day. Built with Claude Code.
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '80px',
            right: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
              Ashley Harrison
            </span>
            <span style={{ fontSize: '16px', color: '#8a8078' }}>
              tellavsn.com
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#1a1a1a',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '16px', color: '#FAF7F2', fontWeight: 500 }}>
              Tell a Vsn
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
