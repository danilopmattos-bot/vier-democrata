import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HopAddition, HopUse } from '../types/brewing';
import { HOPS_DATABASE, HopDatabaseItem } from '../data/ingredients';
import {
  Search,
  X,
  Plus,
  Shield,
  MapPin,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Layers,
  Filter,
  Check,
} from 'lucide-react';
import { triggerHopSpark } from '../utils/dopamineEffects';

interface HopExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHop: (newHop: HopAddition) => void;
}

export const HopExplorerModal: React.FC<HopExplorerModalProps> = ({
  isOpen,
  onClose,
  onAddHop,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('Todos');
  const [selectedPurpose, setSelectedPurpose] = useState('Todos');
  const [justAddedHopName, setJustAddedHopName] = useState<string | null>(null);

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

  // List of distinct origins for quick filter pills
  const origins = [
    { label: 'Todos os Países', value: 'Todos', flag: '🌍' },
    { label: 'Alemanha (Baviera)', value: 'Alemanha', flag: '🇩🇪' },
    { label: 'Estados Unidos (Yakima)', value: 'EUA', flag: '🇺🇸' },
    { label: 'Nova Zelândia (Nelson)', value: 'Nova Zelândia', flag: '🇳🇿' },
    { label: 'Austrália (Tasmania)', value: 'Austrália', flag: '🇦🇺' },
    { label: 'Reino Unido (Inglaterra)', value: 'Reino Unido', flag: '🇬🇧' },
    { label: 'República Tcheca', value: 'República Tcheca', flag: '🇨🇿' },
    { label: 'Eslovênia', value: 'Eslovênia', flag: '🇸🇮' },
    { label: 'França & Outros', value: 'Outros', flag: '🇫🇷' },
  ];

  const purposes = ['Todos', 'Aroma', 'Duplo Propósito', 'Nobre', 'Amargor'];

  const filteredHops = useMemo(() => {
    return HOPS_DATABASE.filter((hop) => {
      // Origin filter
      if (selectedOrigin !== 'Todos') {
        if (selectedOrigin === 'Outros') {
          const mainCountries = ['alemanha', 'eua', 'estados unidos', 'nova zelândia', 'nova zelandia', 'austrália', 'australia', 'reino unido', 'inglaterra', 'república tcheca', 'republica tcheca', 'eslovênia', 'eslovenia'];
          if (mainCountries.some((c) => hop.origin.toLowerCase().includes(c))) return false;
        } else if (selectedOrigin === 'EUA') {
          if (!hop.origin.toLowerCase().includes('eua') && !hop.origin.toLowerCase().includes('estados unidos')) return false;
        } else if (selectedOrigin === 'Reino Unido') {
          if (!hop.origin.toLowerCase().includes('reino unido') && !hop.origin.toLowerCase().includes('inglaterra')) return false;
        } else {
          if (!hop.origin.toLowerCase().includes(selectedOrigin.toLowerCase())) return false;
        }
      }

      // Purpose filter
      if (selectedPurpose !== 'Todos' && hop.purpose !== selectedPurpose) {
        return false;
      }

      // Search term (Matches name, origin, profile, sensory notes)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = hop.name.toLowerCase().includes(term);
        const matchOrigin = hop.origin.toLowerCase().includes(term);
        const matchProfile = hop.profile.toLowerCase().includes(term);
        const matchSensory = hop.sensoryNotes.some((note) =>
          note.toLowerCase().includes(term)
        );
        return matchName || matchOrigin || matchProfile || matchSensory;
      }

      return true;
    });
  }, [searchTerm, selectedOrigin, selectedPurpose]);

  if (!isOpen) return null;

  const handleAdd = (hop: HopDatabaseItem, useType: HopUse = 'Boil', defaultTime = 15, defaultGrams = 30) => {
    const newItem: HopAddition = {
      id: `hop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: hop.name,
      amountGrams: defaultGrams,
      alphaAcids: hop.alphaAcids,
      timeMinutes: defaultTime,
      use: useType,
      form: 'Pellet',
      tempCelsius: useType === 'Whirlpool' ? 80 : undefined,
    };

    onAddHop(newItem);
    triggerHopSpark(0.5, 0.4);

    setJustAddedHopName(hop.name);
    setTimeout(() => {
      setJustAddedHopName(null);
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

      <div className="relative z-10 w-full max-w-5xl h-[90vh] sm:h-[92vh] max-h-[92vh] flex flex-col bg-stone-900 border border-emerald-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden workbench-bezel">
        {/* Decorative corner screws (non-blocking) */}
        <span className="rivet-screw top-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw top-2.5 right-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 right-2.5 pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-emerald-950/40 to-stone-950 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-emerald-400">
                  Lupulopédia Global Democrata
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold hidden xs:inline-block">
                  {HOPS_DATABASE.length} Variedades
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-serif tracking-wide">
                Catálogo Mundial de Lúpulos & Sistema de Busca
              </h2>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="z-20 flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
            title="Fechar (Esc)"
            aria-label="Fechar catálogo de lúpulos"
          >
            <X className="w-4 h-4 text-emerald-400" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 sm:p-5 bg-stone-950/90 border-b border-stone-800/80 space-y-3 shrink-0">
          {/* Main Search Input Form with Button */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar lúpulo por nome ou aroma (ex: Citra, Mosaic, Mandarina, Maracujá, Pinho, Saaz, Galaxy...)"
                className="w-full bg-stone-900 border-2 border-stone-700 text-stone-100 text-xs sm:text-sm rounded-xl pl-11 pr-10 py-2.5 sm:py-3 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner placeholder:text-stone-400 min-h-[44px]"
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
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px] active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </button>
          </form>

          {/* Quick Filter Pills (Countries + Purpose) */}
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
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-bold'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>{orig.flag}</span>
                    <span>{orig.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Purpose Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {purposes.map((purp) => {
                const isSelected = selectedPurpose === purp;
                return (
                  <button
                    key={purp}
                    type="button"
                    onClick={() => setSelectedPurpose(purp)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer border shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                        : 'bg-stone-900/90 text-stone-400 hover:text-stone-300 border-stone-800'
                    }`}
                  >
                    {purp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 min-h-0">
          {filteredHops.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Shield className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-300 font-medium text-sm">
                Nenhum lúpulo encontrado para "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedOrigin('Todos');
                  setSelectedPurpose('Todos');
                }}
                className="text-xs text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredHops.map((hop) => {
                const isAdded = justAddedHopName === hop.name;

                return (
                  <div
                    key={hop.name}
                    onClick={() => handleAdd(hop, 'Whirlpool', 20, 50)}
                    className={`relative bg-stone-950/80 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-xl cursor-pointer ${
                      isAdded
                        ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'border-stone-800 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Top Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base font-serif tracking-wide">
                            {hop.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{hop.origin}</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              {hop.purpose}
                            </span>
                          </div>
                        </div>

                        {/* Alpha Acid Gauge Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/40 inline-block shadow-inner">
                            {hop.alphaAcids}% <span className="text-[10px] font-normal text-emerald-200">AA</span>
                          </span>
                        </div>
                      </div>

                      {/* Description & Sensory Notes */}
                      <p className="text-xs text-stone-300 font-medium mt-2 leading-relaxed">
                        {hop.profile}
                      </p>

                      {/* Sensory Badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {hop.sensoryNotes.map((note) => (
                          <span
                            key={note}
                            className="text-[10px] font-mono bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800 text-emerald-300/90"
                          >
                            {note}
                          </span>
                        ))}
                      </div>

                      {/* Oil Composition Specs */}
                      {hop.oilComposition && (
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-stone-400 mt-2.5 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 text-center">
                          <div>
                            <span className="block text-stone-500 text-[8px]">Mirceno</span>
                            <span className="text-stone-300 font-bold">{hop.oilComposition.myrcene}</span>
                          </div>
                          <div>
                            <span className="block text-stone-500 text-[8px]">Humuleno</span>
                            <span className="text-stone-300 font-bold">{hop.oilComposition.humulene}</span>
                          </div>
                          <div>
                            <span className="block text-stone-500 text-[8px]">Cariofileno</span>
                            <span className="text-stone-300 font-bold">{hop.oilComposition.caryophyllene}</span>
                          </div>
                          <div>
                            <span className="block text-stone-500 text-[8px]">Farneseno</span>
                            <span className="text-stone-300 font-bold">{hop.oilComposition.farnesene || '<1%'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Add Presets into Recipe Schedule */}
                    <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                        Inserir na Receita:
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 60m Bittering */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(hop, 'Boil', 60, 20);
                          }}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] font-medium px-2 py-1 rounded-xl border border-stone-700 hover:border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Adicionar para Amargor (60 min)"
                        >
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Amargor 60m</span>
                        </button>

                        {/* 15m Aroma */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(hop, 'Boil', 15, 30);
                          }}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] font-medium px-2 py-1 rounded-xl border border-stone-700 hover:border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Adicionar para Sabor & Aroma (15 min)"
                        >
                          <Wind className="w-3 h-3 text-sky-400" />
                          <span>Aroma 15m</span>
                        </button>

                        {/* Whirlpool 80°C */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(hop, 'Whirlpool', 20, 50);
                          }}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          title="Adicionar no Whirlpool @ 80°C (Juicy & Aroma explosivo)"
                        >
                          <Droplets className="w-3 h-3 text-emerald-400" />
                          <span>Whirlpool 80°C</span>
                        </button>

                        {/* Dry Hop */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(hop, 'Dry Hop', 3, 50);
                          }}
                          className="bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          title="Adicionar Dry Hop (Fermentação/Maturação)"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Dry Hop</span>
                        </button>
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
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              Exibindo <strong className="text-white">{filteredHops.length}</strong> de{' '}
              <strong className="text-white">{HOPS_DATABASE.length}</strong> lúpulos mundiais.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
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

export default HopExplorerModal;
