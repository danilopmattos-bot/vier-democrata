import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Complete self-contained SVG for icon with solid dark background and vector hop cone & text
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <path id="top-arc" d="M 65,256 A 191,191 0 0,1 447,256" fill="none" />
    <path id="bottom-arc" d="M 135,320 A 175,175 0 0,0 377,320" fill="none" />
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="35%" stop-color="#F59E0B" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#FBBF24" />
    </linearGradient>
    <linearGradient id="hopGreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#84cc16" />
      <stop offset="100%" stop-color="#4d7c0f" />
    </linearGradient>
  </defs>

  <!-- Solid Square Background (Dark Charcoal / Black) for iOS & Android icons -->
  <rect width="512" height="512" fill="#0c0a09" rx="0" />

  <!-- Outer Golden Border Ring -->
  <circle cx="256" cy="256" r="242" fill="#14110f" stroke="#f59e0b" stroke-width="5" />
  <circle cx="256" cy="256" r="232" fill="none" stroke="#78350f" stroke-width="2" stroke-dasharray="8 6" />

  <!-- Inner White Disc for Crisp Hop Contrast -->
  <circle cx="256" cy="256" r="162" fill="#FFFFFF" stroke="#1c1917" stroke-width="8" />

  <!-- Hop Cone Art in Center -->
  <g transform="translate(256, 256) scale(1.5) translate(-100, -98)">
    <!-- Stem -->
    <path d="M 132 94 C 148 90, 164 88, 178 86 C 176 79, 168 81, 152 84 Z" fill="#4d7c0f" stroke="#1c1917" stroke-width="4.5" stroke-linejoin="round" />
    <!-- Top Back Leaves -->
    <path d="M 94 42 C 114 26, 134 36, 140 58 C 118 64, 102 52, 94 42 Z" fill="#4d7c0f" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <path d="M 66 58 C 82 36, 114 42, 108 68 C 88 68, 72 63, 66 58 Z" fill="#65a30d" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <!-- Main Hop Scales -->
    <path d="M 44 86 C 48 64, 82 58, 98 80 C 82 96, 54 102, 44 86 Z" fill="#84cc16" stroke="#1c1917" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 68 76 L 76 86" stroke="#1c1917" stroke-width="3" />
    <path d="M 74 72 L 84 84" stroke="#1c1917" stroke-width="3" />
    <path d="M 82 70 L 90 82" stroke="#1c1917" stroke-width="3" />

    <path d="M 94 74 C 120 58, 150 70, 144 96 C 118 108, 98 96, 94 74 Z" fill="#65a30d" stroke="#1c1917" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 112 78 L 106 90" stroke="#1c1917" stroke-width="3" />
    <path d="M 120 80 L 114 94" stroke="#1c1917" stroke-width="3" />
    <path d="M 128 84 L 122 98" stroke="#1c1917" stroke-width="3" />

    <!-- Center Heart Petal -->
    <path d="M 74 100 C 86 78, 118 78, 128 106 C 112 128, 86 128, 74 100 Z" fill="#bef264" stroke="#1c1917" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 88 94 Q 92 106 88 118" stroke="#1c1917" stroke-width="3.5" fill="none" />
    <path d="M 95 91 Q 100 106 96 120" stroke="#1c1917" stroke-width="3.5" fill="none" />
    <path d="M 102 93 Q 107 107 104 120" stroke="#1c1917" stroke-width="3.5" fill="none" />
    <path d="M 109 97 Q 114 108 111 118" stroke="#1c1917" stroke-width="3.5" fill="none" />

    <!-- Side Leaves -->
    <path d="M 38 118 C 32 96, 60 96, 76 118 C 64 134, 44 134, 38 118 Z" fill="#84cc16" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <path d="M 44 144 C 38 128, 64 122, 76 144 C 64 160, 48 156, 44 144 Z" fill="#65a30d" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <path d="M 122 116 C 138 94, 164 100, 158 126 C 142 138, 126 132, 122 116 Z" fill="#84cc16" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <path d="M 116 142 C 132 126, 154 136, 148 158 C 132 164, 120 154, 116 142 Z" fill="#4d7c0f" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
    <!-- Bottom Tip -->
    <path d="M 70 148 C 82 132, 114 132, 124 152 C 108 174, 86 174, 70 148 Z" fill="#a3e635" stroke="#1c1917" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 86 168 C 96 156, 108 156, 112 170 C 102 182, 94 182, 86 168 Z" fill="#84cc16" stroke="#1c1917" stroke-width="5" stroke-linejoin="round" />
  </g>

  <!-- Curved Text DEMOCRATA (Top) -->
  <text fill="url(#gold)" font-family="serif, Times, Georgia" font-weight="900" font-size="44" letter-spacing="10">
    <textPath href="#top-arc" startOffset="50%" text-anchor="middle">DEMOCRATA</textPath>
  </text>

  <!-- Curved Text BIER (Bottom) -->
  <text fill="#FBBF24" font-family="serif, Times, Georgia" font-weight="900" font-size="28" letter-spacing="16">
    <textPath href="#bottom-arc" startOffset="50%" text-anchor="middle">BIER</textPath>
  </text>
</svg>`;

async function generateAllIcons() {
  const svgBuffer = Buffer.from(iconSvg);

  // Write base SVG
  fs.writeFileSync(path.resolve('public/democrata-logo.svg'), iconSvg);

  const targets = [
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'apple-touch-icon-precomposed.png', size: 180 },
    { file: 'apple-touch-icon-180x180.png', size: 180 },
    { file: 'apple-touch-icon-152x152.png', size: 152 },
    { file: 'apple-touch-icon-120x120.png', size: 120 },
    { file: 'democrata-logo-192.png', size: 192 },
    { file: 'democrata-logo-512.png', size: 512 },
    { file: 'favicon.png', size: 64 },
    { file: 'favicon-32x32.png', size: 32 },
    { file: 'favicon-16x16.png', size: 16 },
  ];

  for (const t of targets) {
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png({ quality: 100 })
      .toFile(path.resolve(`public/${t.file}`));
    console.log(`Generated public/${t.file} (${t.size}x${t.size})`);
  }

  console.log('✅ All icons regenerated perfectly!');
}

generateAllIcons().catch(console.error);
