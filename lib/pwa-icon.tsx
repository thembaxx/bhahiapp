import { ImageResponse } from 'next/og';

// The installed icon uses the same vector artwork as public/icon.svg.
// Keep this source in sync if the brand logo is updated.
const brandedLogo = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\">\n  <defs>\n    <!-- Tilted translucent back page gradient (inspired by Calendar/Slides in IMG_5832) -->\n    <linearGradient id=\"bahiBackPage\" x1=\"16\" y1=\"6\" x2=\"54\" y2=\"44\" gradientUnits=\"userSpaceOnUse\">\n      <stop offset=\"0%\" stop-color=\"#74C2F6\" />\n      <stop offset=\"100%\" stop-color=\"#2CE59B\" />\n    </linearGradient>\n\n    <!-- Main spectrum mesh gradient (inspired by G/M multi-hue smooth blend in IMG_5832) -->\n    <linearGradient id=\"bahiMainBody\" x1=\"12\" y1=\"12\" x2=\"56\" y2=\"56\" gradientUnits=\"userSpaceOnUse\">\n      <stop offset=\"0%\" stop-color=\"#2997FF\" />\n      <stop offset=\"28%\" stop-color=\"#28E08C\" />\n      <stop offset=\"56%\" stop-color=\"#DDF24E\" />\n      <stop offset=\"80%\" stop-color=\"#FFB024\" />\n      <stop offset=\"100%\" stop-color=\"#FF4B4B\" />\n    </linearGradient>\n\n    <!-- Soft warm radial glow in bottom-right corner -->\n    <radialGradient id=\"bahiCornerGlow\" cx=\"0.82\" cy=\"0.82\" r=\"0.65\">\n      <stop offset=\"0%\" stop-color=\"#FF4B4B\" stop-opacity=\"0.85\" />\n      <stop offset=\"55%\" stop-color=\"#FFB024\" stop-opacity=\"0.35\" />\n      <stop offset=\"100%\" stop-color=\"#2997FF\" stop-opacity=\"0\" />\n    </radialGradient>\n\n    <!-- Frosted translucent left spine (inspired by Wallet/Docs fold in IMG_5832) -->\n    <linearGradient id=\"bahiSpineGlass\" x1=\"15\" y1=\"8\" x2=\"15\" y2=\"56\" gradientUnits=\"userSpaceOnUse\">\n      <stop offset=\"0%\" stop-color=\"#FFFFFF\" />\n      <stop offset=\"55%\" stop-color=\"#DDF0FF\" />\n      <stop offset=\"100%\" stop-color=\"#7CC4FF\" />\n    </linearGradient>\n\n    <!-- Top inner specular highlight -->\n    <linearGradient id=\"bahiSpecular\" x1=\"32\" y1=\"12\" x2=\"32\" y2=\"34\" gradientUnits=\"userSpaceOnUse\">\n      <stop offset=\"0%\" stop-color=\"#FFFFFF\" stop-opacity=\"0.42\" />\n      <stop offset=\"100%\" stop-color=\"#FFFFFF\" stop-opacity=\"0\" />\n    </linearGradient>\n  </defs>\n\n  <!-- Tilted back ledger sheet -->\n  <rect\n    x=\"18\"\n    y=\"7\"\n    width=\"37\"\n    height=\"39\"\n    rx=\"12\"\n    transform=\"rotate(-8 36 26)\"\n    fill=\"url(#bahiBackPage)\"\n    opacity=\"0.82\"\n  />\n\n  <!-- Main spectrum rounded ledger card -->\n  <rect\n    x=\"12\"\n    y=\"13\"\n    width=\"43\"\n    height=\"43\"\n    rx=\"14\"\n    fill=\"url(#bahiMainBody)\"\n  />\n  <rect\n    x=\"12\"\n    y=\"13\"\n    width=\"43\"\n    height=\"43\"\n    rx=\"14\"\n    fill=\"url(#bahiCornerGlow)\"\n  />\n  <rect\n    x=\"12\"\n    y=\"13\"\n    width=\"43\"\n    height=\"22\"\n    rx=\"14\"\n    fill=\"url(#bahiSpecular)\"\n  />\n\n  <!-- Lowercase 'b' frosted-glass spine on left -->\n  <rect\n    x=\"9\"\n    y=\"8\"\n    width=\"13.5\"\n    height=\"48\"\n    rx=\"6.75\"\n    fill=\"url(#bahiSpineGlass)\"\n  />\n\n  <!-- Crisp white 'b' coin bowl & ledger lines inside card -->\n  <circle\n    cx=\"35.5\"\n    cy=\"35.5\"\n    r=\"9.5\"\n    stroke=\"#FFFFFF\"\n    stroke-width=\"4.4\"\n  />\n\n  <!-- Luminous status coin pip in bottom-right (like Wallet/Meet dot in IMG_5832) -->\n  <circle cx=\"48\" cy=\"48\" r=\"2.7\" fill=\"#FFFFFF\" />\n</svg>\n";
const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(brandedLogo).toString('base64');

export function brandedPwaIcon(size: number, maskable = false) {
  // Android adaptive masks can crop outside the centre safe area.
  const artworkSize = maskable ? Math.round(size * 0.70) : size;
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbf8f3',
        }}
      >
        <img src={svgDataUrl} width={artworkSize} height={artworkSize} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}
