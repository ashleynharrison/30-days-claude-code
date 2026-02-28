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
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,144,122,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Left: Terminal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '420px',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              gap: '8px',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: '60px', fontFamily: 'monospace' }}>
              claude-code — bash
            </span>
          </div>

          {/* Terminal content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>~ $</span>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#4ADE80' }}>claude</span>
            </div>
            <div style={{ height: '8px' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
              {'  '}Claude Code v1.0
            </span>
            <div style={{ height: '8px' }} />
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#C4907A', fontWeight: 700 }}>{'  '}plan</span>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Build a business tool.</span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
              {'  '}Every industry. Every day.
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
              {'  '}30 days. Starting now.
            </span>
            <div style={{ height: '8px' }} />
            <div style={{ width: '8px', height: '16px', background: '#C4907A', opacity: 0.8 }} />
          </div>
        </div>

        {/* Right: Typography */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '60px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '60px',
              fontWeight: 700,
              color: '#F8F5F1',
              lineHeight: 1.15,
            }}
          >
            30 Days of
          </span>
          <span
            style={{
              fontSize: '68px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#C4907A',
              lineHeight: 1.15,
            }}
          >
            Claude Code
          </span>

          {/* Divider */}
          <div
            style={{
              width: '260px',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              marginTop: '24px',
              marginBottom: '20px',
            }}
          />

          <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            30 builds · 10 industries · 9 services
          </span>

          <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: '16px', lineHeight: 1.6 }}>
            No tutorials. No toy projects.
          </span>
          <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Tools a business could use tomorrow.
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            @ashleystweeted
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
              Ashley Harrison
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
