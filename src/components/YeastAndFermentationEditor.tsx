import React, { useState, useEffect } from 'react';
import { FermentationStage, RecipeCalculations, YeastProfile } from '../types/brewing';
import { YEAST_DATABASE, MiscIngredientItem } from '../data/ingredients';
import { YeastExplorerModal } from './YeastExplorerModal';
import { AdjunctExplorerModal } from './AdjunctExplorerModal';
import { calculateYeastPitch, calculateYeastSlurry } from '../utils/brewingCalculations';
import {
  Dna,
  Plus,
  Trash2,
  Thermometer,
  Calendar,
  Info,
  RotateCw,
  Sparkles,
  Activity,
  Gauge,
  Search,
  FlaskConical,
  Check,
  Calculator,
  Scale,
  Recycle,
  Zap,
} from 'lucide-react';
import { triggerWaterWave } from '../utils/dopamineEffects';

interface YeastAndFermentationEditorProps {
  yeast: YeastProfile;
  onYeastChange: (newYeast: YeastProfile) => void;
  stages: FermentationStage[];
  onStagesChange: (newStages: FermentationStage[]) => void;
  onAddAdjunctNote?: (note: string) => void;
  batchSizeLiters?: number;
  og?: number;
  calculations?: RecipeCalculations;
  onOpenCalculatorModal?: () => void;
}

export const YeastAndFermentationEditor: React.FC<YeastAndFermentationEditorProps> = ({
  yeast,
  onYeastChange,
  stages,
  onStagesChange,
  onAddAdjunctNote,
  batchSizeLiters = 20,
  og = 1.050,
  calculations,
  onOpenCalculatorModal,
}) => {
  const [selectedYeastId, setSelectedYeastId] = useState(yeast.id);
  const [isYeastFlipped, setIsYeastFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isYeastExplorerOpen, setIsYeastExplorerOpen] = useState(false);
  const [isAdjunctExplorerOpen, setIsAdjunctExplorerOpen] = useState(false);

  // Yeast Pitch Rate State
  const [pitchRateFactor, setPitchRateFactor] = useState<number>(
    yeast.type === 'Lager' ? 1.25 : 0.75
  );
  const [cellsPerPacket, setCellsPerPacket] = useState<number>(115);
  const [yeastSourceType, setYeastSourceType] = useState<'packets' | 'slurry'>('packets');
  const [slurryConcentration, setSlurryConcentration] = useState<number>(1.5);
  const [slurryAgeWeeks, setSlurryAgeWeeks] = useState<number>(1);
  const [slurryTrubPercent, setSlurryTrubPercent] = useState<number>(15);

  // Sync pitch rate when yeast type changes
  useEffect(() => {
    if (yeast?.type === 'Lager') {
      setPitchRateFactor(1.25);
    } else if (yeast?.name?.toLowerCase().includes('kveik')) {
      setPitchRateFactor(0.35);
    }
  }, [yeast?.type, yeast?.name]);

  // Pitch Rate Calculations
  const pitchCalc = calculateYeastPitch(
    batchSizeLiters,
    og,
    pitchRateFactor,
    cellsPerPacket
  );

  // Slurry Calculations
  const slurryCalc = calculateYeastSlurry(
    pitchCalc.totalCellsBillion,
    slurryConcentration,
    slurryAgeWeeks,
    undefined,
    slurryTrubPercent
  );

  // Sync selectedYeastId whenever the recipe yeast prop updates
  useEffect(() => {
    if (yeast) {
      setSelectedYeastId(yeast.id || yeast.name);
    }
  }, [yeast.id, yeast.name]);

  const handleSelectYeast = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const found = YEAST_DATABASE.find((y) => y.id === val || y.name === val);
    if (found) {
      setSelectedYeastId(found.id);
      onYeastChange(found);
      triggerWaterWave(0.5, 0.4);
    }
  };

  const handleSelectYeastFromExplorer = (selected: YeastProfile) => {
    setSelectedYeastId(selected.id);
    onYeastChange(selected);
    triggerWaterWave(0.5, 0.4);
  };

  const handleAddAdjunctFromExplorer = (item: MiscIngredientItem) => {
    const stageName = `Adição: ${item.name} (${item.stage})`;
    const newStage: FermentationStage = {
      name: stageName,
      tempCelsius: item.stage.includes('Cold') ? 2 : 18,
      durationDays: 3,
      description: `Dosagem: ${item.dosageRecommended}. ${item.notes}`,
    };
    onStagesChange([...stages, newStage]);

    if (onAddAdjunctNote) {
      onAddAdjunctNote(`[${item.category}] ${item.name} - ${item.dosageRecommended} no ${item.stage}`);
    }
  };

  const handleAddStage = () => {
    const newStage: FermentationStage = {
      name: 'Nova Rampa Térmica',
      tempCelsius: 20,
      durationDays: 3,
      description: 'Condicionamento ou descanso',
    };
    onStagesChange([...stages, newStage]);
  };

  const handleUpdateStage = (index: number, field: keyof FermentationStage, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    onStagesChange(updated);
  };

  const handleRemoveStage = (index: number) => {
    onStagesChange(stages.filter((_, i) => i !== index));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="relative bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-stone-900/95 border border-stone-800/90 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-md overflow-hidden blueprint-grid workbench-bezel">
      {/* Corner Rivets / Physical Workbench Screws */}
      <span className="rivet-screw top-2.5 left-2.5" />
      <span className="rivet-screw top-2.5 right-2.5" />
      <span className="rivet-screw bottom-2.5 left-2.5" />
      <span className="rivet-screw bottom-2.5 right-2.5" />

      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 text-purple-400 border border-purple-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide font-serif">
                Levedura & Fermentação
              </h3>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-extrabold hidden sm:inline-block">
                Ficha técnica
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Atenuação Média: <span className="text-purple-300 font-mono font-bold">{yeast.attenuationAvg}%</span> • Floculação:{' '}
              <span className="text-stone-200 font-semibold">{yeast.flocculation}</span>
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Yeast Explorer Button */}
          <button
            type="button"
            onClick={() => setIsYeastExplorerOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 cursor-pointer active:scale-95 border border-purple-400/50"
            title="Abrir Catálogo Completo & Busca Avançada de Leveduras Cervejeiras"
          >
            <Search className="w-3.5 h-3.5 text-stone-950" />
            <span>Buscar Leveduras ({YEAST_DATABASE.length})</span>
          </button>

          {/* Adjuncts & Spices Explorer Button */}
          <button
            type="button"
            onClick={() => setIsAdjunctExplorerOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] shrink-0 cursor-pointer active:scale-95 border border-teal-400/50"
            title="Catálogo de Madeiras, Frutas, Especiarias (Amburana, Cumaru, Cacau, Café, Sais)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-stone-950" />
            <span>Frutas, Especiarias & Madeiras</span>
          </button>

          <button
            type="button"
            onClick={() => setIsYeastFlipped(!isYeastFlipped)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
              isYeastFlipped
                ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-700'
            }`}
            title="Girar carta 3D para ver ficha microbiológica"
          >
            <RotateCw className={`w-3.5 h-3.5 text-purple-400 ${isYeastFlipped ? 'rotate-180' : ''} transition-transform`} />
            <span>{isYeastFlipped ? 'Voltar' : 'Ver ficha'}</span>
          </button>
        </div>
      </div>

      {/* 3D Flippable Yeast Selection Card */}
      <div
        className="relative min-h-[140px] mb-5 transition-transform duration-300 perspective-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="w-full transform-style-3d transition-transform duration-500 rounded-2xl"
          style={{
            transform: isYeastFlipped
              ? `rotateY(180deg) rotateX(${tilt.y * 0.4}deg) rotateZ(${tilt.x * 0.2}deg)`
              : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(2px)`,
          }}
        >
          {/* FRONT FACE: Selection & Parameters */}
          <div
            className={`w-full bg-stone-950/90 border border-stone-800/90 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backface-hidden transition-colors ${
              isYeastFlipped ? 'pointer-events-none' : 'hover:border-purple-500/50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-semibold text-stone-400 mb-1.5 flex items-center gap-1.5">
                  <span>Selecionar Levedura do Banco Cervejeiro</span>
                  <span className="text-[10px] text-purple-400/80 font-mono font-normal">(Microbiologia Viva)</span>
                </label>
                <select
                  value={selectedYeastId}
                  onChange={handleSelectYeast}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-inner cursor-pointer"
                >
                  {!YEAST_DATABASE.some((y) => y.id === selectedYeastId || y.id === yeast.id) && (
                    <option value={yeast.id || selectedYeastId}>
                      {yeast.brand ? `${yeast.brand} - ` : ''}{yeast.name} (Cepa Atual)
                    </option>
                  )}
                  {YEAST_DATABASE.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.brand} - {y.name} ({y.type} • {y.attenuationAvg}% atenuação)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 shadow-inner">
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Atenuação Nominal</span>
                  <span className="text-purple-300 font-bold">{yeast.attenuationAvg}%</span>
                </div>

                {calculations && (
                  <div className="bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/40 shadow-inner">
                    <span className="text-purple-300 block text-[9px] uppercase tracking-wider">Atenuação Real (Mostura)</span>
                    <span className="text-purple-200 font-black flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" />
                      {calculations.apparentAttenuationPercent?.toFixed(1)}% → FG: {calculations.fg?.toFixed(3)}
                    </span>
                  </div>
                )}

                <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 shadow-inner">
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Faixa Ótima</span>
                  <span className="text-amber-300 font-bold">
                    {yeast.optimalTempMin}°C - {yeast.optimalTempMax}°C
                  </span>
                </div>
                <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 shadow-inner">
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Tolerância Álcool</span>
                  <span className="text-emerald-300 font-bold">{yeast.alcoholTolerance}% ABV</span>
                </div>
              </div>
            </div>

            {/* Yeast Notes */}
            <div className="text-xs text-stone-300 bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{yeast.notes}</span>
            </div>
          </div>

          {/* BACK FACE: Microbiology Technical Sheet */}
          <div
            className={`absolute inset-0 w-full bg-gradient-to-r from-purple-950/40 via-stone-950 to-stone-900 border border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.9)] backface-hidden rotate-y-180 transition-all ${
              !isYeastFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-400/80 shadow-md flex items-center justify-center text-purple-300">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-300 font-serif">{yeast.brand} {yeast.name}</h4>
                  <p className="text-[10px] font-mono text-stone-400">Classificação: {yeast.type} • Espécie: Saccharomyces</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsYeastFlipped(false)}
                className="bg-purple-500 hover:bg-purple-400 text-stone-950 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2 text-xs font-mono">
              <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Cinética de Atenuação</span>
                <span className="text-emerald-400 font-bold">{yeast.attenuationAvg}% (Rápida)</span>
              </div>
              <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Floculação & Clarificação</span>
                <span className="text-amber-300 font-bold">{yeast.flocculation}</span>
              </div>
              <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Estilo Recomendado</span>
                <span className="text-purple-300 font-bold">IPAs, Ales & Stouts</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-300 italic border-t border-stone-800/80 pt-1.5">
              Células viáveis estimadas: 200 bilhões / sachê. Proporção ideal de inoculação: 0.75M células/ml/°Plato.
            </p>
          </div>
        </div>
      </div>

      {/* Pitch Rate & Cell Requirement Calculator Card */}
      <div className="bg-gradient-to-r from-stone-950 via-purple-950/20 to-stone-950 border border-purple-500/30 rounded-2xl p-4 mb-5 shadow-inner space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>Inóculo de Levedura & Slurry</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {pitchCalc.plato} °Plato
                </span>
              </h4>
              <p className="text-[11px] text-stone-400">
                Lote: <span className="font-mono text-stone-200 font-bold">{batchSizeLiters} Litros</span> • OG: <span className="font-mono text-stone-200 font-bold">{og.toFixed(3)}</span>
              </p>
            </div>
          </div>

          {/* Toggle between Sachês, Lama, and Modal pop-out */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setYeastSourceType('packets')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  yeastSourceType === 'packets'
                    ? 'bg-purple-500 text-stone-950'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Sachês</span>
              </button>
              <button
                type="button"
                onClick={() => setYeastSourceType('slurry')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  yeastSourceType === 'slurry'
                    ? 'bg-amber-500 text-stone-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Recycle className="w-3.5 h-3.5" />
                <span>Lama (Slurry)</span>
              </button>
            </div>

            {onOpenCalculatorModal && (
              <button
                type="button"
                onClick={onOpenCalculatorModal}
                className="bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                title="Abrir Calculadora em Modal isolado"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Modo Modal</span>
              </button>
            )}
          </div>
        </div>

        {/* Pitch Rate Factor Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-stone-400 font-bold uppercase">Pitch Rate:</label>
            <select
              value={pitchRateFactor}
              onChange={(e) => setPitchRateFactor(parseFloat(e.target.value) || 0.75)}
              className="bg-stone-900 border border-stone-700 text-purple-300 font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-purple-400 cursor-pointer text-xs"
            >
              <option value={0.35}>0.35 M cel/mL/°P (Kveik)</option>
              <option value={0.50}>0.50 M cel/mL/°P (Session)</option>
              <option value={0.75}>0.75 M cel/mL/°P (Ale Padrão)</option>
              <option value={1.00}>1.00 M cel/mL/°P (High OG Ale)</option>
              <option value={1.25}>1.25 M cel/mL/°P (Lager Padrão)</option>
              <option value={1.50}>1.50 M cel/mL/°P (Lager Fria)</option>
            </select>
          </div>

          {yeastSourceType === 'packets' && (
            <select
              value={cellsPerPacket}
              onChange={(e) => setCellsPerPacket(parseFloat(e.target.value) || 115)}
              className="bg-stone-900 border border-stone-700 text-amber-300 font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
            >
              <option value={115}>115 Bi / Sachê Seco 11.5g</option>
              <option value={200}>200 Bi / Sachê Imperial</option>
              <option value={100}>100 Bi / Tubete Líquido</option>
            </select>
          )}

          {yeastSourceType === 'slurry' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                value={slurryConcentration}
                onChange={(e) => setSlurryConcentration(parseFloat(e.target.value) || 1.5)}
                className="bg-stone-900 border border-stone-700 text-amber-300 font-bold rounded-xl px-2 py-1 cursor-pointer text-xs"
                title="Concentração da lama"
              >
                <option value={1.0}>1.0 Bi/mL (Lama Líquida)</option>
                <option value={1.5}>1.5 Bi/mL (Lama Decantada)</option>
                <option value={2.5}>2.5 Bi/mL (Lama Lavada)</option>
              </select>

              <select
                value={slurryAgeWeeks}
                onChange={(e) => setSlurryAgeWeeks(parseFloat(e.target.value) || 1)}
                className="bg-stone-900 border border-stone-700 text-emerald-300 font-bold rounded-xl px-2 py-1 cursor-pointer text-xs"
                title="Idade na geladeira"
              >
                <option value={1}>1 sem (~90%)</option>
                <option value={2}>2 sem (~80%)</option>
                <option value={3}>3 sem (~65%)</option>
                <option value={4}>4 sem (~50%)</option>
              </select>
            </div>
          )}
        </div>

        {/* Packets Display */}
        {yeastSourceType === 'packets' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Células Necessárias
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-purple-300 block my-0.5">
                {pitchCalc.totalCellsBillion} Bi
              </span>
              <span className="text-[9px] text-stone-500 font-mono">Bilhōes de Células</span>
            </div>

            <div className="bg-stone-900/90 border border-amber-900/50 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Sachês (11.5g)
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-amber-300 block my-0.5">
                {pitchCalc.packetsNeeded}
              </span>
              <span className="text-[9px] text-amber-400/80 font-mono">
                ~{Math.ceil(pitchCalc.packetsNeeded)} pacote(s)
              </span>
            </div>

            <div className="bg-stone-900/90 border border-emerald-900/50 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Peso Levedura Seca
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-emerald-400 block my-0.5">
                {pitchCalc.dryYeastGramsNeeded} g
              </span>
              <span className="text-[9px] text-stone-500 font-mono">~10 Bi cel / g</span>
            </div>

            <div className="bg-stone-900/90 border border-indigo-900/50 p-2.5 rounded-xl flex flex-col justify-center items-center text-left">
              <span className="text-[10px] font-bold text-indigo-300 block leading-tight">
                {pitchCalc.recommendation.split(':')[0]}:
              </span>
              <p className="text-[10px] text-stone-400 leading-snug line-clamp-2 mt-0.5">
                {pitchCalc.recommendation.split(':')[1] || pitchCalc.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Slurry Display */}
        {yeastSourceType === 'slurry' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Células Totais
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-purple-300 block my-0.5">
                {pitchCalc.totalCellsBillion} Bi
              </span>
              <span className="text-[9px] text-stone-500 font-mono">{slurryCalc.viabilityPercent}% Viabilidade</span>
            </div>

            <div className="bg-stone-900/90 border border-amber-500/50 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Volume de Lama
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-amber-300 block my-0.5">
                {slurryCalc.slurryMlNeeded} mL
              </span>
              <span className="text-[9px] text-amber-400/80 font-mono">
                ~{slurryCalc.slurryCupsNeeded} xícaras
              </span>
            </div>

            <div className="bg-stone-900/90 border border-emerald-900/50 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Peso Aproximado
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-emerald-400 block my-0.5">
                {slurryCalc.slurryGramsNeeded} g
              </span>
              <span className="text-[9px] text-stone-500 font-mono">~1.1 g/mL</span>
            </div>

            <div className="bg-stone-900/90 border border-amber-900/50 p-2.5 rounded-xl flex flex-col justify-center items-center text-left">
              <span className="text-[10px] font-bold text-amber-300 block leading-tight">
                Dica da Lama:
              </span>
              <p className="text-[10px] text-stone-300 leading-snug line-clamp-2 mt-0.5">
                {slurryCalc.slurryQualityNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fermentation Stages Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Escala Térmica de Fermentação & Maturação</span>
          </h4>
          <button
            type="button"
            onClick={handleAddStage}
            className="text-xs bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium px-3 py-1.5 rounded-xl border border-stone-700 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" /> Adicionar Rampa
          </button>
        </div>

        <div className="space-y-2.5">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-stone-950/80 border border-stone-800/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 hover:border-purple-500/40 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                <span className="w-7 h-7 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/50 font-mono text-xs flex items-center justify-center font-bold shadow-inner">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleUpdateStage(idx, 'name', e.target.value)}
                  className="bg-transparent text-sm font-semibold text-stone-100 focus:bg-stone-900 px-2 py-1 rounded-xl focus:outline-none w-full border border-transparent focus:border-stone-700"
                />
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-1.5 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-amber-300">
                <Thermometer className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="number"
                  step="0.5"
                  value={stage.tempCelsius}
                  onChange={(e) => handleUpdateStage(idx, 'tempCelsius', parseFloat(e.target.value) || 0)}
                  className="w-12 bg-transparent text-right font-bold focus:outline-none"
                />
                <span>°C</span>
              </div>

              {/* Duration in Days */}
              <div className="flex items-center gap-1.5 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-purple-300">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={stage.durationDays}
                  onChange={(e) => handleUpdateStage(idx, 'durationDays', parseFloat(e.target.value) || 1)}
                  className="w-10 bg-transparent text-right font-bold focus:outline-none"
                />
                <span>dias</span>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveStage(idx)}
                className="text-stone-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Remover etapa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Yeast Explorer Modal */}
      <YeastExplorerModal
        isOpen={isYeastExplorerOpen}
        onClose={() => setIsYeastExplorerOpen(false)}
        selectedYeastId={selectedYeastId}
        onSelectYeast={handleSelectYeastFromExplorer}
      />

      {/* Adjuncts, Spices, Fruits & Woods Explorer Modal */}
      <AdjunctExplorerModal
        isOpen={isAdjunctExplorerOpen}
        onClose={() => setIsAdjunctExplorerOpen(false)}
        onAddNoteOrAdjunct={handleAddAdjunctFromExplorer}
      />
    </div>
  );
};
