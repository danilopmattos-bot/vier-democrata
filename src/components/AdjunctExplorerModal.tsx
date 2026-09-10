import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MISC_DATABASE, MiscIngredientItem } from '../data/ingredients';
import {
  Search,
  X,
  Plus,
  Sparkles,
  FlaskConical,
  Flame,
  Check,
  Tag,
  Clock,
  Droplets,
  Layers,
} from 'lucide-react';
import { triggerGrainCrack } from '../utils/dopamineEffects';

interface AdjunctExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNoteOrAdjunct?: (item: MiscIngredientItem) => void;
}

export const AdjunctExplorerModal: React.FC<AdjunctExplorerModalProps> = ({
  isOpen,
  onClose,
  onAddNoteOrAdjunct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

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

  const categories = [
    'Todos',
    'Especiarias & Ervas',
    'Madeiras Nobres',
    'Cacau & Café',
    'Frutas & Vegetais',
    'Açúcares & Doces',
    'Sais & Clarificantes',
  ];

  const filteredItems = useMemo(() => {
    return MISC_DATABASE.filter((item) => {
      // Category filter
      if (selectedCategory !== 'Todos' && item.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(term);
        const matchNotes = item.notes.toLowerCase().includes(term);
        const matchCategory = item.category.toLowerCase().includes(term);
        const matchSensory = item.sensoryImpact.some((s) => s.toLowerCase().includes(term));
        return matchName || matchNotes || matchCategory || matchSensory;
      }

      return true;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  const handleAdd = (item: MiscIngredientItem) => {
    if (onAddNoteOrAdjunct) {
      onAddNoteOrAdjunct(item);
    }
    triggerGrainCrack(0.5, 0.4);
    setJustAddedId(item.id);
    setTimeout(() => {
      setJustAddedId(null);
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

      <div className="relative z-10 w-full max-w-5xl h-[90vh] sm:h-[92vh] max-h-[92vh] flex flex-col bg-stone-900 border border-teal-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden workbench-bezel">
        {/* Corner Rivets (non-blocking) */}
        <span className="rivet-screw top-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw top-2.5 right-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 left-2.5 pointer-events-none" />
        <span className="rivet-screw bottom-2.5 right-2.5 pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-teal-950/40 to-stone-950 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-inner shrink-0">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-teal-400">
                  Frutas, Especiarias & Outros
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30 font-bold hidden xs:inline-block">
                  {MISC_DATABASE.length} Ingredientes
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-serif tracking-wide">
                Catálogo de Madeiras, Frutas, Cacau & Especiarias
              </h2>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="z-20 flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
            title="Fechar (Esc)"
            aria-label="Fechar catálogo de adjuntos"
          >
            <X className="w-4 h-4 text-teal-400" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-3 sm:p-5 bg-stone-950/90 border-b border-stone-800/80 space-y-3 shrink-0">
          {/* Main Search Input Form with Button */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por especiaria, madeira ou fruta (ex: Amburana, Cumaru, Coentro, Carvalho, Cacau, Café, Baunilha, Maracujá...)"
                className="w-full bg-stone-900 border-2 border-stone-700 text-stone-100 text-xs sm:text-sm rounded-xl pl-11 pr-10 py-2.5 sm:py-3 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 shadow-inner placeholder:text-stone-400 min-h-[44px]"
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
              className="bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px] active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Pesquisar</span>
            </button>
          </form>

          {/* Quick Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-xl font-medium transition-all shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)] font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 min-h-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FlaskConical className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-300 font-medium text-sm">
                Nenhum ingrediente encontrado para "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos');
                }}
                className="text-xs text-teal-400 hover:underline font-mono cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => {
                const isAdded = justAddedId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAdd(item)}
                    className={`relative bg-stone-950/80 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-xl cursor-pointer ${
                      isAdded
                        ? 'border-teal-400 bg-teal-950/20 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                        : 'border-stone-800 hover:border-teal-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base font-serif tracking-wide">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800">
                              Uso: {item.stage}
                            </span>
                          </div>
                        </div>

                        {/* Recommended Dosage Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-1 rounded-xl border border-teal-500/30 inline-block">
                            {item.dosageRecommended}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-300 font-medium mt-2 leading-relaxed">
                        {item.notes}
                      </p>

                      {/* Sensory Impact Badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {item.sensoryImpact.map((impact) => (
                          <span
                            key={impact}
                            className="text-[10px] font-mono bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800 text-teal-200/90"
                          >
                            {impact}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-stone-500">
                        {item.dosageRecommended}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className="bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-teal-400" />
                        )}
                        <span>{isAdded ? 'Anotado!' : 'Anotar na Receita'}</span>
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
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>
              Exibindo <strong className="text-white">{filteredItems.length}</strong> de{' '}
              <strong className="text-white">{MISC_DATABASE.length}</strong> ingredientes alquímicos.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-400 text-stone-950 font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
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

export default AdjunctExplorerModal;
