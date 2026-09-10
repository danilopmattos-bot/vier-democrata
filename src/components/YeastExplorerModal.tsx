import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YeastProfile } from '../types/brewing';
import { YEAST_DATABASE } from '../data/ingredients';
import {
  Search,
  X,
  Check,
  Dna,
  Thermometer,
  Percent,
  Sparkles,
  Layers,
  FlaskConical,
  Activity,
  Flame,
  Shield,
} from 'lucide-react';
import { triggerWaterWave } from '../utils/dopamineEffects';

interface YeastExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYeastId: string;
  onSelectYeast: (yeast: YeastProfile) => void;
}

export const YeastExplorerModal: React.FC<YeastExplorerModalProps> = ({
  isOpen,
  onClose,
  selectedYeastId,
  onSelectYeast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todos');
  const [justSelectedId, setJustSelectedId] = useState<string | null>(null);

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

  const types = [
    { label: 'Todas as Cepas', value: 'Todos' },
    { label: 'Ale (American/British)', value: 'Ale' },
    { label: 'Lager & Pilsner', value: 'Lager' },
    { label: 'Kveik Norueguesa', value: 'Kveik' },
    { label: 'Trigo & Weizen', value: 'Wheat' },
    { label: 'Belga & Abadia', value: 'Belgian' },
    { label: 'Sour & Selvagem', value: 'Sour/Wild' },
  ];

  const brands = ['Todos', 'Fermentis', 'Lallemand', 'Omega', 'White Labs', 'Wyeast'];

  const filteredYeasts = useMemo(() => {
    return YEAST_DATABASE.filter((yeast) => {
      // Type filter
      if (selectedType !== 'Todos' && !yeast.type.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'Todos') {
        if (!yeast.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
          return false;
        }
      }

      // Search filter (name, strain, notes, brand)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = yeast.name.toLowerCase().includes(term);
        const matchStrain = yeast.strain.toLowerCase().includes(term);
        const matchBrand = yeast.brand.toLowerCase().includes(term);
        const matchNotes = yeast.notes.toLowerCase().includes(term);
        return matchName || matchStrain || matchBrand || matchNotes;
      }

      return true;
    });
  }, [searchTerm, selectedType, selectedBrand]);

  if (!isOpen) return null;

  const handleApplyYeast = (y: YeastProfile) => {
    onSelectYeast(y);
    triggerWaterWave(0.5, 0.4);
    setJustSelectedId(y.id);
    setTimeout(() => {
      setJustSelectedId(null);
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

      <div className="relative z-10 w-full max-w-5xl h-[90vh] sm:h-[92vh] max-h-[92vh] flex flex-col bg-stone-900 border border-purple-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden workbench-bezel">
        {/* Physical Screws (non-blocking) */}
        <span className="rivet-screw top-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw top-2.5 right-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 right-2.5 pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-purple-950/40 to-stone-950 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-inner shrink-0">
              <Dna className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-purple-400">
                  Biologia & Microbiologia Viva
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 font-bold hidden xs:inline-block">
                  {YEAST_DATABASE.length} Cepas
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-serif tracking-wide">
                Catálogo Mundial de Leveduras Cervejeiras
              </h2>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="z-20 flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
            title="Fechar (Esc)"
            aria-label="Fechar catálogo de leveduras"
          >
            <X className="w-4 h-4 text-purple-400" />
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
              <Search className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar levedura por cepa, perfil ou laboratório (ex: US-05, Kveik, London Fog, W-34/70, Banana...)"
                className="w-full bg-stone-900 border-2 border-stone-700 text-stone-100 text-xs sm:text-sm rounded-xl pl-11 pr-10 py-2.5 sm:py-3 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 shadow-inner placeholder:text-stone-400 min-h-[44px]"
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
              className="bg-purple-500 hover:bg-purple-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px] active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </button>
          </form>

          {/* Quick Filter Pills (Types + Brands) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Type Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin">
              {types.map((t) => {
                const isSelected = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-bold'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Brand Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {brands.map((b) => {
                const isSelected = selectedBrand === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer border shrink-0 ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold'
                        : 'bg-stone-900/90 text-stone-400 hover:text-stone-300 border-stone-800'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 min-h-0">
          {filteredYeasts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Dna className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-300 font-medium text-sm">
                Nenhuma levedura encontrada para "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('Todos');
                  setSelectedBrand('Todos');
                }}
                className="text-xs text-purple-400 hover:underline font-mono cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredYeasts.map((yeast) => {
                const isSelectedCurrent = selectedYeastId === yeast.id;
                const isJustApplied = justSelectedId === yeast.id;

                return (
                  <div
                    key={yeast.id}
                    onClick={() => handleApplyYeast(yeast)}
                    className={`relative bg-stone-950/80 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-xl cursor-pointer ${
                      isJustApplied || isSelectedCurrent
                        ? 'border-purple-400 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'border-stone-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base font-serif tracking-wide">
                              {yeast.name}
                            </h3>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-stone-900 text-purple-300 border border-stone-700">
                              {yeast.strain}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800">
                              {yeast.brand}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              {yeast.type}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-purple-200 border border-stone-800">
                              {yeast.alcoholTolerance}% ABV máx
                            </span>
                          </div>
                        </div>

                        {/* Attenuation Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-black text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-xl border border-purple-500/40 inline-block shadow-inner">
                            {yeast.attenuationAvg}% <span className="text-[9px] font-normal text-purple-200">Aten.</span>
                          </span>
                        </div>
                      </div>

                      {/* Description & Flavour profile */}
                      <p className="text-xs text-stone-300 font-medium mt-2 leading-relaxed">
                        {yeast.notes}
                      </p>

                      {/* Technical Specs: Temp & Flocculation */}
                      <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px] font-mono">
                        <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800 flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div>
                            <span className="text-[9px] text-stone-500 block">Faixa Ideal</span>
                            <span className="text-stone-200 font-bold">
                              {yeast.optimalTempMin}°C - {yeast.optimalTempMax}°C
                            </span>
                          </div>
                        </div>

                        <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <div>
                            <span className="text-[9px] text-stone-500 block">Floculação</span>
                            <span className="text-stone-200 font-bold">
                              {yeast.flocculation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-stone-500">
                        {isSelectedCurrent ? '✓ Cepa ativa na receita' : 'Clique no card ou botão para aplicar'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyYeast(yeast);
                        }}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
                          isSelectedCurrent || isJustApplied
                            ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                            : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSelectedCurrent ? 'Cepa Selecionada' : 'Selecionar Esta Cepa'}</span>
                      </button>
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
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>
              Exibindo <strong className="text-white">{filteredYeasts.length}</strong> de{' '}
              <strong className="text-white">{YEAST_DATABASE.length}</strong> cepas catalogadas.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-purple-500 hover:bg-purple-400 text-stone-950 font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
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

export default YeastExplorerModal;
