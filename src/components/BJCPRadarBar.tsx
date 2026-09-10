import React from 'react';
import { BJCPStyle, RecipeCalculations } from '../types/brewing';
import { CheckCircle2, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface BJCPRadarBarProps {
  style: BJCPStyle;
  calculations: RecipeCalculations;
}

export const BJCPRadarBar: React.FC<BJCPRadarBarProps> = ({ style, calculations }) => {
  const { og, fg, abv, ibu, srm, bjcpCompliance } = calculations;

  const renderGauge = (
    label: string,
    currentValue: number,
    min: number,
    max: number,
    unit: string,
    decimals: number = 1
  ) => {
    // Normalization logic
    const totalSpan = max - min;
    const padding = totalSpan * 0.35;
    const lowerBound = min - padding;
    const upperBound = max + padding;
    const totalRange = upperBound - lowerBound;

    // Target box position %
    const targetLeft = ((min - lowerBound) / totalRange) * 100;
    const targetWidth = ((max - min) / totalRange) * 100;

    // Current needle position %
    const clampedVal = Math.min(Math.max(currentValue, lowerBound), upperBound);
    const needleLeft = ((clampedVal - lowerBound) / totalRange) * 100;

    const isOk = currentValue >= min && currentValue <= max;
    const isLow = currentValue < min;
    const isHigh = currentValue > max;

    return (
      <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-stone-300 tracking-wider flex items-center gap-1">
            {label}
            {isOk ? (
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                OK
              </span>
            ) : isLow ? (
              <span className="text-sky-400 font-mono text-[10px] bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center">
                <ArrowDownRight className="w-3 h-3 inline" /> BAIXO
              </span>
            ) : (
              <span className="text-amber-400 font-mono text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" /> ALTO
              </span>
            )}
          </span>
          <div className="font-mono font-bold text-amber-200 text-sm">
            {currentValue.toFixed(decimals)} {unit}
          </div>
        </div>

        {/* Visual Bar with Target Zone */}
        <div className="relative w-full h-3 bg-stone-900 rounded-full overflow-visible my-1 border border-stone-800">
          {/* Target BJCP Range Zone */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400/50 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            style={{
              left: `${targetLeft}%`,
              width: `${targetWidth}%`,
            }}
          />

          {/* Current Needle Marker */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-5 rounded shadow-lg transition-all duration-500 z-10 border ${
              isOk
                ? 'bg-emerald-400 border-white shadow-emerald-500/50'
                : isLow
                ? 'bg-sky-400 border-white shadow-sky-500/50'
                : 'bg-amber-400 border-white shadow-amber-500/50'
            }`}
            style={{ left: `${needleLeft}%` }}
          >
            <div className="w-0.5 h-2.5 bg-stone-950 mx-auto mt-1 rounded-full" />
          </div>
        </div>

        {/* BJCP Bounds labels */}
        <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-1">
          <span>Min: {min.toFixed(decimals)}</span>
          <span className="text-emerald-400/80 font-medium">Faixa BJCP</span>
          <span>Max: {max.toFixed(decimals)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900/80 border border-amber-900/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
              Guia BJCP 2021
            </span>
            <span className="text-[11px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Código {style.code}
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-wide mt-0.5">
            {style.name}
          </h3>
        </div>

        {/* BJCP Compliance Score */}
        <div className="flex items-center gap-3 bg-stone-950/80 px-3.5 py-1.5 rounded-xl border border-stone-800">
          <div className="text-right">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">Aderência ao Estilo</div>
            <div className="text-xs font-semibold text-stone-200">
              {bjcpCompliance.score >= 80 ? 'Padrão Ouro Democrata' : 'Fora do Padrão BJCP'}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-sm border-2 ${
              bjcpCompliance.score >= 80
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-amber-950/80 text-amber-300 border-amber-500'
            }`}
          >
            {bjcpCompliance.score}%
          </div>
        </div>
      </div>

      {/* Grid of 5 Key BJCP Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {renderGauge('Densidade Inicial (OG)', og, style.ogMin, style.ogMax, 'SG', 3)}
        {renderGauge('Densidade Final (FG)', fg, style.fgMin, style.fgMax, 'SG', 3)}
        {renderGauge('Teor Alcoólico (ABV)', abv, style.abvMin, style.abvMax, '%', 1)}
        {renderGauge('Amargor (IBU)', ibu, style.ibuMin, style.ibuMax, 'IBU', 0)}
        {renderGauge('Cor da Cerveja (SRM)', srm, style.srmMin, style.srmMax, 'SRM', 1)}
      </div>

      {/* BU:GU Bitterness to Gravity Balance Note */}
      <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-stone-300">
          <span className="font-semibold text-amber-400">Relação BU:GU:</span>
          <span className="font-mono font-bold text-white bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
            {calculations.buGu}
          </span>
          <span className="text-stone-400">
            (Alvo do Estilo: <span className="text-amber-300 font-mono">{style.targetBuGu}</span> •{' '}
            {calculations.buGu > 0.9
              ? 'Altamente Amarga & Crocante'
              : calculations.buGu > 0.6
              ? 'Equilibrada com Bom Amargor'
              : calculations.buGu > 0.4
              ? 'Foco no Malte & Dulçor'
              : 'Muito Suave / Maltada'}
            )
          </span>
        </div>
        <div className="text-[11px] text-stone-500 italic">
          *Calculado via Equação Tinseth & Morey
        </div>
      </div>
    </div>
  );
};
