import { ImageResponse } from 'next/og';

/**
 * A raster rendering of the existing /public/icon.svg brand mark.
 * Keep the familiar rainbow ledger card, translucent spine and coin bowl
 * consistent on Android, desktop and iOS launchers.
 *
 * Android maskable icons keep all foreground detail inside the center safe zone.
 */
export function renderBahiBrandIcon(size: 180 | 192 | 512, maskable = false) {
  const unit = (size / 64) * (maskable ? 0.67 : 0.88);
  const n = (value: number) => value * unit;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FBF8F3',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: n(64),
            height: n(64),
          }}
        >
          {/* The tilted mint-and-blue ledger page */}
          <div
            style={{
              position: 'absolute',
              left: n(18),
              top: n(7),
              width: n(37),
              height: n(39),
              borderRadius: n(12),
              backgroundImage: 'linear-gradient(135deg, #74C2F6, #2CE59B)',
              transform: 'rotate(-8deg)',
            }}
          />
          {/* The vibrant rainbow cover is the central brand feature */}
          <div
            style={{
              position: 'absolute',
              left: n(12),
              top: n(13),
              width: n(43),
              height: n(43),
              borderRadius: n(14),
              backgroundImage: 'linear-gradient(135deg, #2997FF 0%, #28E08C 28%, #DDF24E 56%, #FFB024 80%, #FF4B4B 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: n(12),
              top: n(13),
              width: n(43),
              height: n(18),
              borderTopLeftRadius: n(14),
              borderTopRightRadius: n(14),
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.36), rgba(255,255,255,0))',
            }}
          />
          {/* Frosted lowercase-b book spine */}
          <div
            style={{
              position: 'absolute',
              left: n(9),
              top: n(8),
              width: n(13.5),
              height: n(48),
              borderRadius: n(6.75),
              backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #DDF0FF 55%, #7CC4FF 100%)',
            }}
          />
          {/* White coin-bowl ring */}
          <div
            style={{
              position: 'absolute',
              left: n(26),
              top: n(26),
              width: n(19),
              height: n(19),
              borderRadius: n(9.5),
              border: `${n(4.4)}px solid #FFFFFF`,
              backgroundColor: 'transparent',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: n(45.3),
              top: n(45.3),
              width: n(5.4),
              height: n(5.4),
              borderRadius: n(2.7),
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
