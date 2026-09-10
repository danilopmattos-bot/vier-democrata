import React, { useState } from 'react';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import {
  Printer,
  Sparkles,
  Award,
  Loader2,
  QrCode,
  Flame,
  CheckCircle2,
  Beer,
  CircleDot,
  Layers,
  Share2,
  Download,
  RotateCcw,
  Sun,
  Droplets,
  Eye,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { srmToHex } from '../utils/brewingCalculations';
import { DemocrataLogo } from './DemocrataLogo';
import { ThreeCanvasViewer } from './ThreeCanvasViewer';

interface LabelStudioProps {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
}

export const LabelStudio: React.FC<LabelStudioProps> = ({ recipe, calculations }) => {
  const [packagingType, setPackagingType] = useState<'can' | 'bottle' | 'longneck' | 'keg' | 'coaster' | 'flat'>('can');
  const [renderEngine, setRenderEngine] = useState<'webgl_3d' | 'flat_2d'>('webgl_3d');
  const [finishType, setFinishType] = useState<'matte' | 'gold_foil' | 'holographic' | 'brushed_metal' | 'kraft'>('gold_foil');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  const [lightingPreset, setLightingPreset] = useState<'neon' | 'studio' | 'amber_glow' | 'ice_cold'>('amber_glow');
  const [showCondensation, setShowCondensation] = useState(true);
  const [manualRotation, setManualRotation] = useState(0);
  const [tilt3D, setTilt3D] = useState({ x: 0, y: 0 });

  const [customStory, setCustomStory] = useState(
    recipe.manifesto ||
      'Cerveja autoral forjada sob a égide da liberdade e da precisão técnica. Lupulagem sem freios e maltes nobres para paladares rebeldes.'
  );
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const beerColor = srmToHex(calculations.srm);

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      let storyText = '';
      try {
        const response = await fetch('/api/ai/label-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipe,
            tone: finishType,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.copy) {
            storyText = data.copy.story || data.copy.headline;
          }
        }
      } catch (networkErr) {
        // Fallback gracefully
      }

      if (!storyText) {
        storyText = `Forjada com a paixão e a maestria da cervejaria artesanal Democrata. A ${recipe?.name || 'Democrata Autoral'} une uma base nobre de maltes a lúpulos selecionados com ${calculations?.ibu || 35} IBU e ${calculations?.abv || 5.5}% ABV para uma experiência inesquecível no copo.`;
      }

      setCustomStory(storyText);
    } catch (err) {
      console.error(err);
      setCustomStory(
        `Forjada com a paixão e a arte cervejeira. A ${recipe?.name || 'Democrata Autoral'} entrega corpo equilibrado, ${calculations?.ibu || 35} IBUs de amargor limpo e ${calculations?.abv || 5.5}% de puro espírito Democrata.`
      );
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt3D({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt3D({ x: 0, y: 0 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 p-5 rounded-3xl border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-inner">
            <DemocrataLogo size="sm" variant="circular" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              SURREAL 3D PACKAGING STUDIO
            </div>
            <h2 className="text-xl md:text-2xl font-black text-stone-100 font-serif tracking-tight drop-shadow-md">
              Democrata Bier • Modelador Hiper-Realista 3D
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerateStory}
            disabled={isGeneratingStory}
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
          >
            {isGeneratingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 text-stone-950" />}
            Gerar Manifesto IA
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-stone-700 shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Exportar Rótulo Gráfico
          </button>
        </div>
      </div>

      {/* Studio Control Center (Lighting, Finish, Material) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-950/90 p-4 rounded-3xl border border-stone-800/90 text-xs shadow-inner">
        {/* 1. Packaging Form */}
        <div className="space-y-1.5">
          <span className="font-mono font-bold text-stone-400 block uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Modelo 3D / Embalagem:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {[
              { id: 'can', label: 'Lata 473ml 3D', icon: '🥫' },
              { id: 'bottle', label: 'Garrafa 500ml 3D', icon: '🍾' },
              { id: 'longneck', label: 'Longneck 355ml 3D', icon: '🍺' },
              { id: 'keg', label: 'Barril 50L 3D', icon: '🛢️' },
              { id: 'coaster', label: 'Bolacha Chopp 3D', icon: '⭕' },
              { id: 'flat', label: 'Rótulo Plano 2D', icon: '📜' },
            ].map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setPackagingType(pkg.id as any)}
                className={`px-2 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-left text-[11px] cursor-pointer ${
                  packagingType === pkg.id
                    ? 'bg-amber-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black scale-102'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <span>{pkg.icon}</span>
                <span className="truncate">{pkg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Surreal Finish / Textures */}
        <div className="space-y-1.5">
          <span className="font-mono font-bold text-stone-400 block uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acabamento Especial:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'gold_foil', label: 'Hot Stamping Ouro' },
              { id: 'holographic', label: 'Prisma Holográfico' },
              { id: 'matte', label: 'Soft Touch Fosco' },
              { id: 'brushed_metal', label: 'Alumínio Escovado' },
              { id: 'kraft', label: 'Kraft Rústico' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFinishType(f.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
                  finishType === f.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Studio Lighting & Cold Sweat */}
        <div className="space-y-1.5">
          <span className="font-mono font-bold text-stone-400 block uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Iluminação & Efeitos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'amber_glow', label: 'Âmbar Dourado' },
              { id: 'ice_cold', label: 'Gelo Polar' },
              { id: 'neon', label: 'Cyberpunk Neon' },
              { id: 'studio', label: 'Estúdio Neutro' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLightingPreset(l.id as any)}
                className={`px-2 py-1 rounded-xl text-[10px] font-mono font-semibold transition-all ${
                  lightingPreset === l.id
                    ? 'bg-stone-800 text-amber-300 border border-amber-500/60 font-bold'
                    : 'bg-stone-900/60 text-stone-400 hover:text-stone-300 border border-stone-800/80'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCondensation(!showCondensation)}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 transition-all ${
                showCondensation
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-stone-900 text-stone-500 border-stone-800'
              }`}
            >
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>{showCondensation ? 'Condensação Ativa' : 'Vidro/Lata Seca'}</span>
            </button>
          </div>
        </div>

        {/* 4. Accent Color & Rotation Controls */}
        <div className="space-y-1.5">
          <span className="font-mono font-bold text-stone-400 block uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" /> Paleta & Rotação:
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {['#F59E0B', '#10B981', '#E11D48', '#8B5CF6', '#3B82F6', '#D97706', '#E2E8F0'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAccentColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform shadow-md cursor-pointer ${
                  accentColor === color ? 'scale-125 border-white ring-2 ring-amber-400' : 'border-stone-800 hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="pt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setManualRotation((r) => (r + 45) % 360)}
              className="text-[10px] bg-stone-900 hover:bg-stone-800 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-800 font-mono flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" /> Girar 45° ({manualRotation}°)
            </button>
          </div>
        </div>
      </div>

      {/* Main Stage: 3D WebGL Canvas or 2D Flat Graphic */}
      {packagingType !== 'flat' ? (
        <ThreeCanvasViewer
          recipe={recipe}
          calculations={calculations}
          packagingType={packagingType as 'can' | 'bottle' | 'longneck' | 'keg' | 'coaster'}
          finishType={finishType}
          lightingPreset={lightingPreset}
          accentColor={accentColor}
          showCondensation={showCondensation}
          customStory={customStory}
        />
      ) : (
        <div className="relative flex flex-col items-center justify-center p-8 md:p-14 bg-gradient-to-b from-stone-950 via-stone-900/90 to-stone-950 rounded-3xl border border-stone-800 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden min-h-[500px] select-none">
          <div className="w-full max-w-4xl overflow-x-auto p-2">
            <div
              id="beer-label-canvas"
              className="relative w-[780px] h-[370px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-7 flex flex-col justify-between select-none border-2 transition-all duration-500 bg-stone-950"
              style={{
                background:
                  finishType === 'kraft'
                    ? `linear-gradient(135deg, #1c1510 0%, #2f2218 50%, #150f0c 100%)`
                    : `linear-gradient(135deg, #09090b 0%, #18181b 60%, #080808 100%)`,
                borderColor: accentColor,
                boxShadow: `0 0 35px ${accentColor}33`,
              }}
            >
              {finishType === 'holographic' && (
                <div className="absolute inset-0 foil-holographic opacity-15 pointer-events-none" />
              )}

              {/* Left Wing: Manifesto & Brewer Sign */}
              <div className="relative z-10 flex items-start justify-between gap-6">
                <div className="max-w-[210px] text-left text-xs space-y-2.5 border-r border-stone-800/90 pr-5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-extrabold block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> MANIFESTO
                  </span>
                  <p className="text-[10px] text-stone-300 italic leading-relaxed font-serif">
                    "{customStory}"
                  </p>
                  <div className="pt-2 border-t border-stone-800 text-[9px] font-mono text-stone-400 space-y-1">
                    <p>Mestre: <span className="text-stone-200 font-bold">{recipe.brewer || 'Democrata Bier'}</span></p>
                    <p>Ingredientes: Água pura, maltes selecionados, lúpulos aromáticos, levedura viva.</p>
                    <p className="text-amber-400 font-bold">PURO MALTE • NÃO FILTRADA</p>
                  </div>
                </div>

                {/* Center: Hero Emblem & Main Title */}
                <div className="flex-1 flex flex-col items-center text-center px-4">
                  <div className="transform hover:scale-105 transition-transform">
                    <DemocrataLogo size="custom" customSizePx={135} variant="circular" />
                  </div>
                  <h1 className={`text-2xl md:text-3xl font-serif font-black tracking-tight uppercase mt-2 drop-shadow-md ${
                    finishType === 'gold_foil' ? 'foil-gold' : 'text-white'
                  }`}>
                    {recipe.name}
                  </h1>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>
                    "{recipe.tagline || 'Cerveja Soberana'}"
                  </p>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 mt-1">
                    {recipe.style.code} • {recipe.style.name}
                  </span>
                </div>

                {/* Right Wing: Technical Specs & BJCP Radar */}
                <div className="max-w-[200px] text-right text-xs space-y-2 border-l border-stone-800/90 pl-5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                    DADOS DA RECEITA
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">ABV:</span>
                      <span className="font-extrabold text-amber-400">{calculations.abv}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">IBU:</span>
                      <span className="font-extrabold text-emerald-400">{calculations.ibu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">EBC:</span>
                      <span className="font-extrabold text-stone-200">{calculations.ebc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">COPO IDEAL:</span>
                      <span className="font-bold text-amber-300">Tulipa / Pint</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800">
                    <span className="text-[9px] font-mono text-stone-400 block font-bold">
                      VOLUME LOTE: {recipe.batchSizeLiters}L
                    </span>
                    <span className="text-[8px] font-mono text-stone-500 block">
                      INDÚSTRIA BRASILEIRA • MAPA SP-00234
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Legal Trim */}
              <div
                className="relative z-10 pt-3 border-t flex items-center justify-between text-[9px] font-mono text-stone-400"
                style={{ borderColor: `${accentColor}40` }}
              >
                <span>CERVEJARIA DEMOCRATA • ARTESANAL</span>
                <span className="text-amber-400 font-bold">PROIBIDO PARA MENORES DE 18 ANOS • BEBA COM MODERAÇÃO</span>
                <span>REGISTRO OFICIAL DO MESTRE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
