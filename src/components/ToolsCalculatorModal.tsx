import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  brixToFinalGravity,
  calculatePrimingSugar,
  calculateABV,
  calculateYeastPitch,
  calculateYeastSlurry,
} from '../utils/brewingCalculations';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { Calculator, Sparkles, Droplet, Flame, Gauge, X, Dna, Info, FlaskConical, Recycle, RefreshCw } from 'lucide-react';
import { triggerWaterWave } from '../utils/dopamineEffects';

interface ToolsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast';
  recipe?: BeerRecipe;
  calculations?: RecipeCalculations;
}

export const ToolsCalculatorModal: React.FC<ToolsCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'yeast',
  recipe,
  calculations,
}) => {
  const [activeTab, setActiveTab] = useState<'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast'>(initialTab);

  // Priming state
  const [primingVolLiters, setPrimingVolLiters] = useState('20');
  const [targetCO2, setTargetCO2] = useState('2.4');
  const [beerTemp, setBeerTemp] = useState('20');
  const [sugarType, setSugarType] = useState<'cane' | 'corn' | 'dme'>('cane');

  // Refractometer state
  const [origBrix, setOrigBrix] = useState('14.5');
  const [finalBrix, setFinalBrix] = useState('6.5');
  const [wortFactor, setWortFactor] = useState('1.04');

  // Hydrometer temp correction
  const [hydrometerReading, setHydrometerReading] = useState('1.050');
  const [measuredTemp, setMeasuredTemp] = useState('35');
  const [calibratedTemp, setCalibratedTemp] = useState('20');

  // Dilution state
  const [currentVol, setCurrentVol] = useState('20');
  const [currentSG, setCurrentSG] = useState('1.065');
  const [targetSG, setTargetSG] = useState('1.050');

  // Yeast Pitch Rate & Slurry state
  const [yeastBatchVol, setYeastBatchVol] = useState('20');
  const [yeastOG, setYeastOG] = useState('1.050');
  const [yeastPitchRate, setYeastPitchRate] = useState('0.75');
  const [yeastPacketCells, setYeastPacketCells] = useState('115');
  const [yeastSourceType, setYeastSourceType] = useState<'packets' | 'slurry'>('packets');
  const [slurryConcentration, setSlurryConcentration] = useState('1.5');
  const [slurryAgeWeeks, setSlurryAgeWeeks] = useState('1');
  const [slurryTrubPercent, setSlurryTrubPercent] = useState('15');

  const syncWithActiveRecipe = () => {
    if (!recipe) return;
    const vol = String(recipe.batchSizeLiters || 20);
    const ogStr = String(calculations?.og?.toFixed(3) || '1.050');
    const carb = String(
      recipe.style?.carbMin && recipe.style?.carbMax
        ? ((recipe.style.carbMin + recipe.style.carbMax) / 2).toFixed(1)
        : '2.4'
    );

    setPrimingVolLiters(vol);
    setTargetCO2(carb);
    setYeastBatchVol(vol);
    setYeastOG(ogStr);
    setHydrometerReading(ogStr);
    setCurrentVol(vol);
    setCurrentSG(String(calculations?.preBoilGravity?.toFixed(3) || '1.055'));
    setTargetSG(ogStr);

    if (recipe.yeast?.type === 'Lager') {
      setYeastPitchRate('1.25');
    } else if (recipe.yeast?.name?.toLowerCase().includes('kveik')) {
      setYeastPitchRate('0.35');
    } else {
      setYeastPitchRate('0.75');
    }
  };

  // Sync activeTab and active recipe when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      syncWithActiveRecipe();
    }
  }, [isOpen, initialTab, recipe?.id, calculations?.og]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Priming calculation
  const primingGrams = calculatePrimingSugar(
    parseFloat(primingVolLiters) || 20,
    parseFloat(targetCO2) || 2.4,
    parseFloat(beerTemp) || 20,
    sugarType
  );

  // Refractometer calculation
  const calculatedRefractometerFG = brixToFinalGravity(
    parseFloat(origBrix) || 15,
    parseFloat(finalBrix) || 7,
    parseFloat(wortFactor) || 1.04
  );

  const origSGFromBrix = Number((1 + ((parseFloat(origBrix) || 15) / (258.6 - ((parseFloat(origBrix) || 15) / 258.2) * 227.1))).toFixed(3));
  const calculatedRefractometerABV = calculateABV(origSGFromBrix, calculatedRefractometerFG);

  // Hydrometer Temp Correction formula
  const tM = (parseFloat(measuredTemp) || 20) * 1.8 + 32;
  const tC = (parseFloat(calibratedTemp) || 20) * 1.8 + 32;
  const rawSG = parseFloat(hydrometerReading) || 1.050;
  const num = 1.00130346 - 0.000134722124 * tM + 0.00000204052596 * Math.pow(tM, 2) - 0.00000000232820948 * Math.pow(tM, 3);
  const den = 1.00130346 - 0.000134722124 * tC + 0.00000204052596 * Math.pow(tC, 2) - 0.00000000232820948 * Math.pow(tC, 3);
  const correctedSG = Number((rawSG * (num / den)).toFixed(3));

  // Dilution water needed: V_target = V_current * (Points_current / Points_target)
  const pCurrent = ((parseFloat(currentSG) || 1.050) - 1) * 1000;
  const pTarget = ((parseFloat(targetSG) || 1.040) - 1) * 1000;
  const targetTotalVol = pTarget > 0 ? (parseFloat(currentVol) || 20) * (pCurrent / pTarget) : 20;
  const waterToAdd = Math.max(targetTotalVol - (parseFloat(currentVol) || 20), 0);

  // Yeast Pitch Rate & Slurry calculation
  const yeastPitchCalc = calculateYeastPitch(
    parseFloat(yeastBatchVol) || 20,
    parseFloat(yeastOG) || 1.050,
    parseFloat(yeastPitchRate) || 0.75,
    parseFloat(yeastPacketCells) || 115
  );

  const slurryCalc = calculateYeastSlurry(
    yeastPitchCalc.totalCellsBillion,
    parseFloat(slurryConcentration) || 1.5,
    parseFloat(slurryAgeWeeks) || 1,
    undefined,
    parseFloat(slurryTrubPercent) || 15
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Isolated backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-stone-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto h-[90vh] sm:h-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Ferramentas Rápidas de Cálculo Cervejeiro
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400">Precisão matemática para o mestre artesanal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recipe && (
              <button
                type="button"
                onClick={() => {
                  syncWithActiveRecipe();
                  triggerWaterWave(0.4, 0.4);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 rounded-xl transition-all cursor-pointer text-xs font-mono font-bold"
                title="Sincronizar com os dados da receita ativa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar Receita</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
              title="Fechar (Esc)"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4 text-amber-400" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons with horizontal touch scrolling */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 p-1.5 sm:p-2 gap-1.5 text-xs overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('priming')}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              activeTab === 'priming' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Açúcar Priming (Envase)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refractometer')}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              activeTab === 'refractometer' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Refratômetro c/ Álcool
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hydrometer')}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              activeTab === 'hydrometer' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Correção Temp. Densímetro
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dilution')}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              activeTab === 'dilution' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Diluição de Mosto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yeast')}
            className={`py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              activeTab === 'yeast' ? 'bg-purple-500 text-stone-950' : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            Células de Levedura (Inóculo)
          </button>
        </div>

        {/* Tab Content with smooth scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'priming' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Volume de Cerveja a Envazar (L)</label>
                  <input
                    type="number"
                    value={primingVolLiters}
                    onChange={(e) => setPrimingVolLiters(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Volume Alvo de CO2 (Vol)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetCO2}
                    onChange={(e) => setTargetCO2(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Temperatura Máxima da Fermentação (°C)</label>
                  <input
                    type="number"
                    value={beerTemp}
                    onChange={(e) => setBeerTemp(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Tipo de Açúcar</label>
                  <select
                    value={sugarType}
                    onChange={(e: any) => setSugarType(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="cane">Açúcar Cristal / Refinado (Sacarose)</option>
                    <option value="corn">Açúcar de Milho (Dextrose)</option>
                    <option value="dme">Extrato Seco de Malte (DME)</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-950/40 via-stone-950 to-amber-950/40 border border-amber-500/40 p-4 rounded-2xl text-center shadow-inner">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Açúcar Total Necessário
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300 my-1">
                  {primingGrams.toFixed(1)} <span className="text-base font-normal text-stone-400">gramas</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  Taxa média: {(primingGrams / (parseFloat(primingVolLiters) || 20)).toFixed(2)} g / Litro
                </span>
              </div>
            </div>
          )}

          {activeTab === 'refractometer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Brix Inicial (OG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={origBrix}
                    onChange={(e) => setOrigBrix(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Brix Final Lido</label>
                  <input
                    type="number"
                    step="0.1"
                    value={finalBrix}
                    onChange={(e) => setFinalBrix(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Fator de Correção (WCF)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={wortFactor}
                    onChange={(e) => setWortFactor(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    FG Corrigida Real
                  </span>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 my-1">
                    {calculatedRefractometerFG.toFixed(3)}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">Gravidade Final Real</span>
                </div>
                <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Teor Alcoólico (ABV)
                  </span>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 my-1">
                    {calculatedRefractometerABV.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">Álcool por Volume</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hydrometer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Densidade Lida (SG)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={hydrometerReading}
                    onChange={(e) => setHydrometerReading(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Temp. Medida (°C)</label>
                  <input
                    type="number"
                    value={measuredTemp}
                    onChange={(e) => setMeasuredTemp(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Temp. Calibração (°C)</label>
                  <input
                    type="number"
                    value={calibratedTemp}
                    onChange={(e) => setCalibratedTemp(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Densidade Corrigida a 20°C
                </span>
                <div className="font-mono text-3xl font-black text-amber-400 my-1">
                  {correctedSG.toFixed(3)}
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  Diferença: {((correctedSG - rawSG) * 1000).toFixed(1)} pontos de gravidade
                </span>
              </div>
            </div>
          )}

          {activeTab === 'dilution' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Volume Atual (L)</label>
                  <input
                    type="number"
                    value={currentVol}
                    onChange={(e) => setCurrentVol(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Densidade Atual (SG)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={currentSG}
                    onChange={(e) => setCurrentSG(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Densidade Alvo (SG)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={targetSG}
                    onChange={(e) => setTargetSG(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Água Filtrada/Fervida a Adicionar
                </span>
                <div className="font-mono text-3xl font-black text-cyan-400 my-1">
                  {waterToAdd.toFixed(2)} <span className="text-sm font-normal text-stone-400">Litros</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  Volume Final Estimado: {targetTotalVol.toFixed(1)} L
                </span>
              </div>
            </div>
          )}

          {activeTab === 'yeast' && (
            <div className="space-y-4">
              {/* Source Toggle Mode */}
              <div className="flex items-center justify-between bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setYeastSourceType('packets')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    yeastSourceType === 'packets'
                      ? 'bg-purple-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Sachês de Fermento (Seco / Líquido)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setYeastSourceType('slurry')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    yeastSourceType === 'slurry'
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Recycle className="w-4 h-4" />
                  <span>Lama Reaproveitada (Harvested Slurry)</span>
                </button>
              </div>

              {/* Shared Batch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Volume do Mosto (Litros)</label>
                  <input
                    type="number"
                    value={yeastBatchVol}
                    onChange={(e) => setYeastBatchVol(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Densidade Inicial (OG)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={yeastOG}
                    onChange={(e) => setYeastOG(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Taxa de Inoculação (Pitch Rate)</label>
                  <select
                    value={yeastPitchRate}
                    onChange={(e) => setYeastPitchRate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-purple-300 font-bold text-xs sm:text-sm focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="0.35">0.35 M cel/mL/°P - Kveik / Underpitching</option>
                    <option value="0.50">0.50 M cel/mL/°P - Session Beer</option>
                    <option value="0.75">0.75 M cel/mL/°P - Ale Padrão (Recomendado)</option>
                    <option value="1.00">1.00 M cel/mL/°P - High Gravity Ale</option>
                    <option value="1.25">1.25 M cel/mL/°P - Lager Padrão</option>
                    <option value="1.50">1.50 M cel/mL/°P - Lager Fria</option>
                  </select>
                </div>
              </div>

              {/* Packets Mode Options */}
              {yeastSourceType === 'packets' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">Carga Celular por Sachê/Pacote</label>
                    <select
                      value={yeastPacketCells}
                      onChange={(e) => setYeastPacketCells(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-amber-300 font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="115">115 Bi de células (Sachê Seco 11.5g Padrão)</option>
                      <option value="200">200 Bi de células (Sachê Seco Alta Carga / Imperial)</option>
                      <option value="100">100 Bi de células (Frasco / Tubete Líquido Padrão)</option>
                    </select>
                  </div>

                  {/* Output Results Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-stone-950 border border-purple-900/60 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                        Células Necessárias
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-purple-300 my-1">
                        {yeastPitchCalc.totalCellsBillion}{' '}
                        <span className="text-xs font-normal text-stone-400">Bi</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Gravidade: {yeastPitchCalc.plato} °Plato
                      </span>
                    </div>

                    <div className="bg-stone-950 border border-amber-900/60 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                        Sachês Necessários
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 my-1">
                        {yeastPitchCalc.packetsNeeded}{' '}
                        <span className="text-xs font-normal text-stone-400">sachê(s)</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ~{Math.ceil(yeastPitchCalc.packetsNeeded)} pacote(s) fechado(s)
                      </span>
                    </div>

                    <div className="bg-stone-950 border border-emerald-900/60 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                        Peso em Levedura Seca
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 my-1">
                        {yeastPitchCalc.dryYeastGramsNeeded}{' '}
                        <span className="text-xs font-normal text-stone-400">g</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        (~10 bi cel/g de fermento seco)
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Box */}
                  <div className="bg-purple-950/30 border border-purple-500/40 p-3.5 rounded-2xl text-xs text-purple-200 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block text-purple-300">Recomendação do Mestre Cervejeiro:</span>
                      <p className="text-stone-300 leading-relaxed">{yeastPitchCalc.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Slurry Mode Options */}
              {yeastSourceType === 'slurry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">Concentração da Lama</label>
                      <select
                        value={slurryConcentration}
                        onChange={(e) => setSlurryConcentration(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="1.0">1.0 Bi/mL - Lama líquida / bruta</option>
                        <option value="1.5">1.5 Bi/mL - Lama decantada no frasco (Padrão)</option>
                        <option value="2.5">2.5 Bi/mL - Lama lavada e compacta</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-400 block mb-1">Tempo Guardada na Geladeira</label>
                      <select
                        value={slurryAgeWeeks}
                        onChange={(e) => setSlurryAgeWeeks(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        <option value="1">1 semana (~90% viabilidade)</option>
                        <option value="2">2 semanas (~80% viabilidade)</option>
                        <option value="3">3 semanas (~65% viabilidade)</option>
                        <option value="4">4 semanas (~50% viabilidade)</option>
                        <option value="5">Mais de 4 semanas (~35% viabilidade)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-400 block mb-1">% Resíduos (Trub / Lúpulo)</label>
                      <select
                        value={slurryTrubPercent}
                        onChange={(e) => setSlurryTrubPercent(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-stone-300 font-bold text-xs focus:outline-none focus:border-stone-400 cursor-pointer"
                      >
                        <option value="10">10% - Lama bastante limpa/lavada</option>
                        <option value="15">15% - Média normal do cone</option>
                        <option value="25">25% - Muito trub/resíduo de hop</option>
                      </select>
                    </div>
                  </div>

                  {/* Slurry Results Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-stone-950 border border-amber-500/50 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                        Volume de Lama Necessário
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 my-1">
                        {slurryCalc.slurryMlNeeded}{' '}
                        <span className="text-xs font-normal text-stone-400">mL</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ({(slurryCalc.slurryMlNeeded / 1000).toFixed(2)} Litro / ~{slurryCalc.slurryCupsNeeded} xícaras)
                      </span>
                    </div>

                    <div className="bg-stone-950 border border-emerald-900/60 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                        Peso Aproximado da Lama
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-300 my-1">
                        {slurryCalc.slurryGramsNeeded}{' '}
                        <span className="text-xs font-normal text-stone-400">g</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Densidade aprox: ~1.1 g/mL
                      </span>
                    </div>

                    <div className="bg-stone-950 border border-purple-900/60 p-3.5 rounded-2xl text-center shadow-inner">
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                        Viabilidade Celular
                      </span>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-purple-300 my-1">
                        {slurryCalc.viabilityPercent}%
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">
                        ~{slurryCalc.effectiveCellsPerMl} Bi cel/mL viáveis
                      </span>
                    </div>
                  </div>

                  {/* Slurry Guidance Box */}
                  <div className="bg-amber-950/30 border border-amber-500/40 p-3.5 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                    <Recycle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block text-amber-300">Dica de Reaproveitamento de Lama:</span>
                      <p className="text-stone-300 leading-relaxed">{slurryCalc.slurryQualityNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 p-3 sm:p-4 border-t border-stone-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 text-xs sm:text-sm flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Fechar Calculadoras</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ToolsCalculatorModal;
