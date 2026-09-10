import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GrainBillItem, GrainType } from '../types/brewing';
import { GRAINS_DATABASE, GrainDatabaseItem } from '../data/ingredients';
import {
  Search,
  X,
  Plus,
  Wheat,
  MapPin,
  Sparkles,
  Layers,
  Flame,
  Check,
  Percent,
} from 'lucide-react';
import { srmToHex, ebcToSrm } from '../utils/brewingCalculations';
import { triggerMaltDrop } from '../utils/dopamineEffects';

interface MaltExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGrain: (newGrain: GrainBillItem) => void;
}

export const MaltExplorerModal: React.FC<MaltExplorerModalProps> = ({
  isOpen,
  onClose,
  onAddGrain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('Todos');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [justAddedMaltName, setJustAddedMaltName] = useState<string | null>(null);

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

  // Origins for quick filtering
  const origins = [
    { label: 'Todos os Países', value: 'Todos', flag: '🌍' },
    { label: 'Alemanha (Weyermann)', value: 'Alemanha', flag: '🇩🇪' },
    { label: 'Reino Unido (Crisp/Simpsons)', value: 'Reino Unido', flag: '🇬🇧' },
    { label: 'Bélgica (Castle)', value: 'Bélgica', flag: '🇧🇪' },
    { label: 'Brasil (Agrária/Nacional)', value: 'Brasil', flag: '🇧🇷' },
    { label: 'EUA & Outros', value: 'Outros', flag: '🇺🇸' },
  ];

  const types = [
    { label: 'Todos os Tipos', value: 'Todos' },
    { label: 'Maltes Base', value: 'Base' },
    { label: 'Caramelo & Crystal', value: 'Caramel/Crystal' },
    { label: 'Torrados & Escuros', value: 'Roasted' },
    { label: 'Flocos & Adjuntos', value: 'Adjunct' },
    { label: 'Especiais & Acidificados', value: 'Acid/Special' },
  ];

  const filteredGrains = useMemo(() => {
    return GRAINS_DATABASE.filter((grain) => {
      // Origin filter
      if (selectedOrigin !== 'Todos') {
        if (selectedOrigin === 'Outros') {
          const mainCountries = ['alemanha', 'reino unido', 'inglaterra', 'escócia', 'esfocu', 'bélgica', 'belgica', 'brasil'];
          if (mainCountries.some((c) => grain.origin.toLowerCase().includes(c))) return false;
        } else if (selectedOrigin === 'Reino Unido') {
          if (!grain.origin.toLowerCase().includes('reino unido') && !grain.origin.toLowerCase().includes('inglaterra') && !grain.origin.toLowerCase().includes('escócia')) return false;
        } else {
          if (!grain.origin.toLowerCase().includes(selectedOrigin.toLowerCase())) return false;
        }
      }

      // Type filter
      if (selectedType !== 'Todos' && grain.type !== selectedType) {
        return false;
      }

      // Search filter (name, notes, sensoryNotes, origin)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = grain.name.toLowerCase().includes(term);
        const matchOrigin = grain.origin.toLowerCase().includes(term);
        const matchNotes = grain.notes.toLowerCase().includes(term);
        const matchSensory = grain.sensoryNotes.some((n) => n.toLowerCase().includes(term));
        return matchName || matchOrigin || matchNotes || matchSensory;
      }

      return true;
    });
  }, [searchTerm, selectedOrigin, selectedType]);

  if (!isOpen) return null;

  const handleAdd = (grain: GrainDatabaseItem, amountKg: number = 1.0) => {
    const newItem: GrainBillItem = {
      id: `grain-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: grain.name,
      amountKg,
      potentialSg: grain.potentialSg,
      ebc: grain.ebc,
      type: grain.type,
    };

    onAddGrain(newItem);
    triggerMaltDrop(0.5, 0.4);

    setJustAddedMaltName(grain.name);
    setTimeout(() => {
      setJustAddedMaltName(null);
    }, 1500);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Isolated backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-5xl h-[90vh] sm:h-[92vh] max-h-[92vh] flex flex-col bg-stone-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden workbench-bezel">
        {/* Physical Rivets (non-blocking) */}
        <span className="rivet-screw top-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw top-2.5 right-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 right-2.5 pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner shrink-0">
              <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-amber-400">
                  Maltopédia Mundial Democrata
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold hidden xs:inline-block">
                  {GRAINS_DATABASE.length} Variedades
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-serif tracking-wide">
                Catálogo Global de Maltes, Grãos & Flocos
              </h2>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="z-20 flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
            title="Fechar (Esc)"
            aria-label="Fechar catálogo"
          >
            <X className="w-4 h-4 text-amber-400" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 sm:p-5 bg-stone-950/90 border-b border-stone-800/80 space-y-3 shrink-0">
          {/* Main Search Input Form with Button */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar malte por nome ou sabor (ex: Pilsen, Maris Otter, Cacau, Munich, Defumado, Aveia...)"
                className="w-full bg-stone-900 border-2 border-stone-700 text-stone-100 text-xs sm:text-sm rounded-xl pl-11 pr-10 py-2.5 sm:py-3 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner placeholder:text-stone-400 min-h-[44px]"
                style={{ WebkitAppearance: 'none' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px] active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </button>
          </form>

          {/* Quick Filter Pills (Countries & Types) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Country Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin">
              {origins.map((orig) => {
                const isSelected = selectedOrigin === orig.value;
                return (
                  <button
                    key={orig.value}
                    type="button"
                    onClick={() => setSelectedOrigin(orig.value)}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>{orig.flag}</span>
                    <span>{orig.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {types.map((t) => {
                const isSelected = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer border shrink-0 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                        : 'bg-stone-900/90 text-stone-400 hover:text-stone-300 border-stone-800'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 min-h-0">
          {filteredGrains.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Wheat className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-300 font-medium text-sm">
                Nenhum malte encontrado para "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOrigin('Todos');
                  setSelectedType('Todos');
                }}
                className="text-xs text-amber-400 hover:underline font-mono cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGrains.map((grain) => {
                const isAdded = justAddedMaltName === grain.name;
                const srmValue = ebcToSrm(grain.ebc);
                const colorHex = srmToHex(srmValue);

                return (
                  <div
                    key={grain.name}
                    onClick={() => handleAdd(grain, 1.0)}
                    className={`relative bg-stone-950/80 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-xl cursor-pointer ${
                      isAdded
                        ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'border-stone-800 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Top Row: Name, EBC Swatch, Origin & Type */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base font-serif tracking-wide">
                              {grain.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-amber-400" />
                              <span>{grain.origin}</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {grain.type}
                            </span>
                          </div>
                        </div>

                        {/* Color & Potential Badge */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-900 border border-stone-700 shadow-inner">
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-sm shrink-0"
                              style={{ backgroundColor: colorHex }}
                            />
                            <span className="font-mono text-xs font-bold text-stone-200">
                              {grain.ebc} <span className="text-[10px] text-stone-400">EBC</span>
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 block mt-0.5 font-bold">
                            SG: {grain.potentialSg.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      {/* Notes Description */}
                      <p className="text-xs text-stone-300 font-medium mt-2 leading-relaxed">
                        {grain.notes}
                      </p>

                      {/* Sensory Note Badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {grain.sensoryNotes.map((note) => (
                          <span
                            key={note}
                            className="text-[10px] font-mono bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800 text-amber-200/90"
                          >
                            {note}
                          </span>
                        ))}
                      </div>

                      {/* Diastatic & Max Usage */}
                      {(grain.maxUsagePercent || grain.diastaticPower) && (
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-stone-400">
                          {grain.maxUsagePercent && (
                            <span>Uso máx: <strong className="text-stone-300">{grain.maxUsagePercent}%</strong></span>
                          )}
                          {grain.diastaticPower && (
                            <span>Poder enzimático: <strong className="text-stone-300">{grain.diastaticPower}</strong></span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Add Action Buttons directly to Recipe */}
                    <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                        Adicionar ao Grist:
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* 0.25 kg Addition */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(grain, 0.25);
                          }}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] font-medium px-2 py-1 rounded-xl border border-stone-700 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Adicionar 250g (Ajuste ou especial)"
                        >
                          <span>+250g</span>
                        </button>

                        {/* 0.5 kg Addition */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(grain, 0.5);
                          }}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] font-medium px-2 py-1 rounded-xl border border-stone-700 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Adicionar 500g"
                        >
                          <span>+500g</span>
                        </button>

                        {/* 1.0 kg Addition */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(grain, 1.0);
                          }}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          title="Adicionar 1.0 kg ao Grist"
                        >
                          {isAdded ? (
                            <Check className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Plus className="w-3 h-3 text-amber-400" />
                          )}
                          <span>{isAdded ? 'Adicionado!' : '+1.0 kg'}</span>
                        </button>

                        {/* 3.0 kg Addition */}
                        {grain.type === 'Base' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(grain, 3.0);
                            }}
                            className="bg-stone-900 hover:bg-amber-950/40 text-stone-200 hover:text-amber-300 text-[11px] font-medium px-2.5 py-1 rounded-xl border border-stone-700 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Adicionar 3.0 kg (Base de brassagem)"
                          >
                            <span>+3.0 kg</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 p-3 sm:p-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              Exibindo <strong className="text-white">{filteredGrains.length}</strong> de{' '}
              <strong className="text-white">{GRAINS_DATABASE.length}</strong> maltes.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Concluir & Fechar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MaltExplorerModal;
