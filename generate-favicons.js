import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const orangeColor = '#F28C28';
const greenColor = '#2E9E45';

const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg viewBox="0 0 500 500" width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chaliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${orangeColor}" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="${greenColor}" />
    </linearGradient>
    <path id="textPathTop" d="M 50,250 A 200,200 0 0,1 450,250" fill="none" />
    <path id="textPathBottom" d="M 450,250 A 200,200 0 0,1 50,250" fill="none" />
  </defs>

  <!-- Complete white background disk to make the logo look stunning on dark/light tabs and Google Search -->
  <circle cx="250" cy="250" r="230" fill="#FFFFFF" />

  <!-- Outer Ring -->
  <circle cx="250" cy="250" r="220" fill="none" stroke="url(#ringGrad)" stroke-width="8" />
  <circle cx="250" cy="250" r="205" fill="none" stroke="#D97706" stroke-width="1.5" opacity="0.3" />

  <!-- Inner Circle disk -->
  <circle cx="250" cy="250" r="195" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1" />

  <!-- Laurel Wreath Branch -->
  <g opacity="0.15" fill="${greenColor}">
    <path d="M 120,290 C 110,240 130,170 170,140 C 165,155 160,185 168,210 C 158,195 145,185 142,205 C 148,220 155,235 168,245 C 155,238 142,238 142,255 C 150,268 158,275 169,280 C 158,278 148,285 152,298 C 160,305 170,305 180,300" />
    <path d="M 380,290 C 390,240 370,170 330,140 C 335,155 340,185 332,210 C 342,195 355,185 358,205 C 352,220 345,235 332,245 C 345,238 358,238 358,255 C 350,268 342,275 331,280 C 342,278 352,285 348,298 C 340,305 330,305 320,300" />
  </g>

  <!-- Open Book at the bottom -->
  <g transform="translate(130, 275)">
    <path d="M 10,65 Q 120,85 240,65 Q 120,45 10,65 Z" fill="#94A3B8" opacity="0.3" />
    <path d="M 120,25 L 120,65" stroke="#64748B" stroke-width="3" stroke-linecap="round" />
    <path d="M 10,25 Q 65,35 120,25 L 120,65 Q 65,75 10,65 Z" fill="#E2E8F0" />
    <path d="M 230,25 Q 175,35 120,25 L 120,65 Q 175,75 230,65 Z" fill="#CBD5E1" />
    <path d="M 15,20 Q 67,31 120,22 L 120,60 Q 67,69 15,60 Z" fill="url(#bookGrad)" stroke="#E2E8F0" stroke-width="1" />
    <path d="M 225,20 Q 173,31 120,22 L 120,60 Q 173,69 225,60 Z" fill="url(#bookGrad)" stroke="#CBD5E1" stroke-width="1" />
    <path d="M 30,32 Q 70,40 110,34" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 30,42 Q 70,50 110,44" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 30,52 Q 70,60 110,54" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 210,32 Q 170,40 130,34" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 210,42 Q 170,50 130,44" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 210,52 Q 170,60 130,54" stroke="#94A3B8" stroke-width="1.5" opacity="0.4" stroke-linecap="round" />
  </g>

  <!-- Holy Grail (Chalice) -->
  <g transform="translate(195, 175)">
    <path d="M 25,120 Q 55,115 85,120 L 75,100 L 35,100 Z" fill="url(#chaliceGrad)" stroke="#B45309" stroke-width="1" />
    <ellipse cx="55" cy="120" rx="30" ry="4" fill="#D97706" opacity="0.8" />
    <path d="M 46,100 L 46,72 L 64,72 L 64,100 Z" fill="url(#chaliceGrad)" stroke="#B45309" stroke-width="1" />
    <ellipse cx="55" cy="85" rx="14" ry="5" fill="#FBBF24" stroke="#D97706" stroke-width="1" />
    <path d="M 12,20 C 12,65 25,75 46,72 L 64,72 C 85,75 98,65 98,20 Z" fill="url(#chaliceGrad)" stroke="#B45309" stroke-width="1" />
    <ellipse cx="55" cy="20" rx="43" ry="8" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" />
    <ellipse cx="55" cy="20" rx="36" ry="5.5" fill="#FFFBEB" opacity="0.95" />
    <g transform="translate(55, 48)">
      <circle cx="0" cy="0" r="14" fill="#FFFBEB" opacity="0.2" />
      <path d="M 0,-10 L 0,10 M -10,0 L 10,0" stroke="#FFFBEB" stroke-width="2.5" stroke-linecap="round" />
      <polygon points="0,-4 3,0 0,4 -3,0" fill="#FFFBEB" />
    </g>
  </g>

  <!-- Mystical glitter particles -->
  <g>
    <circle cx="250" cy="165" r="5" fill="${orangeColor}" />
    <circle cx="230" cy="150" r="3.5" fill="#64748B" />
    <circle cx="270" cy="148" r="4" fill="${greenColor}" />
    <circle cx="215" cy="172" r="2.5" fill="#FBBF24" />
    <circle cx="285" cy="170" r="3" fill="#64748B" />
    <path d="M 250,115 L 253,122 L 260,125 L 253,128 L 250,135 L 247,128 L 240,125 L 247,122 Z" fill="#FBBF24" />
    <path d="M 210,135 L 211,139 L 215,140 L 211,141 L 210,145 L 209,141 L 205,140 L 209,139 Z" fill="#94A3B8" />
    <path d="M 285,133 L 286,137 L 290,138 L 286,139 L 285,143 L 284,139 L 280,138 L 284,137 Z" fill="#F59E0B" />
  </g>

  <!-- Curved Text using native SVG text-anchor systems -->
  <g style="font-family: 'Inter', system-ui, -apple-system, sans-serif;">
    <text font-size="18" font-weight="900" fill="#111827" letter-spacing="3.5">
      <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">SAINT GRAAL IVOIRIEN</textPath>
    </text>
    <text font-size="14" font-weight="700" fill="${greenColor}" letter-spacing="4.5">
      <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">• L'IDÉAL DE L'ÉDITION •</textPath>
    </text>
  </g>
</svg>
`;

// Save pure vector source to public directory
fs.writeFileSync(path.join('public', 'favicon.svg'), svgContent);
console.log('Saved public/favicon.svg successfully!');

// Render high-res PNGs and store them inside the public folder for absolute SEO compatibility
async function generatePngs() {
  try {
    const buffer = Buffer.from(svgContent);

    // Standard 512x512 favicon.png (Google search can index either favicon.png or apple-touch-icon.png)
    await sharp(buffer)
      .resize(512, 512)
      .png()
      .toFile(path.join('public', 'favicon.png'));
    console.log('Generated public/favicon.png (512x512)');

    // Standard apple-touch-icon.png (180x180) for iOS devices
    await sharp(buffer)
      .resize(180, 180)
      .png()
      .toFile(path.join('public', 'apple-touch-icon.png'));
    console.log('Generated public/apple-touch-icon.png (180x180)');

    // Multiple 48 and 96 px icons requested by Google's guidelines for crawler favicon indexing
    await sharp(buffer)
      .resize(48, 48)
      .png()
      .toFile(path.join('public', 'favicon-48.png'));
    console.log('Generated public/favicon-48.png (48x48)');

    await sharp(buffer)
      .resize(192, 192)
      .png()
      .toFile(path.join('public', 'favicon-192.png'));
    console.log('Generated public/favicon-192.png (192x192)');

    // High resolution website cover image for social cards (Open Graph / Twitter banner image)
    // To present a beautiful wide social card banner with the centered logo
    const bannerBg = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: '#FAF6F0' // Elegent Ivory color
      }
    })
    .png()
    .toBuffer();

    const centeredLogo = await sharp(buffer)
      .resize(400, 400)
      .png()
      .toBuffer();

    await sharp(bannerBg)
      .composite([{ input: centeredLogo, gravity: 'center' }])
      .png()
      .toFile(path.join('public', 'og-banner.png'));
    console.log('Generated public/og-banner.png (1200x630 social card banner)');

    console.log('All favicon files generated and optimized successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generatePngs();
