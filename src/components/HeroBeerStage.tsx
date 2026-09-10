import React from 'react';
import { Beer, Droplets, Sparkles } from 'lucide-react';
import { srmToHex } from '../utils/brewingCalculations';
import { DemocrataLogo } from './DemocrataLogo';

interface HeroBeerStageProps {
  srm: number;
  abv: number;
  ibu: number;
  name: string;
  styleName: string;
}

const BUBBLES = [
  [22, 78, 4], [31, 69, 2], [44, 82, 3], [57, 64, 2], [68, 76, 4],
  [76, 58, 2], [38, 55, 3], [52, 48, 2], [63, 42, 3], [28, 44, 2],
  [73, 32, 2], [47, 29, 3], [35, 24, 2], [59, 20, 2], [81, 72, 2],
] as const;

const DROPS = [
  [17, 24, 5], [77, 18, 3], [83, 38, 5], [21, 47, 3], [72, 58, 4],
  [28, 67, 5], [80, 76, 3], [42, 16, 2], [61, 33, 3], [36, 83, 3],
] as const;

export const HeroBeerStage: React.FC<HeroBeerStageProps> = ({ srm, abv, ibu, name, styleName }) => {
  const beerColor = srmToHex(srm);

  return (
    <div className="relative mx-auto flex min-h-[370px] w-full max-w-[390px] items-end justify-center sm:min-h-[430px]">
      <div className="pointer-events-none absolute bottom-7 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-amber-500/25 blur-[70px]" />
      <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-56 -translate-x-1/2 rounded-[100%] bg-black/70 blur-xl" />

      <div className="absolute right-0 top-7 z-20 hidden rounded-2xl border border-white/10 bg-black/45 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/80">
          <Sparkles className="h-3 w-3" /> Receita atual
        </div>
        <p className="mt-1 max-w-[150px] truncate text-xs font-extrabold text-stone-100">{name}</p>
      </div>

      <div className="absolute left-0 top-[35%] z-20 hidden rounded-2xl border border-white/10 bg-black/45 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
          <Droplets className="h-3 w-3 text-sky-300" /> Perfil
        </div>
        <p className="mt-1 max-w-[135px] truncate text-xs font-bold text-stone-200">{styleName}</p>
      </div>

      <div className="beer-hero-glass group relative z-10 h-[350px] w-[190px] sm:h-[405px] sm:w-[220px]">
        <div className="beer-hero-liquid" style={{ backgroundColor: beerColor }}>
          <div className="beer-hero-caustic" />
          {BUBBLES.map(([x, y, size], index) => (
            <span
              key={index}
              className="beer-hero-bubble"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${(index % 6) * 0.31}s`,
                animationDuration: `${2.8 + (index % 5) * 0.38}s`,
              }}
            />
          ))}
        </div>

        <div className="beer-hero-foam">
          <span className="beer-foam-blob beer-foam-blob-a" />
          <span className="beer-foam-blob beer-foam-blob-b" />
          <span className="beer-foam-blob beer-foam-blob-c" />
          <span className="beer-foam-blob beer-foam-blob-d" />
        </div>

        <div className="beer-hero-glass-shine" />
        {DROPS.map(([x, y, size], index) => (
          <span
            key={index}
            className="beer-hero-drop"
            style={{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size * 1.35}px` }}
          />
        ))}

        <div className="absolute left-1/2 top-[49%] z-30 -translate-x-1/2 rounded-full border border-white/20 bg-black/45 p-1.5 shadow-[0_9px_30px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <DemocrataLogo size="custom" customSizePx={64} variant="circular" />
        </div>

        <div className="pointer-events-none absolute inset-x-[17%] bottom-[3%] z-40 h-[4%] rounded-[50%] bg-white/25 blur-[2px]" />
      </div>

      <div className="absolute bottom-0 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0c0906]/85 px-3.5 py-2 shadow-xl backdrop-blur-xl">
        <Beer className="h-3.5 w-3.5 text-amber-300" />
        <span className="font-mono text-[10px] font-black text-stone-200">{abv.toFixed(1)}% ABV</span>
        <span className="text-stone-700">•</span>
        <span className="font-mono text-[10px] font-black text-stone-200">{Math.round(ibu)} IBU</span>
        <span className="text-stone-700">•</span>
        <span className="font-mono text-[10px] font-black text-stone-200">{Math.round(srm)} SRM</span>
      </div>
    </div>
  );
};
