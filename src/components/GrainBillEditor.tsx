import React, { useState } from 'react';
import { GrainBillItem } from '../types/brewing';
import { GRAINS_DATABASE } from '../data/ingredients';
import { MaltExplorerModal } from './MaltExplorerModal';
import {
  Plus,
  Trash2,
  Wheat,
  Layers,
  Sparkles,
  RotateCw,
  Info,
  Sliders,
  CheckCircle2,
  Flame,
  FileSpreadsheet,
  HelpCircle,
  Search,
} from 'lucide-react';
import { srmToHex } from '../utils/brewingCalculations';

interface GrainBillEditorProps {
  grains: GrainBillItem[];
  onChange: (newGrains: GrainBillItem[]) => void;
  totalGrainKg: number;
}

export const GrainBillEditor: React.FC<GrainBillEditorProps> = ({
  grains,
  onChange,
  totalGrainKg,
}) => {
  const [selectedDbGrain, setSelectedDbGrain] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});
  const [flipAllMode, setFlipAllMode] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const handleAddFromDb = () => {
    if (!selectedDbGrain) return;
    const found = GRAINS_DATABASE.find((g) => g.name === selectedDbGrain);
    if (!found) return;

    const newItem: GrainBillItem = {
      id: `grain-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: found.name,
      amountKg: 1.0,
      potentialSg: found.potentialSg,
      ebc: found.ebc,
      type: found.type,
    };

    onChange([...grains, newItem]);
    setSelectedDbGrain('');
  };

  const handleSelectDbGrainDirect = (grainName: string) => {
    if (!grainName) return;
    const found = GRAINS_DATABASE.find((g) => g.name === grainName);
    if (!found) return;

    const newItem: GrainBillItem = {
      id: `grain-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: found.name,
      amountKg: 1.0,
      potentialSg: found.potentialSg,
      ebc: found.ebc,
      type: found.type,
    };

    onChange([...grains, newItem]);
    setSelectedDbGrain('');
  };

  const handleSwapGrainVariety = (id: string, newName: string) => {
    const found = GRAINS_DATABASE.find((g) => g.name === newName);
    if (!found) return;

    const updated = grains.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          name: found.name,
          potentialSg: found.potentialSg,
          ebc: found.ebc,
          type: found.type,
        };
      }
      return g;
    });
    onChange(updated);
  };

  const handleAddGrainFromExplorer = (newGrain: GrainBillItem) => {
    onChange([...grains, newGrain]);
  };

  const handleAddCustom = () => {
    const newItem: GrainBillItem = {
      id: `grain-custom-${Date.now()}`,
      name: 'Novo Malte Especial',
      amountKg: 0.5,
      potentialSg: 1.036,
      ebc: 10,
      type: 'Base',
    };
    onChange([...grains, newItem]);
  };

  const handleUpdate = (id: string, field: keyof GrainBillItem, value: any) => {
    const updated = grains.map((g) => (g.id === id ? { ...g, [field]: value } : g));
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    onChange(grains.filter((g) => g.id !== id));
  };

  const toggleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFlipAll = () => {
    const nextState = !flipAllMode;
    setFlipAllMode(nextState);
    const newMap: Record<string, boolean> = {};
    grains.forEach((g) => {
      newMap[g.id] = nextState;
    });
    setFlippedCards(newMap);
  };

  const handleCardMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setCardTilts((prev) => ({
      ...prev,
      [id]: { x, y },
    }));
  };

  const handleCardMouseLeave = (id: string) => {
    setCardTilts((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  };

  return (
    <div className="relative bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-stone-900/95 border border-stone-800/90 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-md overflow-hidden blueprint-grid workbench-bezel">
      {/* Corner Rivets / Physical Workbench Screws */}
      <span className="rivet-screw top-2.5 left-2.5" />
      <span className="rivet-screw top-2.5 right-2.5" />
      <span className="rivet-screw bottom-2.5 left-2.5" />
      <span className="rivet-screw bottom-2.5 right-2.5" />

      {/* Header section with 3D Depth bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 text-amber-400 border border-amber-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide font-serif">
                Maltes & Grãos
              </h3>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-extrabold hidden sm:inline-block">
                Ficha técnica
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Total: <span className="text-amber-300 font-mono font-bold">{totalGrainKg.toFixed(2)} kg</span>
              {grains.length > 0 && (
                <span className="text-stone-500 ml-2 font-mono">({grains.length} itens)</span>
              )}
            </p>
          </div>
        </div>

        {/* Action & Flip All Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {/* Maltopédia & Global Search Button */}
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer active:scale-95 border border-amber-400/50"
            title="Abrir Catálogo Completo & Busca Avançada de Maltes do Mundo"
          >
            <Search className="w-3.5 h-3.5 text-stone-950" />
            <span>Buscar Maltes ({GRAINS_DATABASE.length})</span>
          </button>

          {grains.length > 0 && (
            <button
              type="button"
              onClick={toggleFlipAll}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
                flipAllMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-700'
              }`}
              title="Girar todas as cartas em 3D para ver fichas técnicas"
            >
              <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${flipAllMode ? 'rotate-180' : ''} transition-transform`} />
              <span>{flipAllMode ? 'Voltar' : 'Ver ficha'}</span>
            </button>
          )}

          <select
            value={selectedDbGrain}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDbGrain(val);
              if (val) {
                handleSelectDbGrainDirect(val);
              }
            }}
            className="flex-1 sm:flex-initial bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none min-w-[150px] max-w-full truncate font-medium shadow-inner cursor-pointer"
          >
            <option value="">+ Selecionar Malte...</option>
            {GRAINS_DATABASE.map((g) => (
              <option key={g.name} value={g.name}>
                + {g.name} ({g.ebc} EBC)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddFromDb}
            disabled={!selectedDbGrain}
            className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-stone-700 shrink-0 cursor-pointer active:scale-95"
            title="Adicionar malte selecionado"
          >
            <Plus className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={handleAddCustom}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-stone-700 shrink-0 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Novo
          </button>
        </div>
      </div>

      {/* Visual Composition Percentage Bar */}
      {grains.length > 0 && totalGrainKg > 0 && (
        <div className="mb-4 bg-stone-950/90 p-2.5 rounded-2xl border border-stone-800/80 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1.5 px-1">
            <span className="flex items-center gap-1.5 font-bold text-stone-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Espectro do Grist Bill
            </span>
            <span className="text-amber-300/80">100% da Carga de Malte</span>
          </div>
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-stone-900 border border-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
            {grains.map((g) => {
              const pct = (g.amountKg / totalGrainKg) * 100;
              const lovibond = g.ebc / 1.97;
              const hex = srmToHex(lovibond);
              return (
                <div
                  key={g.id}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: hex,
                  }}
                  title={`${g.name}: ${g.amountKg}kg (${pct.toFixed(1)}%)`}
                  className="h-full border-r border-stone-950/40 transition-all hover:brightness-130 hover:scale-y-110 cursor-pointer"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Parallax & Flippable Grains Board */}
      <div className="space-y-3 perspective-container">
        {grains.map((grain) => {
          const isFlipped = !!flippedCards[grain.id];
          const tilt = cardTilts[grain.id] || { x: 0, y: 0 };
          const pct = totalGrainKg > 0 ? ((grain.amountKg / totalGrainKg) * 100).toFixed(1) : '0';
          const lovibond = (grain.ebc / 1.97).toFixed(1);
          const maltColorHex = srmToHex(grain.ebc / 1.97);

          // Find catalog info if available
          const dbMatch = GRAINS_DATABASE.find(
            (db) => db.name.toLowerCase() === grain.name.toLowerCase()
          );

          // Technical calculations for back face
          const ppgYield = Math.round(((grain.potentialSg || 1.037) - 1) * 1000);
          const pointsContributed = Math.round(ppgYield * grain.amountKg * 0.75); // approx efficiency

          return (
            <div
              key={grain.id}
              className="relative min-h-[76px] transition-transform duration-300"
              style={{
                perspective: '1000px',
              }}
              onMouseMove={(e) => handleCardMouseMove(grain.id, e)}
              onMouseLeave={() => handleCardMouseLeave(grain.id)}
            >
              {/* Card Container with 3D Flip & Parallax Tilt */}
              <div
                className="w-full transform-style-3d transition-transform duration-500 rounded-2xl"
                style={{
                  transform: isFlipped
                    ? `rotateY(180deg) rotateX(${tilt.y * 0.5}deg) rotateZ(${tilt.x * 0.2}deg)`
                    : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(2px)`,
                }}
              >
                {/* ========================================= */}
                {/* FRONT FACE: Precision Editing Mode */}
                {/* ========================================= */}
                <div
                  className={`w-full bg-stone-950/90 border border-stone-800/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backface-hidden transition-colors ${
                    isFlipped ? 'pointer-events-none' : 'hover:border-amber-500/50'
                  }`}
                >
                  {/* Left: Swatch + Malt Name + Quick 3D Flip Trigger */}
                  <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto sm:flex-1">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Interactive Color Swatch with 3D Bevel */}
                      <button
                        type="button"
                        onClick={() => toggleCardFlip(grain.id)}
                        className="group/swatch relative w-7 h-7 rounded-xl border border-white/30 shadow-[0_2px_6px_rgba(0,0,0,0.8)] shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: maltColorHex }}
                        title="Clique para girar e ver a Ficha Técnica 3D"
                      >
                        <RotateCw className="w-3 h-3 text-white opacity-0 group-hover/swatch:opacity-100 transition-opacity drop-shadow" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={grain.name}
                            onChange={(e) => handleUpdate(grain.id, 'name', e.target.value)}
                            className="bg-transparent text-sm font-semibold text-stone-100 focus:bg-stone-900 focus:outline-none px-2 py-0.5 rounded flex-1 border border-transparent focus:border-stone-700 truncate"
                            placeholder="Nome do malte..."
                          />
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSwapGrainVariety(grain.id, e.target.value);
                              }
                            }}
                            className="bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 text-[11px] font-mono rounded-lg px-1.5 py-0.5 border border-stone-800 focus:outline-none cursor-pointer max-w-[110px] shrink-0"
                            title="Trocar variedade de malte deste item"
                          >
                            <option value="">Trocar malte...</option>
                            {GRAINS_DATABASE.map((dbGrain) => (
                              <option key={dbGrain.name} value={dbGrain.name}>
                                {dbGrain.name} ({dbGrain.ebc} EBC)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 px-2 text-[10px] font-mono text-stone-500">
                          <span>{lovibond}°L</span>
                          <span>•</span>
                          <span>{ppgYield} PPG</span>
                          {dbMatch?.origin && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/70">{dbMatch.origin}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card Flip & Delete */}
                    <div className="flex items-center gap-1 sm:hidden">
                      <button
                        type="button"
                        onClick={() => toggleCardFlip(grain.id)}
                        className="text-amber-400/80 hover:text-amber-300 p-1.5 rounded-lg hover:bg-amber-950/30 transition-colors"
                        title="Ver Ficha Técnica"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(grain.id)}
                        className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                        title="Remover malte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Type, Weight Kg, %, EBC, Technical Blueprint Flip Button */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 border-t border-stone-800/60 sm:border-0 sm:pt-0 w-full sm:w-auto">
                    {/* Type Badge */}
                    <select
                      value={grain.type}
                      onChange={(e) => handleUpdate(grain.id, 'type', e.target.value as GrainBillItem['type'])}
                      className="bg-stone-900 text-stone-300 text-xs px-2.5 py-1.5 rounded-xl border border-stone-800 focus:outline-none font-medium"
                    >
                      <option value="Base">Base</option>
                      <option value="Caramel/Crystal">Caramelo/Crystal</option>
                      <option value="Roasted">Torrado</option>
                      <option value="Adjunct">Adjunto</option>
                      <option value="Acid/Special">Acid/Especial</option>
                    </select>

                    {/* Amount Kg */}
                    <div className="flex items-center gap-1.5 bg-stone-900/90 px-2 py-1 rounded-xl border border-stone-800">
                      <input
                        type="number"
                        step="0.1"
                        min="0.05"
                        value={grain.amountKg}
                        onChange={(e) => handleUpdate(grain.id, 'amountKg', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-transparent font-mono font-bold text-amber-300 text-sm text-right focus:outline-none"
                      />
                      <span className="text-xs font-mono text-stone-400">kg</span>
                    </div>

                    {/* Percentage */}
                    <div className="text-center font-mono text-xs font-semibold text-stone-300 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-800">
                      {pct}%
                    </div>

                    {/* Color EBC Input */}
                    <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-1 rounded-xl border border-stone-800">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={grain.ebc}
                        onChange={(e) => handleUpdate(grain.id, 'ebc', parseFloat(e.target.value) || 1)}
                        className="w-12 bg-transparent font-mono text-xs text-stone-300 text-right focus:outline-none"
                        title="Cor em EBC"
                      />
                      <span className="text-[10px] text-stone-500 font-mono">EBC</span>
                    </div>

                    {/* Desktop 3D Card Flip Button */}
                    <button
                      type="button"
                      onClick={() => toggleCardFlip(grain.id)}
                      className="hidden sm:flex text-stone-400 hover:text-amber-300 p-2 rounded-xl bg-stone-900/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-500/40 transition-all items-center gap-1 text-[11px] font-mono cursor-pointer"
                      title="Girar 3D para ver Ficha Técnica de Engenharia"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ficha 3D</span>
                    </button>

                    {/* Desktop Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(grain.id)}
                      className="hidden sm:block text-stone-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
                      title="Remover malte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ========================================= */}
                {/* BACK FACE: Technical Engineering Blueprint */}
                {/* ========================================= */}
                <div
                  className={`absolute inset-0 w-full bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-900 border border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backface-hidden rotate-y-180 transition-all ${
                    !isFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  {/* Left Blueprint Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl border border-amber-400/80 shadow-md shrink-0 flex items-center justify-center font-mono text-[10px] font-bold text-stone-950"
                      style={{ backgroundColor: maltColorHex }}
                    >
                      {grain.ebc}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 font-serif truncate">
                          {grain.name}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          {grain.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 line-clamp-1 italic mt-0.5">
                        {dbMatch?.notes || 'Malte nobre selecionado para equilíbrio enzimático e sensorial.'}
                      </p>
                    </div>
                  </div>

                  {/* Engineering Parameters Matrix */}
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <div className="hidden md:block text-right">
                      <span className="text-[9px] text-stone-500 block uppercase">Potencial Máx</span>
                      <span className="text-stone-200 font-bold">{grain.potentialSg || 1.037} SG</span>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="text-[9px] text-stone-500 block uppercase">Lovibond</span>
                      <span className="text-amber-400 font-bold">{lovibond} °L</span>
                    </div>

                    <div className="text-right bg-stone-900/90 px-2.5 py-1 rounded-xl border border-stone-800">
                      <span className="text-[9px] text-stone-500 block uppercase">Rendimento</span>
                      <span className="text-emerald-400 font-extrabold">{pointsContributed} pts</span>
                    </div>

                    {/* Return button */}
                    <button
                      type="button"
                      onClick={() => toggleCardFlip(grain.id)}
                      className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Malt Explorer Modal with Global Search & Variety Filter */}
      <MaltExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onAddGrain={handleAddGrainFromExplorer}
      />
    </div>
  );
};
