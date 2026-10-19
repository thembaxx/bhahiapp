import { ImageResponse } from 'next/og';

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
          borderRadius: 48,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: 120,
            height: 132,
            position: 'relative',
          }}
        >
          {/* Book Spine */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 6,
              width: 34,
              height: 120,
              borderRadius: 17,
              backgroundColor: '#FFFFFF',
            }}
          />
          {/* Coin Bowl */}
          <div
            style={{
              position: 'absolute',
              left: 44,
              top: 52,
              width: 72,
              height: 72,
              borderRadius: 36,
              border: '20px solid #DDF24E',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
