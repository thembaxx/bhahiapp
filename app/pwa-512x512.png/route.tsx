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
          borderRadius: 128,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 320,
            height: 352,
            position: 'relative',
          }}
        >
          {/* Book Spine */}
          <div
            style={{
              position: 'absolute',
              left: 36,
              top: 16,
              width: 92,
              height: 320,
              borderRadius: 46,
              backgroundColor: '#FFFFFF',
            }}
          />
          {/* Coin Bowl */}
          <div
            style={{
              position: 'absolute',
              left: 116,
              top: 138,
              width: 192,
              height: 192,
              borderRadius: 96,
              border: '52px solid #DDF24E',
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
