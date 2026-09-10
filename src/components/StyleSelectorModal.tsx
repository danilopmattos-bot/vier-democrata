import React, { useState, useMemo } from 'react';
import { BJCPStyle } from '../types/brewing';
import { Search, X, Check, BookOpen, Sparkles, Filter, Info, ShieldCheck } from 'lucide-react';

interface StyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  styles: BJCPStyle[];
  currentStyleId: string;
  onSelectStyle: (style: BJCPStyle) => void;
  onCreateCustomStyle: () => void;
}

export const StyleSelectorModal: React.FC<StyleSelectorModalProps> = ({
  isOpen,
  onClose,
  styles,
  currentStyleId,
  onSelectStyle,
  onCreateCustomStyle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    styles.forEach((s) => set.add(s.category));
    return ['ALL', ...Array.from(set).sort()];
  }, [styles]);

  // Filter styles
  const filteredStyles = useMemo(() => {
    return styles.filter((s) => {
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesCategory;

      const matchesName = s.name.toLowerCase().includes(term);
      const matchesCode = s.code.toLowerCase().includes(term);
      const matchesCategoryName = s.category.toLowerCase().includes(term);
      const matchesFlavor = s.flavorProfile.toLowerCase().includes(term);
      const matchesAroma = s.aromaProfile.toLowerCase().includes(term);

      return matchesCategory && (matchesName || matchesCode || matchesCategoryName || matchesFlavor || matchesAroma);
    });
  }, [styles, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white flex items-center gap-2">
                Explorador Guia BJCP 2021
                <span className="text-xs font-mono font-normal bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {styles.length} Estilos
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Selecione o estilo guia para calibrar sua receita artesanal ou crie seu estilo customizado.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-stone-950/50 border-b border-stone-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por estilo (ex: Munich Helles, Hazy, Pilsen, Stout, 4A, 21A)..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Style Button */}
            <button
              onClick={() => {
                onClose();
                onCreateCustomStyle();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Criar Estilo Customizado</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-stone-500 font-semibold flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3" /> Categoria:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat === 'ALL' ? 'Todos os Estilos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Styles Grid List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredStyles.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Info className="w-8 h-8 mx-auto text-stone-600" />
              <p className="text-sm font-medium">Nenhum estilo encontrado para "{searchTerm}"</p>
              <p className="text-xs">Tente pesquisar termos mais genéricos ou escolha outra categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStyles.map((st) => {
                const isSelected = st.id === currentStyleId;

                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectStyle(st);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-stone-950/60 border-stone-800/80 hover:border-amber-500/40 hover:bg-stone-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-stone-900 text-amber-400 px-2 py-0.5 rounded border border-stone-700">
                            {st.code}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            {st.category}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            <Check className="w-3 h-3" /> Selecionado
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {st.name}
                      </h3>

                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {st.flavorProfile || st.aromaProfile}
                      </p>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-3 pt-2.5 border-t border-stone-800/60 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                        <span className="text-stone-500 block text-[9px]">OG</span>
                        <span className="text-amber-200 font-bold">{st.ogMin.toFixed(3)}-{st.ogMax.toFixed(3)}</span>
                      </div>
                      <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                        <span className="text-stone-500 block text-[9px]">ABV</span>
                        <span className="text-amber-200 font-bold">{st.abvMin}-{st.abvMax}%</span>
                      </div>
                      <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                        <span className="text-stone-500 block text-[9px]">IBU</span>
                        <span className="text-amber-200 font-bold">{st.ibuMin}-{st.ibuMax}</span>
                      </div>
                      <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                        <span className="text-stone-500 block text-[9px]">SRM</span>
                        <span className="text-amber-200 font-bold">{st.srmMin}-{st.srmMax}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guia Oficial BJCP 2021 + Estilos Brasileiros & Contemporâneos</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
