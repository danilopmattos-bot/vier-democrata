import React, { useState } from 'react';
import { WaterProfile, WaterSalts, GrainBillItem } from '../types/brewing';
import { WATER_PROFILES, CURITIBA_WATER_SOURCES } from '../data/ingredients';
import {
  Droplet,
  Sparkles,
  Sliders,
  ShieldAlert,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Flame,
  Layers,
  HelpCircle,
  Pill,
} from 'lucide-react';
import {
  autoCalculateSaltsFromBase,
  calculateCampdenDosage,
  estimateMashPH,
} from '../utils/brewingCalculations';
import { triggerWaterWave } from '../utils/dopamineEffects';

interface WaterLabProps {
  waterTarget: WaterProfile;
  onWaterTargetChange: (target: WaterProfile) => void;
  baseWaterSource?: WaterProfile;
  onBaseWaterSourceChange?: (source: WaterProfile) => void;
  waterSalts: WaterSalts;
  onSaltsChange: (salts: WaterSalts) => void;
  calculatedWater: {
    ca: number;
    mg: number;
    na: number;
    cl: number;
    so4: number;
    hco3: number;
    sulfateToChlorideRatio: number;
    residualAlkalinity?: number;
  };
  grains?: GrainBillItem[];
  totalWaterNeededLiters: number;
}

export const WaterLab: React.FC<WaterLabProps> = ({
  waterTarget,
  onWaterTargetChange,
  baseWaterSource = CURITIBA_WATER_SOURCES[0],
  onBaseWaterSourceChange,
  waterSalts,
  onSaltsChange,
  calculatedWater,
  grains = [],
  totalWaterNeededLiters,
}) => {
  const [showCuritibaGuide, setShowCuritibaGuide] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'adjustments' | 'diagnostics' | 'guide'>('adjustments');

  // Dechlorination & Campden
  const campdenInfo = calculateCampdenDosage(totalWaterNeededLiters);

  // Residual Alkalinity (Kolbach)
  const raValue =
    calculatedWater.residualAlkalinity ??
    Number(
      (
        calculatedWater.hco3 * 0.82 -
        (calculatedWater.ca / 1.4 + calculatedWater.mg / 1.7)
      ).toFixed(1)
    );

  // Mash pH estimation
  const mashPhAnalysis = estimateMashPH(
    grains,
    raValue,
    waterSalts.lacticAcid88Ml || 0,
    totalWaterNeededLiters
  );

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = WATER_PROFILES.find((w) => w.name === e.target.value);
    if (found) onWaterTargetChange(found);
  };

  const handleSelectBaseSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = CURITIBA_WATER_SOURCES.find((w) => w.name === e.target.value);
    if (found && onBaseWaterSourceChange) {
      onBaseWaterSourceChange(found);
    }
  };

  const handleSaltUpdate = (field: keyof WaterSalts, value: number) => {
    onSaltsChange({
      ...waterSalts,
      [field]: Math.max(value, 0),
    });
  };

  // Auto calculate salts from Curitiba base water to Target profile
  const handleAutoAdjustSalts = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    triggerWaterWave(x, y);

    const calculated = autoCalculateSaltsFromBase(
      baseWaterSource,
      waterTarget,
      totalWaterNeededLiters
    );
    onSaltsChange(calculated);
  };

  // Ratio Interpretation
  const ratio = calculatedWater.sulfateToChlorideRatio;
  let ratioText = 'Equilibrado (1:1)';
  let ratioColor = 'text-amber-300';
  if (ratio > 2.0) {
    ratioText = 'Muito Amarga, Seca & Cortante (West Coast / Bitter)';
    ratioColor = 'text-emerald-400';
  } else if (ratio > 1.3) {
    ratioText = 'Levemente Amarga & Crocante';
    ratioColor = 'text-emerald-300';
  } else if (ratio < 0.6) {
    ratioText = 'Aveludada, Encorpada & Suculenta (Juicy NEIPA)';
    ratioColor = 'text-purple-400';
  } else if (ratio < 0.8) {
    ratioText = 'Foco em Redondeza de Malte & Maciez';
    ratioColor = 'text-sky-300';
  }

  // Calcium warning
  const isCalciumLow = calculatedWater.ca < 50;

  const renderIonCard = (
    name: string,
    symbol: string,
    baseVal: number,
    current: number,
    target: number,
    unit = 'ppm'
  ) => {
    const diff = current - target;
    return (
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 flex flex-col justify-between hover:border-stone-700 transition-colors">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-stone-400 font-semibold">{name}</span>
          <span className="font-mono text-[10px] text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
            {symbol}
          </span>
        </div>

        <div className="space-y-1 my-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-stone-500">Base Curitiba:</span>
            <span className="font-mono text-xs text-stone-400">{baseVal} {unit}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-stone-300">Final com Sais:</span>
            <span className="font-mono text-base font-black text-amber-300">
              {current} <span className="text-[10px] font-normal text-stone-400">{unit}</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-900">
            <span>Alvo do Estilo:</span>
            <span className="text-cyan-300 font-bold">{target} {unit}</span>
          </div>
        </div>

        {/* Progress gauge */}
        <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-500 ${
              Math.abs(diff) <= 20
                ? 'bg-emerald-400'
                : diff < 0
                ? 'bg-sky-400'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min((current / (target || 1)) * 100, 150)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Top Header: Title & Auto-Ajuste Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-wide font-serif">
                Água & Sais Minerais
              </h3>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/80 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full">
                Curitiba / Sanepar
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Água total estimada:{' '}
              <span className="text-cyan-300 font-mono font-bold">
                {totalWaterNeededLiters} Litros
              </span>{' '}
              · ajuste a partir da água usada na brassagem
            </p>
          </div>
        </div>

        {/* Auto-Adjust Button from Curitiba Water */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoAdjustSalts}
            className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-cyan-300/40"
            title="Calcula as dosagens ideais de Gypsum, Cloreto de Cálcio, Epsom, Sal e Ácido para a litragem exata da panela"
          >
            <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
            <span>⚡ Calcular ajuste dos sais</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCuritibaGuide(!showCuritibaGuide)}
            className={`text-xs px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
              showCuritibaGuide
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-stone-950 text-stone-300 hover:text-white border-stone-800'
            }`}
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Sobre a água de Curitiba</span>
          </button>
        </div>
      </div>

      {/* Curitiba & Sanepar Dossier / Explanation Modal / Collapsible */}
      {showCuritibaGuide && (
        <div className="bg-gradient-to-r from-stone-950 via-cyan-950/30 to-stone-950 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-cyan-200 uppercase tracking-wider">
                Água de Curitiba (Sanepar) na cerveja
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowCuritibaGuide(false)}
              className="text-stone-400 hover:text-stone-200 text-xs font-mono"
            >
              Fechar ✕
            </button>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Curitiba é abençoada com uma das águas mais suaves e puras do mundo cervejeiro (semelhante à famosa água de Plzeň na Tchéquia). Seus mananciais (Passaúna, Iraí, Piraquara e Miringuava) produzem uma água com <strong>baixíssima mineralização (Dureza ~25-35 ppm CaCO3 e Alcalinidade Residual ~10 ppm)</strong>. Isso a torna uma <em>tela em branco perfeita</em>, mas exige 3 atenções fundamentais do cervejeiro:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
              <span className="font-bold text-amber-400 block mb-1">1. Cloro & Cloraminas</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                A Sanepar adiciona cloro/cloraminas para tratamento. Se não for neutralizado com <strong>Campden (Metabissulfito)</strong> ou carvão ativado, gera o temido off-flavor de <em>Clorofenol (gosto medicinal/esparadrapo)</em>.
              </p>
            </div>
            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
              <span className="font-bold text-cyan-400 block mb-1">2. Alcalinidade Quase Nula</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Quase não tem poder tampão. Em cervejas claras, <strong>pouco ácido lático (0.5 a 1.5 mL)</strong> já reduz o pH. Em cervejas escuras (Stouts), os maltes torrados derrubam o pH demais, exigindo <strong>bicarbonato de sódio</strong>.
              </p>
            </div>
            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">3. Cálcio Baixo (&lt; 15 ppm)</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                O cálcio natural é insuficiente para a ação ótima das enzimas amilase (&ge; 50 ppm) e para a clarificação/floculação da levedura. Exige adição de <strong>CaCl2</strong> ou <strong>CaSO4 (Gipsita)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dual Profile Selectors: Base Source (Curitiba / RO) VS Target Style Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Water Selector */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5" /> 1. Fonte da Água Base (Ponto de Partida)
            </label>
            <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-0.5 rounded">
              Origem
            </span>
          </div>

          <select
            value={baseWaterSource.name}
            onChange={handleSelectBaseSource}
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            {CURITIBA_WATER_SOURCES.map((w) => (
              <option key={w.name} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400 italic line-clamp-2">
            {baseWaterSource.description || 'Perfil mineral da água de entrada.'}
          </p>
        </div>

        {/* Target Profile Selector */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 2. Perfil de Água Alvo (Estilo da Cerveja)
            </label>
            <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-0.5 rounded">
              Destino
            </span>
          </div>

          <select
            value={waterTarget.name}
            onChange={handleSelectPreset}
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            {WATER_PROFILES.map((w) => (
              <option key={w.name} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400 italic line-clamp-2">
            {waterTarget.description || 'Perfil químico almejado para o estilo.'}
          </p>
        </div>
      </div>

      {/* 3 Specialized Mechanisms Cards: Campden / Descloração + Previsão de pH + Alerta de Cálcio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Mechanism 1: Dechlorination & Campden */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-400" /> Descloração Sanepar
            </span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
              Campden
            </span>
          </div>

          <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 text-center">
            <span className="text-[11px] text-stone-400 block">Dosagem para {totalWaterNeededLiters}L:</span>
            <span className="font-mono text-base font-black text-emerald-300 block">
              {campdenInfo.tabletFraction}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              ({campdenInfo.gramsNeeded}g de Metabissulfito)
            </span>
          </div>

          <p className="text-[10px] text-stone-400 leading-tight">
            🛡️ Neutraliza cloro e cloraminas da Sanepar em 15 segundos, eliminando o risco de <strong>clorofenol (esparadrapo)</strong>.
          </p>
        </div>

        {/* Mechanism 2: Mash pH & Residual Alkalinity */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-cyan-400" /> pH Previsto da Mostura
            </span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded">
              Kolbach RA
            </span>
          </div>

          <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-black text-cyan-300">
                {mashPhAnalysis.estimatedPh}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  mashPhAnalysis.status === 'optimal'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {mashPhAnalysis.status === 'optimal' ? 'Ótimo' : 'Ajustar'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Alcalinidade Residual: <span className="font-mono text-stone-300">{raValue} ppm CaCO3</span>
            </span>
          </div>

          <p className="text-[10px] text-stone-400 leading-tight line-clamp-2" title={mashPhAnalysis.notes}>
            {mashPhAnalysis.notes}
          </p>
        </div>

        {/* Mechanism 3: Minimum Calcium Threshold */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Dureza de Cálcio Mínima
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                !isCalciumLow
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                  : 'bg-amber-950 text-amber-300 border-amber-800/60'
              }`}
            >
              Min 50 ppm
            </span>
          </div>

          <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 text-center">
            <span className="text-[11px] text-stone-400 block">Cálcio Final ({calculatedWater.ca} ppm):</span>
            <span
              className={`font-mono text-base font-black ${
                !isCalciumLow ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {!isCalciumLow ? '✓ Suficiente (&ge; 50 ppm)' : '⚠️ Abaixo do Recomendado'}
            </span>
          </div>

          <p className="text-[10px] text-stone-400 leading-tight">
            {isCalciumLow
              ? 'Água de Curitiba tem pouco Ca. Adicione CaCl2 ou Gypsum para proteger a alfa-amilase e melhorar a clarificação.'
              : 'Nível ótimo de cálcio garantindo atividade enzimática perfeita e floculação de levedura.'}
          </p>
        </div>
      </div>

      {/* Sulfate to Chloride Dynamic Balance Bar */}
      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Relação Sulfato / Cloreto (SO₄²⁻ : Cl⁻)
            </span>
            <span className="font-mono font-black text-sm text-cyan-300 bg-stone-900 px-2.5 py-0.5 rounded-lg border border-stone-800">
              {calculatedWater.sulfateToChlorideRatio} : 1
            </span>
          </div>
          <span className={`text-xs font-bold ${ratioColor}`}>{ratioText}</span>
        </div>

        {/* Visual Balance Slider */}
        <div className="relative w-full h-3.5 bg-gradient-to-r from-purple-900/60 via-stone-800 to-emerald-900/60 rounded-full overflow-hidden border border-stone-700">
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300 -translate-x-1/2"
            style={{
              left: `${Math.min(Math.max((calculatedWater.sulfateToChlorideRatio / 3.5) * 100, 5), 95)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-stone-500">
          <span>0.3 (Juicy / Cloreto)</span>
          <span>1.0 (Equilibrado)</span>
          <span>3.0+ (Amargo / Sulfato)</span>
        </div>
      </div>

      {/* Grid of 6 Main Brewing Ions */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Perfil Mineral Comparativo (Água Base → Final → Alvo)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {renderIonCard('Cálcio', 'Ca²⁺', baseWaterSource.calcium, calculatedWater.ca, waterTarget.calcium)}
          {renderIonCard('Magnésio', 'Mg²⁺', baseWaterSource.magnesium, calculatedWater.mg, waterTarget.magnesium)}
          {renderIonCard('Sódio', 'Na⁺', baseWaterSource.sodium, calculatedWater.na, waterTarget.sodium)}
          {renderIonCard('Cloreto', 'Cl⁻', baseWaterSource.chloride, calculatedWater.cl, waterTarget.chloride)}
          {renderIonCard('Sulfato', 'SO₄²⁻', baseWaterSource.sulfate, calculatedWater.so4, waterTarget.sulfate)}
          {renderIonCard('Bicarbonato', 'HCO₃⁻', baseWaterSource.bicarbonate, calculatedWater.hco3, waterTarget.bicarbonate)}
        </div>
      </div>

      {/* Mineral Salts Sliders & Inputs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Dosador de Sais Minerais & Ajuste de Mostura
          </h4>
          <span className="text-[11px] text-stone-500 font-mono">
            Valores para {totalWaterNeededLiters} Litros
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Gypsum */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-stone-200">Gipsita / Sulfato de Cálcio</span>
              <span className="font-mono text-[10px] text-stone-500">CaSO₄</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={waterSalts.gypsumGrams}
                onChange={(e) => handleSaltUpdate('gypsumGrams', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-cyan-300 font-bold text-center py-1 rounded">
                {waterSalts.gypsumGrams}g
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.gypsumGrams / totalWaterNeededLiters).toFixed(2)} g/L
                </span>
              </div>
            </div>
          </div>

          {/* Calcium Chloride */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-stone-200">Cloreto de Cálcio</span>
              <span className="font-mono text-[10px] text-stone-500">CaCl₂</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={waterSalts.calciumChlorideGrams}
                onChange={(e) => handleSaltUpdate('calciumChlorideGrams', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-cyan-300 font-bold text-center py-1 rounded">
                {waterSalts.calciumChlorideGrams}g
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.calciumChlorideGrams / totalWaterNeededLiters).toFixed(2)} g/L
                </span>
              </div>
            </div>
          </div>

          {/* Epsom Salt */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-stone-200">Sal de Epsom</span>
              <span className="font-mono text-[10px] text-stone-500">MgSO₄</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={waterSalts.epsomSaltGrams}
                onChange={(e) => handleSaltUpdate('epsomSaltGrams', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-cyan-300 font-bold text-center py-1 rounded">
                {waterSalts.epsomSaltGrams}g
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.epsomSaltGrams / totalWaterNeededLiters).toFixed(2)} g/L
                </span>
              </div>
            </div>
          </div>

          {/* Table Salt */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-stone-200">Sal Não Iodado (NaCl)</span>
              <span className="font-mono text-[10px] text-stone-500">Cloreto de Sódio</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={waterSalts.tableSaltGrams}
                onChange={(e) => handleSaltUpdate('tableSaltGrams', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-cyan-300 font-bold text-center py-1 rounded">
                {waterSalts.tableSaltGrams}g
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.tableSaltGrams / totalWaterNeededLiters).toFixed(2)} g/L
                </span>
              </div>
            </div>
          </div>

          {/* Baking Soda */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-stone-200">Bicarbonato de Sódio</span>
              <span className="font-mono text-[10px] text-stone-500">NaHCO₃</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={waterSalts.bakingSodaGrams}
                onChange={(e) => handleSaltUpdate('bakingSodaGrams', parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-cyan-300 font-bold text-center py-1 rounded">
                {waterSalts.bakingSodaGrams}g
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.bakingSodaGrams / totalWaterNeededLiters).toFixed(2)} g/L
                </span>
              </div>
            </div>
          </div>

          {/* Lactic Acid 88% */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl hover:border-stone-700 transition-colors">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-amber-200">Ácido Lático 88% (pH da Mostura)</span>
              <span className="font-mono text-[10px] text-amber-400">pH 5.2 - 5.4</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.2"
                value={waterSalts.lacticAcid88Ml}
                onChange={(e) => handleSaltUpdate('lacticAcid88Ml', parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <div className="w-20 bg-stone-900 border border-stone-700 font-mono text-xs text-amber-300 font-bold text-center py-1 rounded">
                {waterSalts.lacticAcid88Ml} mL
                <span className="block text-[9px] font-normal text-stone-500">
                  {(waterSalts.lacticAcid88Ml / totalWaterNeededLiters).toFixed(2)} mL/L
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
