import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0B0C',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 112,
            height: 124,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 6,
              width: 32,
              height: 112,
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 42,
              top: 48,
              width: 68,
              height: 68,
              borderRadius: 34,
              border: '18px solid #DDF24E',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}
