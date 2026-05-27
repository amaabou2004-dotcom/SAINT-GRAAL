import React, { useRef, useState } from 'react';
import { Download, Sparkles, BookOpen, Check, RefreshCw, FileCode, Landmark } from 'lucide-react';

interface LogoDownloaderProps {
  darkMode: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onSetSiteLogo?: (logoUrl: string) => void;
}

export const LogoDownloader: React.FC<LogoDownloaderProps> = ({
  darkMode,
  onNotify,
  onSetSiteLogo
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [useCircularText, setUseCircularText] = useState(true);
  const [bgType, setBgType] = useState<'transparent' | 'light' | 'dark' | 'ivory'>('transparent');
  const [accentStyle, setAccentStyle] = useState<'classic' | 'modern' | 'minimal'>('classic');

  // Official Ivory Coast colors (Orange and Green) matched in the earlier instructions
  const orangeColor = '#F28C28';
  const greenColor = '#2E9E45';

  const downloadLogo = async (format: 'svg' | 'png-transparent' | 'png-solid') => {
    if (!svgRef.current) return;
    setDownloading(format);

    try {
      // Create cloned SVG to inject styles and perform download cleanups
      const svgElement = svgRef.current.cloneNode(true) as SVGSVGElement;
      
      // Ensure specific style sizes are applied before export
      svgElement.setAttribute('width', '1024');
      svgElement.setAttribute('height', '1024');

      // Serializing the SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      
      // Inject XML namespace if missing
      if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      if (format === 'svg') {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'logo-saint-graal-ivoirien.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onNotify?.("Logo SVG téléchargé avec succès !", "success");
      } else {
        // Handle PNG formats (with canvas)
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Impossible d'initialiser le contexte de dessin 2D.");
        }

        // Apply background if solid requested
        if (format === 'png-solid') {
          if (bgType === 'dark') {
            ctx.fillStyle = '#111827'; // Dark Slate background
          } else if (bgType === 'ivory') {
            ctx.fillStyle = '#FAF6F0'; // Elegent Ivory color
          } else {
            ctx.fillStyle = '#FFFFFF'; // Pure White background
          }
          ctx.fillRect(0, 0, 1024, 1024);
        }

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1024, 1024);
          URL.revokeObjectURL(url);

          try {
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `logo-saint-graal-ivoirien-${format === 'png-transparent' ? 'transparent' : 'plein'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onNotify?.("Logo PNG exporté et enregistré dans votre galerie !", "success");
          } catch (err) {
            console.error("Canvas export failed:", err);
            onNotify?.("Erreur lors de l'export PNG. Essayez le format SVG.", "error");
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          onNotify?.("Échec du chargement du vecteur image pour l'export.", "error");
        };

        img.src = url;
      }
    } catch (error) {
      console.error(error);
      onNotify?.("Une erreur est survenue lors du téléchargement.", "error");
    } finally {
      // Small timeout to give user feedback
      setTimeout(() => {
        setDownloading(null);
      }, 800);
    }
  };

  const loadPresetAsSiteLogo = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current.cloneNode(true) as SVGSVGElement;
      svgElement.setAttribute('width', '512');
      svgElement.setAttribute('height', '512');
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSetSiteLogo?.(base64data);
        onNotify?.("Nouveau logo appliqué au site avec succès !", "success");
      };
      reader.readAsDataURL(svgBlob);
    } catch (error) {
      onNotify?.("Erreur lors de la configuration du logo de l'application.", "error");
    }
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        
        {/* Real-time Interactive SVG Logo Preview */}
        <div className="relative group flex-shrink-0">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-orange to-vert rounded-[2.2rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className={`relative p-6 rounded-[2rem] border-2 flex items-center justify-center w-72 h-72 md:w-80 md:h-80 shadow-inner transition-all duration-300 ${
            bgType === 'transparent' ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] border-gray-200/50 dark:border-gray-800' : 
            bgType === 'dark' ? 'bg-gray-950 border-gray-950' : 
            bgType === 'ivory' ? 'bg-[#FAF6F0] border-amber-100' : 
            'bg-white border-gray-100'
          }`}>
            
            {/* SVG LOGO COMPOSITION FOR SAINT GRAAL IVOIRIEN */}
            <svg 
              ref={svgRef}
              viewBox="0 0 500 500" 
              className="w-full h-full select-none"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            >
              <defs>
                <linearGradient id="chaliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" /> {/* Bright Gold */}
                  <stop offset="50%" stopColor="#F59E0B" /> {/* Gold */}
                  <stop offset="100%" stopColor="#D97706" /> {/* Deep Amber */}
                </linearGradient>
                <linearGradient id="bookGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={orangeColor} />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor={greenColor} />
                </linearGradient>
                {/* Text along spiral path definition */}
                <path 
                  id="textPathTop" 
                  d="M 50,250 A 200,200 0 0,1 450,250" 
                  fill="none" 
                />
                <path 
                  id="textPathBottom" 
                  d="M 450,250 A 200,200 0 0,1 50,250" 
                  fill="none" 
                />
              </defs>

              {/* Background fill purely for solid exports if transparent is not selected */}
              {bgType === 'dark' && <rect width="500" height="500" rx="36" fill="#111827" opacity="0" />}
              {bgType === 'light' && <rect width="500" height="500" rx="36" fill="#FFFFFF" opacity="0" />}
              {bgType === 'ivory' && <rect width="500" height="500" rx="36" fill="#FAF6F0" opacity="0" />}

              {/* Outer Golden/National Colors Ring */}
              <circle 
                cx="250" 
                cy="250" 
                r="220" 
                fill="none" 
                stroke="url(#ringGrad)" 
                strokeWidth={accentStyle === 'minimal' ? '4' : '8'} 
                strokeDasharray={accentStyle === 'modern' ? '12 6' : undefined}
                className="transition-all duration-300"
              />
              
              <circle 
                cx="250" 
                cy="250" 
                r="205" 
                fill="none" 
                stroke="#D97706" 
                strokeWidth="1.5"
                opacity="0.3" 
              />

              {/* Inner Circle background */}
              <circle 
                cx="250" 
                cy="250" 
                r="195" 
                fill={bgType === 'dark' ? '#1f2937' : '#FFFFFF'} 
                fillOpacity={bgType === 'transparent' ? '0.08' : '0.97'}
                stroke={accentStyle === 'minimal' ? 'none' : '#E5E7EB'}
                strokeWidth="1"
              />

              {/* Decorative Laurel Wreath / Laurel Leaves */}
              {accentStyle === 'classic' && (
                <g opacity="0.15" fill={greenColor}>
                  {/* Left Wreath Branch */}
                  <path d="M 120,290 C 110,240 130,170 170,140 C 165,155 160,185 168,210 C 158,195 145,185 142,205 C 148,220 155,235 168,245 C 155,238 142,238 142,255 C 150,268 158,275 169,280 C 158,278 148,285 152,298 C 160,305 170,305 180,300" />
                  {/* Right Wreath Branch */}
                  <path d="M 380,290 C 390,240 370,170 330,140 C 335,155 340,185 332,210 C 342,195 355,185 358,205 C 352,220 345,235 332,245 C 345,238 358,238 358,255 C 350,268 342,275 331,280 C 342,278 352,285 348,298 C 340,305 330,305 320,300" />
                </g>
              )}

              {/* Open Book Graphics at the base of the grail */}
              <g transform="translate(130, 275)">
                {/* Book Shadows */}
                <path d="M 10,65 Q 120,85 240,65 Q 120,45 10,65 Z" fill="#94A3B8" opacity="0.3" />
                
                {/* Book spine/centerfold */}
                <path d="M 120,25 L 120,65" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

                {/* Left Page Pages back sheets */}
                <path d="M 10,25 Q 65,35 120,25 L 120,65 Q 65,75 10,65 Z" fill="#E2E8F0" />
                {/* Right Page Pages back sheets */}
                <path d="M 230,25 Q 175,35 120,25 L 120,65 Q 175,75 230,65 Z" fill="#CBD5E1" />

                {/* Left Page Top (White gloss) */}
                <path d="M 15,20 Q 67,31 120,22 L 120,60 Q 67,69 15,60 Z" fill="url(#bookGrad)" stroke="#E2E8F0" strokeWidth="1" />
                {/* Right Page Top (White gloss) */}
                <path d="M 225,20 Q 173,31 120,22 L 120,60 Q 173,69 225,60 Z" fill="url(#bookGrad)" stroke="#CBD5E1" strokeWidth="1" />
                
                {/* Fine book engraving lines */}
                <path d="M 30,32 Q 70,40 110,34" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                <path d="M 30,42 Q 70,50 110,44" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                <path d="M 30,52 Q 70,60 110,54" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />

                <path d="M 210,32 Q 170,40 130,34" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                <path d="M 210,42 Q 170,50 130,44" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
                <path d="M 210,52 Q 170,60 130,54" stroke="#94A3B8" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
              </g>

              {/* Holy Grail (Chalice) representation */}
              <g transform="translate(195, 175)">
                {/* Chalice Stand Base */}
                <path d="M 25,120 Q 55,115 85,120 L 75,100 L 35,100 Z" fill="url(#chaliceGrad)" stroke="#B45309" strokeWidth="1" />
                <ellipse cx="55" cy="120" rx="30" ry="4" fill="#D97706" opacity="0.8" />
                
                {/* Chalice Stem Column with sleek knots */}
                <path d="M 46,100 L 46,72 L 64,72 L 64,100 Z" fill="url(#chaliceGrad)" stroke="#B45309" strokeWidth="1" />
                <ellipse cx="55" cy="85" rx="14" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />

                {/* Chalice Cup Bowl */}
                <path d="M 12,20 C 12,65 25,75 46,72 L 64,72 C 85,75 98,65 98,20 Z" fill="url(#chaliceGrad)" stroke="#B45309" strokeWidth="1" />
                
                {/* Sleek Golden Lip Oval */}
                <ellipse cx="55" cy="20" rx="43" ry="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                {/* Reflective Inner liquid glow or mystical light */}
                <ellipse cx="55" cy="20" rx="36" ry="5.5" fill="#FFFBEB" opacity="0.95" />

                {/* Embossed Holy Cross/Star decoration on the Grail body */}
                {accentStyle !== 'minimal' && (
                  <g transform="translate(55, 48)">
                    {/* Glowing circular backdrop */}
                    <circle cx="0" cy="0" r="14" fill="#FFFBEB" opacity="0.2" />
                    {/* Star cross */}
                    <path d="M 0,-10 L 0,10 M -10,0 L 10,0" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="0,-4 3,0 0,4 -3,0" fill="#FFFBEB" />
                  </g>
                )}
              </g>

              {/* Sparkling Literary Glimmers & Inspiration Dust and Flag Colors */}
              <g>
                {/* Mystical particles emanating from the Grail */}
                <circle cx="250" cy="165" r="5" fill={orangeColor} className="animate-pulse" />
                <circle cx="230" cy="150" r="3.5" fill="#FFFFFF" />
                <circle cx="270" cy="148" r="4" fill={greenColor} />
                <circle cx="215" cy="172" r="2.5" fill="#FBBF24" />
                <circle cx="285" cy="170" r="3" fill="#FFFFFF" />

                {/* Tiny delicate Sparkle stars */}
                <path d="M 250,115 L 253,122 L 260,125 L 253,128 L 250,135 L 247,128 L 240,125 L 247,122 Z" fill="#FBBF24" />
                <path d="M 210,135 L 211,139 L 215,140 L 211,141 L 210,145 L 209,141 L 205,140 L 209,139 Z" fill="#FFFBEB" />
                <path d="M 285,133 L 286,137 L 290,138 L 286,139 L 285,143 L 284,139 L 280,138 L 284,137 Z" fill="#F59E0B" />
              </g>

              {/* Text around the Ring: "SAINT GRAAL IVOIRIEN" & "L'IDÉAL DE L'ÉDITION" */}
              {useCircularText ? (
                <g>
                  {/* Top curved text */}
                  <text fontFamily="Inter, system-ui, sans-serif" fontSize="18" fontWeight="800" fill={darkMode && bgType === 'transparent' ? '#FFFFFF' : '#111827'} letterSpacing="3.5">
                    <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
                      SAINT GRAAL IVOIRIEN
                    </textPath>
                  </text>
                  
                  {/* Bottom curved text */}
                  <text fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="600" fill={greenColor} letterSpacing="4.5">
                    <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
                      • L'IDÉAL DE L'ÉDITION •
                    </textPath>
                  </text>
                </g>
              ) : (
                <g transform="translate(250, 445)" textAnchor="middle">
                  {/* Linear clean text presentation */}
                  <text fontFamily="Inter, sans-serif" fontSize="22" fontWeight="900" fill={darkMode && bgType === 'transparent' ? '#FFFFFF' : '#111827'} letterSpacing="1.5">
                    SAINT GRAAL
                  </text>
                  <text y="22" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" fill={greenColor} letterSpacing="3">
                    L'IDÉAL DE L'ÉDITION
                  </text>
                </g>
              )}
            </svg>
            
          </div>
        </div>

        {/* Configuration controls & Download Actions */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange px-3 py-1 bg-orange/10 rounded-full inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Coup de Coeur National
            </span>
            <h3 className="text-2xl font-black tracking-tight leading-none mb-2">
              Studio Graphique
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Téléchargez instantanément ce magnifique logo officiel du <strong className="text-orange">Saint Graal Ivoirien</strong> dans votre galerie (téléphone, tablette ou ordinateur) pour le publier, l'imprimer ou l'intégrer partout !
            </p>
          </div>

          {/* Quick Styling Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block ml-1">Style de contours</label>
              <div className="flex bg-gray-50 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 gap-1">
                {(['classic', 'modern', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setAccentStyle(style)}
                    className={`flex-1 text-xs py-2 capitalize rounded-lg font-bold transition-all ${
                      accentStyle === style 
                        ? 'bg-white dark:bg-gray-900 text-orange shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {style === 'classic' ? 'Royal' : style === 'modern' ? 'Moderne' : 'Épuré'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block ml-1">Texte du sceau</label>
              <div className="flex bg-gray-50 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 gap-1">
                <button
                  onClick={() => setUseCircularText(true)}
                  className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
                    useCircularText 
                      ? 'bg-white dark:bg-gray-900 text-orange shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Circulaire (Sceau)
                </button>
                <button
                  onClick={() => setUseCircularText(false)}
                  className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
                    !useCircularText 
                      ? 'bg-white dark:bg-gray-900 text-orange shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Linéaire (Bas)
                </button>
              </div>
            </div>

          </div>

          {/* Logo Background Selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block ml-1">Fond pour le téléchargement solide</label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { type: 'transparent', label: 'Transparent (Idéal site web / stickers)' },
                { type: 'light', label: 'Blanc Pur (Photo de profil)' },
                { type: 'ivory', label: 'Ivoire Vintage (Élégant / livre)' },
                { type: 'dark', label: 'Sombre Chic (Réseaux / Noir)' }
              ].map((bg) => (
                <button
                  key={bg.type}
                  onClick={() => setBgType(bg.type as any)}
                  className={`text-xs px-3 py-2 rounded-xl font-bold border transition-all ${
                    bgType === bg.type 
                      ? 'border-orange bg-orange/5 text-orange' 
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download and Integration Buttons */}
          <div className="pt-2 flex flex-col md:flex-row gap-3">
            
            <button
              id="download_png_button"
              disabled={downloading !== null}
              onClick={() => downloadLogo(bgType === 'transparent' ? 'png-transparent' : 'png-solid')}
              className="flex-1 flex items-center justify-center gap-2.5 bg-orange text-white hover:bg-orange/90 font-bold py-3.5 px-6 rounded-2xl active:scale-[0.98] transition duration-150 disabled:opacity-50 text-sm tracking-wide uppercase shadow-lg shadow-orange/10"
            >
              {downloading === 'png-transparent' || downloading === 'png-solid' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Génération du PNG...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Télécharger en PNG
                </>
              )}
            </button>

            <button
              id="download_svg_button"
              disabled={downloading !== null}
              onClick={() => downloadLogo('svg')}
              className={`flex-1 flex items-center justify-center gap-2.5 font-bold py-3.5 px-6 rounded-2xl active:scale-[0.98] transition duration-150 border-2 text-sm tracking-wide uppercase ${
                darkMode 
                  ? 'border-gray-800 hover:bg-gray-800 text-white' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-800'
              }`}
            >
              {downloading === 'svg' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Génération du vecteur...
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  Télécharger en SVG (Vectoriel)
                </>
              )}
            </button>

          </div>

          {onSetSiteLogo && (
            <button
              onClick={loadPresetAsSiteLogo}
              className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl border-2 border-dashed transition text-xs uppercase tracking-wider ${
                darkMode 
                  ? 'border-vert/30 hover:border-vert text-vert hover:bg-vert/5' 
                  : 'border-vert/20 hover:border-vert text-vert hover:bg-vert/5'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Appliquer directement comme Logo du Site Web
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
