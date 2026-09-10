import React from 'react';
import { MashStep, RecipeCalculations } from '../types/brewing';
import {
  Flame,
  Plus,
  Trash2,
  Gauge,
  Info,
  ArrowRight,
  Sparkles,
  Zap,
  Droplets,
  Activity,
  Layers,
  Thermometer,
} from 'lucide-react';
import {
  getEffectiveSaccharificationTemp,
  getMashFermentabilityProfile,
} from '../utils/brewingCalculations';
import { triggerWaterWave } from '../utils/dopamineEffects';

interface MashStrikeCalculatorProps {
  mashSchedule: MashStep[];
  onScheduleChange: (newSchedule: MashStep[]) => void;
  strikeWaterVolumeLiters: number;
  strikeWaterTempCelsius: number;
  spargeWaterVolumeLiters: number;
  preBoilVolumeLiters: number;
  totalGrainKg: number;
  batchSizeLiters: number;
  calculations?: RecipeCalculations;
}

export const MashStrikeCalculator: React.FC<MashStrikeCalculatorProps> = ({
  mashSchedule = [],
  onScheduleChange,
  strikeWaterVolumeLiters,
  strikeWaterTempCelsius,
  spargeWaterVolumeLiters,
  preBoilVolumeLiters,
  totalGrainKg,
  batchSizeLiters,
  calculations,
}) => {
  const safeSchedule = mashSchedule || [];
  const currentSaccTemp = getEffectiveSaccharificationTemp(safeSchedule);
  const fermentability = getMashFermentabilityProfile(currentSaccTemp);

  const handleAddStep = () => {
    const newStep: MashStep = {
      id: `mash-${Date.now()}`,
      name: 'Nova Rampa de Mostura',
      tempCelsius: 68,
      durationMinutes: 30,
      type: 'Temperature',
      description: 'Conversão enzimática complementar',
    };
    onScheduleChange([...safeSchedule, newStep]);
    triggerWaterWave(0.4, 0.3);
  };

  const handleUpdateStep = (id: string, field: keyof MashStep, value: any) => {
    const updated = safeSchedule.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    onScheduleChange(updated);
  };

  const handleRemoveStep = (id: string) => {
    onScheduleChange(safeSchedule.filter((s) => s.id !== id));
  };

  const handleQuickPreset = (targetTemp: number, name: string) => {
    // Find first saccharification or infusion step, or update first step
    if (safeSchedule.length === 0) {
      onScheduleChange([
        {
          id: `mash-${Date.now()}`,
          name,
          tempCelsius: targetTemp,
          durationMinutes: 60,
          type: 'Infusion',
          description: `Sacarificação ajustada para ${targetTemp}°C`,
        },
      ]);
      return;
    }

    const saccIndex = safeSchedule.findIndex((s) => {
      const lower = (s.name || '').toLowerCase();
      return (
        lower.includes('sacari') ||
        lower.includes('mostura') ||
        lower.includes('beta') ||
        lower.includes('alfa') ||
        (s.tempCelsius >= 60 && s.tempCelsius <= 73)
      );
    });

    const targetIndex = saccIndex >= 0 ? saccIndex : 0;
    const updated = [...safeSchedule];
    updated[targetIndex] = {
      ...updated[targetIndex],
      tempCelsius: targetTemp,
      description: `Rampa calibrada a ${targetTemp}°C (${name})`,
    };

    onScheduleChange(updated);
    triggerWaterWave(0.6, 0.4);
  };

  return (
    <div
      id="mash-strike-calculator-panel"
      className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden workbench-bezel"
    >
      {/* Corner Rivets */}
      <span className="rivet-screw top-2.5 left-2.5" />
      <span className="rivet-screw top-2.5 right-2.5" />
      <span className="rivet-screw bottom-2.5 left-2.5" />
      <span className="rivet-screw bottom-2.5 right-2.5" />

      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide font-serif">
                Arquitetura de Mostura, Sacarificação & Volumes de Água
              </h3>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/30 font-extrabold hidden sm:inline-block">
                Interligado ao SG/FG
              </span>
            </div>
            <p className="text-xs text-stone-400">
              A temperatura de sacarificação comanda dinamicamente a quebra enzimática, a atenuação da levedura, a FG e o ABV.
            </p>
          </div>
        </div>

        {/* Quick Presets for Saccharification */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 mr-1 hidden md:inline">
            Presets Rápidos:
          </span>
          <button
            type="button"
            id="preset-mash-dry"
            onClick={() => handleQuickPreset(64, 'Sacarificação Seca (Beta)')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              currentSaccTemp <= 65
                ? 'bg-blue-500/20 text-blue-300 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="64°C: Atividade máxima de Beta-Amilase (cerveja seca, alta atenuação, menor FG, mais álcool)"
          >
            ⚡ Seca (64°C)
          </button>
          <button
            type="button"
            id="preset-mash-balanced"
            onClick={() => handleQuickPreset(66.5, 'Sacarificação Equilibrada')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              currentSaccTemp > 65 && currentSaccTemp < 68
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="66.5°C: Equilíbrio clássico entre fermentabilidade e corpo aveludado"
          >
            ⚖️ Equilibrada (66.5°C)
          </button>
          <button
            type="button"
            id="preset-mash-full"
            onClick={() => handleQuickPreset(69, 'Sacarificação Encorpada (Alfa)')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              currentSaccTemp >= 68
                ? 'bg-orange-500/20 text-orange-300 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="69°C: Alfa-Amilase dominante (maior retenção de dextrinas, FG alta, sensação encorpada)"
          >
            🍯 Encorpada (69°C)
          </button>
        </div>
      </div>

      {/* Real-time Biological Enzymatic & SG Bridge HUD */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950/20 to-stone-950 border border-amber-500/30 rounded-2xl p-3.5 md:p-4 mb-4 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Diagnóstico Enzimático da Sacarificação ({currentSaccTemp.toFixed(1)}°C)
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 border border-stone-700 text-stone-300">
            {fermentability.title}
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-3">
          {fermentability.description}
        </p>

        {/* Live Interconnected Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-mono text-stone-400 block">SG Pré-Fervura</span>
            <span className="font-mono text-sm font-black text-amber-400">
              {calculations?.preBoilGravity?.toFixed(3) || '1.045'}
            </span>
          </div>

          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-mono text-stone-400 block">OG Projetada</span>
            <span className="font-mono text-sm font-black text-amber-300">
              {calculations?.og?.toFixed(3) || '1.054'}
            </span>
          </div>

          <div className="bg-stone-900/90 p-2 rounded-xl border border-orange-500/40 bg-orange-950/20">
            <span className="text-[9px] uppercase font-mono text-orange-400 block">FG Pós-Mostura</span>
            <span className="font-mono text-sm font-black text-orange-300">
              {calculations?.fg?.toFixed(3) || '1.012'}
            </span>
          </div>

          <div className="bg-stone-900/90 p-2 rounded-xl border border-purple-500/40 bg-purple-950/20">
            <span className="text-[9px] uppercase font-mono text-purple-400 block">Atenuação Real</span>
            <span className="font-mono text-sm font-black text-purple-300">
              {calculations?.apparentAttenuationPercent?.toFixed(1) || '75.0'}%
            </span>
          </div>

          <div className="bg-stone-900/90 p-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
            <span className="text-[9px] uppercase font-mono text-emerald-400 block">ABV Resultante</span>
            <span className="font-mono text-sm font-black text-emerald-300">
              {calculations?.abv?.toFixed(1) || '5.5'}%
            </span>
          </div>

          <div className="bg-stone-900/90 p-2 rounded-xl border border-cyan-500/40 bg-cyan-950/20">
            <span className="text-[9px] uppercase font-mono text-cyan-400 block">Água Total</span>
            <span className="font-mono text-sm font-black text-cyan-300">
              {calculations?.totalWaterNeededLiters || (strikeWaterVolumeLiters + spargeWaterVolumeLiters).toFixed(1)} L
            </span>
          </div>
        </div>
      </div>

      {/* Thermodynamic Volume & Strike Temperature HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Água de Mostura (Strike)
            </span>
            <Droplets className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="font-mono text-xl font-black text-amber-300">
            {strikeWaterVolumeLiters} <span className="text-xs text-stone-400 font-normal">Litros</span>
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">Relação 3.0 L/kg ({totalGrainKg}kg de malte)</span>
        </div>

        <div className="bg-stone-950 p-3 rounded-2xl border border-orange-500/40 bg-orange-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-orange-400 block">
              Temp. Água de Arreamento
            </span>
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <span className="font-mono text-xl font-black text-orange-400">
            {strikeWaterTempCelsius}°C
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">
            Garante {currentSaccTemp.toFixed(1)}°C com malte a 20°C
          </span>
        </div>

        <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Água de Lavagem (Sparge)
            </span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-mono text-xl font-black text-cyan-300">
            {spargeWaterVolumeLiters} <span className="text-xs text-stone-400 font-normal">Litros</span>
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">Aquecer a 76°C - 78°C</span>
        </div>

        <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Volume Pré-Fervura
            </span>
            <Flame className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <span className="font-mono text-xl font-black text-stone-200">
            {preBoilVolumeLiters} <span className="text-xs text-stone-400 font-normal">Litros</span>
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">Lote final: {batchSizeLiters} Litros</span>
        </div>
      </div>

      {/* Mash Schedule Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Rampas Térmicas & Sacarificação Passo a Passo
            </h4>
          </div>
          <button
            type="button"
            id="btn-add-mash-step"
            onClick={handleAddStep}
            className="text-xs bg-orange-600 hover:bg-orange-500 text-stone-950 font-black px-3 py-1.5 rounded-xl border border-orange-400 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(249,115,22,0.3)] cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-stone-950" /> Adicionar Rampa
          </button>
        </div>

        <div className="space-y-2.5">
          {safeSchedule.map((step, idx) => (
            <div
              key={step.id}
              className="bg-stone-950/90 border border-stone-800/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-500/40 transition-all shadow-md"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                <span className="w-7 h-7 rounded-xl bg-orange-950/80 text-orange-400 border border-orange-800/60 font-mono text-xs flex items-center justify-center font-black shrink-0">
                  {idx + 1}
                </span>
                <div className="w-full">
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => handleUpdateStep(step.id, 'name', e.target.value)}
                    className="bg-transparent text-sm font-semibold text-stone-100 focus:bg-stone-900 px-2 py-0.5 rounded-lg focus:outline-none w-full border border-transparent focus:border-stone-700"
                    placeholder="Nome da etapa..."
                  />
                  <input
                    type="text"
                    value={step.description || ''}
                    onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                    className="bg-transparent text-xs text-stone-400 focus:bg-stone-900 px-2 py-0.5 rounded-lg focus:outline-none w-full border border-transparent focus:border-stone-800"
                    placeholder="Objetivo enzimático ou instruções..."
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 border-t border-stone-800/60 sm:border-0 sm:pt-0 w-full sm:w-auto">
                {/* Step Type */}
                <select
                  value={step.type}
                  onChange={(e) => handleUpdateStep(step.id, 'type', e.target.value as MashStep['type'])}
                  className="bg-stone-900 text-stone-300 text-xs px-2.5 py-1.5 rounded-xl border border-stone-800 focus:outline-none font-medium"
                >
                  <option value="Infusion">Infusão Simples</option>
                  <option value="Temperature">Rampa de Aquecimento</option>
                  <option value="Decoction">Decocção Nobre</option>
                  <option value="Mash Out">Mash Out (Inativação)</option>
                </select>

                {/* Temperature */}
                <div className="flex items-center gap-1 bg-stone-900 px-2.5 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-orange-400">
                  <input
                    type="number"
                    step="0.5"
                    min="35"
                    max="85"
                    value={step.tempCelsius}
                    onChange={(e) => handleUpdateStep(step.id, 'tempCelsius', parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-right font-bold focus:outline-none"
                  />
                  <span className="font-bold">°C</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 bg-stone-900 px-2.5 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-amber-300">
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="180"
                    value={step.durationMinutes}
                    onChange={(e) => handleUpdateStep(step.id, 'durationMinutes', parseFloat(e.target.value) || 5)}
                    className="w-10 bg-transparent text-right font-bold focus:outline-none"
                  />
                  <span className="font-bold">min</span>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-stone-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/30 transition-colors"
                  title="Remover rampa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
