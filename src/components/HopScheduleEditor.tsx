import React, { useState } from 'react';
import { HopAddition, HopForm, HopUse } from '../types/brewing';
import { HOPS_DATABASE } from '../data/ingredients';
import { HopExplorerModal } from './HopExplorerModal';
import {
  Plus,
  Trash2,
  Shield,
  Thermometer,
  Clock,
  Sparkles,
  RotateCw,
  Info,
  Layers,
  MapPin,
  Tag,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { triggerHopSpark } from '../utils/dopamineEffects';

interface HopScheduleEditorProps {
  hops: HopAddition[];
  onChange: (newHops: HopAddition[]) => void;
  totalHopsGrams: number;
  totalIbu: number;
}

export const HopScheduleEditor: React.FC<HopScheduleEditorProps> = ({
  hops,
  onChange,
  totalHopsGrams,
  totalIbu,
}) => {
  const [selectedDbHop, setSelectedDbHop] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});
  const [flipAllMode, setFlipAllMode] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const handleAddFromDb = () => {
    if (!selectedDbHop) return;
    const found = HOPS_DATABASE.find((h) => h.name === selectedDbHop);
    if (!found) return;

    const newItem: HopAddition = {
      id: `hop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: found.name,
      amountGrams: 30,
      alphaAcids: found.alphaAcids,
      timeMinutes: 15,
      use: 'Boil',
      form: 'Pellet',
      tempCelsius: 80,
    };

    onChange([...hops, newItem]);
    setSelectedDbHop('');
    triggerHopSpark(0.5, 0.4);
  };

  const handleSelectDbHopDirect = (hopName: string) => {
    if (!hopName) return;
    const found = HOPS_DATABASE.find((h) => h.name === hopName);
    if (!found) return;

    const newItem: HopAddition = {
      id: `hop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: found.name,
      amountGrams: 30,
      alphaAcids: found.alphaAcids,
      timeMinutes: 15,
      use: 'Boil',
      form: 'Pellet',
      tempCelsius: 80,
    };

    onChange([...hops, newItem]);
    setSelectedDbHop('');
    triggerHopSpark(0.5, 0.4);
  };

  const handleSwapHopVariety = (id: string, newHopName: string) => {
    const found = HOPS_DATABASE.find((h) => h.name === newHopName);
    if (!found) return;

    const updated = hops.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          name: found.name,
          alphaAcids: found.alphaAcids,
        };
      }
      return h;
    });
    onChange(updated);
  };

  const handleAddHopFromExplorer = (newHop: HopAddition) => {
    onChange([...hops, newHop]);
  };

  const handleAddCustom = () => {
    const newItem: HopAddition = {
      id: `hop-custom-${Date.now()}`,
      name: 'Novo Lúpulo Raro',
      amountGrams: 20,
      alphaAcids: 12.0,
      timeMinutes: 10,
      use: 'Boil',
      form: 'Pellet',
      tempCelsius: 80,
    };
    onChange([...hops, newItem]);
    triggerHopSpark(0.5, 0.4);
  };

  const handleUpdate = (id: string, field: keyof HopAddition, value: any) => {
    const updated = hops.map((h) => (h.id === id ? { ...h, [field]: value } : h));
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    onChange(hops.filter((h) => h.id !== id));
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
    hops.forEach((h) => {
      newMap[h.id] = nextState;
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
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 text-emerald-400 border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide font-serif">
                Lúpulos da Receita
              </h3>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-extrabold hidden sm:inline-block">
                Ficha técnica
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Total: <span className="text-emerald-400 font-mono font-bold">{totalHopsGrams} g</span> • Amargor estimado:{' '}
              <span className="text-amber-300 font-mono font-bold">{totalIbu} IBU</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {/* Lupulopédia & Global Search Button */}
          <button
            type="button"
            onClick={() => setIsExplorerOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0 cursor-pointer active:scale-95 border border-emerald-400/50"
            title="Abrir Catálogo Completo & Busca Avançada de Lúpulos do Mundo"
          >
            <Search className="w-3.5 h-3.5 text-stone-950" />
            <span>Buscar Lúpulos ({HOPS_DATABASE.length})</span>
          </button>

          {hops.length > 0 && (
            <button
              type="button"
              onClick={toggleFlipAll}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
                flipAllMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-700'
              }`}
              title="Girar todas as cartas em 3D para ver perfil aromático e origem"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${flipAllMode ? 'rotate-180' : ''} transition-transform`} />
              <span>{flipAllMode ? 'Voltar' : 'Ver ficha'}</span>
            </button>
          )}

          <select
            value={selectedDbHop}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDbHop(val);
              if (val) {
                handleSelectDbHopDirect(val);
              }
            }}
            className="flex-1 sm:flex-initial bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-[150px] max-w-full truncate font-medium shadow-inner cursor-pointer"
          >
            <option value="">+ Selecionar Lúpulo...</option>
            {HOPS_DATABASE.map((h) => (
              <option key={h.name} value={h.name}>
                + {h.name} ({h.alphaAcids}% AA - {h.origin})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddFromDb}
            disabled={!selectedDbHop}
            className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-stone-700 shrink-0 cursor-pointer active:scale-95"
            title="Adicionar lúpulo selecionado"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={handleAddCustom}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-stone-700 shrink-0 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Novo
          </button>
        </div>
      </div>

      {/* 3D Parallax & Flippable Hops Board */}
      <div className="space-y-3 perspective-container">
        {hops.map((hop) => {
          const isFlipped = !!flippedCards[hop.id];
          const tilt = cardTilts[hop.id] || { x: 0, y: 0 };

          // Find catalog match for aroma profile & origin
          const dbHop = HOPS_DATABASE.find(
            (db) => db.name.toLowerCase() === hop.name.toLowerCase()
          );

          // Estimated IBU contribution for this addition
          const isDryHop = hop.use === 'Dry Hop';
          const isWhirlpool = hop.use === 'Whirlpool';
          const approxIbu = isDryHop
            ? 0
            : isWhirlpool
            ? Math.round(hop.amountGrams * (hop.alphaAcids / 100) * 0.45 * 10)
            : Math.round(hop.amountGrams * (hop.alphaAcids / 100) * (Math.min(hop.timeMinutes, 60) / 60) * 1.8 * 10);

          return (
            <div
              key={hop.id}
              className="relative min-h-[76px] transition-transform duration-300"
              style={{
                perspective: '1000px',
              }}
              onMouseMove={(e) => handleCardMouseMove(hop.id, e)}
              onMouseLeave={() => handleCardMouseLeave(hop.id)}
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
                    isFlipped ? 'pointer-events-none' : 'hover:border-emerald-500/50'
                  }`}
                >
                  {/* Left: Hop Indicator + Name + Subtext */}
                  <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto sm:flex-1">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleCardFlip(hop.id)}
                        className="group/hopIcon relative w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/40 shadow-[0_2px_6px_rgba(0,0,0,0.8)] shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Clique para girar e ver a Ficha Sensorial 3D"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] group-hover/hopIcon:hidden" />
                        <RotateCw className="w-3 h-3 text-emerald-300 hidden group-hover/hopIcon:block" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={hop.name}
                            onChange={(e) => handleUpdate(hop.id, 'name', e.target.value)}
                            className="bg-transparent text-sm font-semibold text-stone-100 focus:bg-stone-900 focus:outline-none px-2 py-0.5 rounded flex-1 border border-transparent focus:border-stone-700 truncate"
                            placeholder="Nome do lúpulo..."
                          />
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSwapHopVariety(hop.id, e.target.value);
                              }
                            }}
                            className="bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-emerald-300 text-[11px] font-mono rounded-lg px-1.5 py-0.5 border border-stone-800 focus:outline-none cursor-pointer max-w-[110px] shrink-0"
                            title="Trocar variedade deste lúpulo"
                          >
                            <option value="">Trocar lúpulo...</option>
                            {HOPS_DATABASE.map((dbH) => (
                              <option key={dbH.name} value={dbH.name}>
                                {dbH.name} ({dbH.alphaAcids}% AA)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 px-2 text-[10px] font-mono text-stone-500">
                          <span>{dbHop?.origin || 'Origem Global'}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{approxIbu} IBU est.</span>
                          {dbHop?.purpose && (
                            <>
                              <span>•</span>
                              <span className="text-stone-400">{dbHop.purpose}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card Flip & Delete */}
                    <div className="flex items-center gap-1 sm:hidden">
                      <button
                        type="button"
                        onClick={() => toggleCardFlip(hop.id)}
                        className="text-emerald-400/80 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-950/30 transition-colors"
                        title="Ver Perfil Aromático"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(hop.id)}
                        className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                        title="Remover lúpulo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Hop Use, Form, Grams, %AA, Time/Temp, 3D Flip */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 border-t border-stone-800/60 sm:border-0 sm:pt-0 w-full sm:w-auto">
                    {/* Hop Use */}
                    <select
                      value={hop.use}
                      onChange={(e) => handleUpdate(hop.id, 'use', e.target.value as HopUse)}
                      className="bg-stone-900 text-stone-200 text-xs px-2.5 py-1.5 rounded-xl border border-stone-800 focus:outline-none font-medium"
                    >
                      <option value="First Wort">First Wort (FWH)</option>
                      <option value="Boil">Fervura (Boil)</option>
                      <option value="Whirlpool">Whirlpool / Hopstand</option>
                      <option value="Dry Hop">Dry-Hop (Frio)</option>
                      <option value="Mash">Mash Hop</option>
                    </select>

                    {/* Hop Form */}
                    <select
                      value={hop.form}
                      onChange={(e) => handleUpdate(hop.id, 'form', e.target.value as HopForm)}
                      className="bg-stone-900 text-stone-400 text-xs px-2.5 py-1.5 rounded-xl border border-stone-800 focus:outline-none"
                    >
                      <option value="Pellet">Pellet T90</option>
                      <option value="Cryo">Cryo / Lupomax</option>
                      <option value="Leaf">Flor / Cone</option>
                    </select>

                    {/* Amount Grams */}
                    <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-1 rounded-xl border border-stone-800">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={hop.amountGrams}
                        onChange={(e) => handleUpdate(hop.id, 'amountGrams', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-transparent font-mono font-bold text-emerald-300 text-sm text-right focus:outline-none"
                      />
                      <span className="text-xs font-mono text-stone-400">g</span>
                    </div>

                    {/* Alpha Acids % */}
                    <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-1 rounded-xl border border-stone-800">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={hop.alphaAcids}
                        onChange={(e) => handleUpdate(hop.id, 'alphaAcids', parseFloat(e.target.value) || 0)}
                        className="w-11 bg-transparent font-mono text-xs text-stone-300 text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-stone-500 font-mono">%AA</span>
                    </div>

                    {/* Time / Temperature */}
                    <div className="flex items-center gap-1.5 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-stone-300">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={hop.timeMinutes}
                        onChange={(e) => handleUpdate(hop.id, 'timeMinutes', parseFloat(e.target.value) || 0)}
                        className="w-8 bg-transparent text-amber-300 text-right focus:outline-none font-bold"
                      />
                      <span>{hop.use === 'Dry Hop' ? 'dias' : 'min'}</span>

                      {hop.use === 'Whirlpool' && (
                        <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-stone-700 text-sky-400">
                          <Thermometer className="w-3 h-3" />
                          <input
                            type="number"
                            step="1"
                            value={hop.tempCelsius || 80}
                            onChange={(e) => handleUpdate(hop.id, 'tempCelsius', parseFloat(e.target.value) || 80)}
                            className="w-8 bg-transparent text-right focus:outline-none"
                          />
                          <span>°C</span>
                        </div>
                      )}
                    </div>

                    {/* Desktop 3D Card Flip Button */}
                    <button
                      type="button"
                      onClick={() => toggleCardFlip(hop.id)}
                      className="hidden sm:flex text-stone-400 hover:text-emerald-300 p-2 rounded-xl bg-stone-900/80 hover:bg-emerald-950/40 border border-stone-800 hover:border-emerald-500/40 transition-all items-center gap-1 text-[11px] font-mono cursor-pointer"
                      title="Girar 3D para ver Ficha Sensorial & Terpenos"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Perfil 3D</span>
                    </button>

                    {/* Desktop Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(hop.id)}
                      className="hidden sm:block text-stone-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
                      title="Remover lúpulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ========================================= */}
                {/* BACK FACE: Sensory Profile & Terpenes Blueprint */}
                {/* ========================================= */}
                <div
                  className={`absolute inset-0 w-full bg-gradient-to-r from-emerald-950/40 via-stone-950 to-stone-900 border border-emerald-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backface-hidden rotate-y-180 transition-all ${
                    !isFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  {/* Left Aromas and Origin */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-400/80 shadow-md shrink-0 flex items-center justify-center text-emerald-300 font-mono text-[10px] font-bold">
                      {hop.alphaAcids}%
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-300 font-serif truncate">
                          {hop.name}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{dbHop?.origin || 'EUA'}</span>
                        </span>
                      </div>
                      
                      {/* Sensory descriptors tags */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {(dbHop?.sensoryNotes || ['Cítrico', 'Resina', 'Frutado']).map((note) => (
                          <span
                            key={note}
                            className="text-[9px] font-mono bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 text-stone-300"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Technical Stats & Flip Back */}
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <div className="hidden md:block text-right">
                      <span className="text-[9px] text-stone-500 block uppercase">Momento</span>
                      <span className="text-amber-400 font-bold">{hop.use}</span>
                    </div>

                    <div className="text-right bg-stone-900/90 px-2.5 py-1 rounded-xl border border-stone-800">
                      <span className="text-[9px] text-stone-500 block uppercase">IBU Calculado</span>
                      <span className="text-emerald-400 font-extrabold">{approxIbu} IBU</span>
                    </div>

                    {/* Return button */}
                    <button
                      type="button"
                      onClick={() => toggleCardFlip(hop.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
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

      {/* Hop Explorer Modal with Global Search & Variety Filter */}
      <HopExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onAddHop={handleAddHopFromExplorer}
      />
    </div>
  );
};
