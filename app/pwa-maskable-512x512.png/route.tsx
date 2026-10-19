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
        {/* Safe zone 80% center for Android maskable icon */}
        <div
          style={{
            display: 'flex',
            width: 260,
            height: 280,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 12,
              width: 74,
              height: 256,
              borderRadius: 37,
              backgroundColor: '#FFFFFF',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 96,
              top: 112,
              width: 156,
              height: 156,
              borderRadius: 78,
              border: '42px solid #DDF24E',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
