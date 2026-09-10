import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BJCPStyle, RecipeCalculations } from '../types/brewing';
import { Sparkles, Sliders, Check, X, Wand2, Info } from 'lucide-react';

interface CustomStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: BJCPStyle;
  currentCalculations?: RecipeCalculations;
  onSaveStyle: (style: BJCPStyle) => void;
}

export const CustomStyleModal: React.FC<CustomStyleModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  currentCalculations,
  onSaveStyle,
}) => {
  const [name, setName] = useState(currentStyle?.name || 'Meu Estilo Próprio');
  const [code, setCode] = useState(currentStyle?.code || 'CUSTOM');
  const [category, setCategory] = useState(currentStyle?.category || 'Estilo Próprio / Livre');
  
  const [ogMin, setOgMin] = useState(currentStyle?.ogMin || 1.040);
  const [ogMax, setOgMax] = useState(currentStyle?.ogMax || 1.065);
  const [fgMin, setFgMin] = useState(currentStyle?.fgMin || 1.008);
  const [fgMax, setFgMax] = useState(currentStyle?.fgMax || 1.015);
  const [ibuMin, setIbuMin] = useState(currentStyle?.ibuMin || 15);
  const [ibuMax, setIbuMax] = useState(currentStyle?.ibuMax || 50);
  const [srmMin, setSrmMin] = useState(currentStyle?.srmMin || 3);
  const [srmMax, setSrmMax] = useState(currentStyle?.srmMax || 20);
  const [abvMin, setAbvMin] = useState(currentStyle?.abvMin || 4.0);
  const [abvMax, setAbvMax] = useState(currentStyle?.abvMax || 7.0);

  const [flavorProfile, setFlavorProfile] = useState(
    currentStyle?.flavorProfile || 'Cerveja autoral criada pelo Mestre Cervejeiro.'
  );

  useEffect(() => {
    if (isOpen && currentStyle) {
      setName(currentStyle.name || 'Meu Estilo Próprio');
      setCode(currentStyle.code || 'CUSTOM');
      setCategory(currentStyle.category || 'Estilo Próprio / Livre');
      setOgMin(currentStyle.ogMin || 1.040);
      setOgMax(currentStyle.ogMax || 1.065);
      setFgMin(currentStyle.fgMin || 1.008);
      setFgMax(currentStyle.fgMax || 1.015);
      setIbuMin(currentStyle.ibuMin || 15);
      setIbuMax(currentStyle.ibuMax || 50);
      setSrmMin(currentStyle.srmMin || 3);
      setSrmMax(currentStyle.srmMax || 20);
      setAbvMin(currentStyle.abvMin || 4.0);
      setAbvMax(currentStyle.abvMax || 7.0);
      setFlavorProfile(currentStyle.flavorProfile || 'Cerveja autoral criada pelo Mestre Cervejeiro.');
    }
  }, [isOpen, currentStyle]);

  if (!isOpen) return null;

  // Auto-calibrate style limits based on current recipe calculations
  const handleAutoCalibrate = () => {
    if (!currentCalculations) return;

    const { og, fg, abv, ibu, srm } = currentCalculations;

    setOgMin(Number(Math.max(og - 0.008, 1.000).toFixed(3)));
    setOgMax(Number((og + 0.008).toFixed(3)));
    
    setFgMin(Number(Math.max(fg - 0.004, 0.998).toFixed(3)));
    setFgMax(Number((fg + 0.004).toFixed(3)));

    setIbuMin(Math.max(Math.floor(ibu - 10), 0));
    setIbuMax(Math.ceil(ibu + 15));

    setSrmMin(Math.max(Math.floor(srm - 2), 1));
    setSrmMax(Math.ceil(srm + 4));

    setAbvMin(Number(Math.max(abv - 1.0, 0.1).toFixed(1)));
    setAbvMax(Number((abv + 1.0).toFixed(1)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const isExistingCustom = currentStyle.id.startsWith('custom-');
    const customStyle: BJCPStyle = {
      id: isExistingCustom ? currentStyle.id : `custom-${Date.now()}`,
      code: code.trim() || 'CUSTOM',
      name: name.trim() || 'Estilo Próprio',
      category: category.trim() || 'Estilo Próprio',
      ogMin: Number(ogMin) || 1.040,
      ogMax: Number(ogMax) || 1.065,
      fgMin: Number(fgMin) || 1.008,
      fgMax: Number(fgMax) || 1.015,
      ibuMin: Number(ibuMin) || 0,
      ibuMax: Number(ibuMax) || 100,
      srmMin: Number(srmMin) || 1,
      srmMax: Number(srmMax) || 40,
      abvMin: Number(abvMin) || 0,
      abvMax: Number(abvMax) || 15,
      flavorProfile: flavorProfile.trim(),
      aromaProfile: 'Perfil aromático personalizado.',
      appearance: 'Aparência autoral.',
      history: 'Estilo criado exclusivamente no Democrata Bier Homebrew Lab.',
      targetBuGu: Number(ibuMax) > 0 && Number(ogMax) > 1.0 ? Number((ibuMax / ((ogMax - 1) * 1000)).toFixed(2)) : 0.5,
    };

    onSaveStyle(customStyle);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-stone-900 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/70 to-stone-950 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold font-serif text-amber-300 flex items-center gap-2">
                Criar / Editar Estilo Personalizado
              </h3>
              <p className="text-xs text-stone-400">
                Crie seu próprio estilo de cerveja com nome e parâmetros customizados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Auto-Calibrate Banner */}
          {currentCalculations && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <Wand2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ajuste rápido: deseja adaptar os parâmetros para a receita atual?</span>
              </div>
              <button
                type="button"
                onClick={handleAutoCalibrate}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Auto-Calibrar Parâmetros
              </button>
            </div>
          )}

          {/* Style Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Nome do Estilo Personalizado *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Catharina Sour de Goiaba, Neipa do Danilo..."
                className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Sigla / Código
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: FREE, CUST"
                className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              Categoria / Família
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Cerveja Especial, Estilo Livre, Fruit Beer..."
              className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Metric Ranges Section */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Faixas Recomendadas do Estilo (Mín - Máx)
              </h4>
              <span className="text-[10px] text-stone-400">Usadas nos medidores de conformidade</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* OG */}
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">OG (Densidade)</span>
                <div className="space-y-1">
                  <input
                    type="number"
                    step="0.001"
                    value={ogMin}
                    onChange={(e) => setOgMin(parseFloat(e.target.value) || 1.000)}
                    placeholder="Min"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-stone-200 p-1.5 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    step="0.001"
                    value={ogMax}
                    onChange={(e) => setOgMax(parseFloat(e.target.value) || 1.100)}
                    placeholder="Max"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-stone-200 p-1.5 rounded-lg text-center"
                  />
                </div>
              </div>

              {/* FG */}
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">FG (Final)</span>
                <div className="space-y-1">
                  <input
                    type="number"
                    step="0.001"
                    value={fgMin}
                    onChange={(e) => setFgMin(parseFloat(e.target.value) || 1.000)}
                    placeholder="Min"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-stone-200 p-1.5 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    step="0.001"
                    value={fgMax}
                    onChange={(e) => setFgMax(parseFloat(e.target.value) || 1.030)}
                    placeholder="Max"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-stone-200 p-1.5 rounded-lg text-center"
                  />
                </div>
              </div>

              {/* IBU */}
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">IBU (Amargor)</span>
                <div className="space-y-1">
                  <input
                    type="number"
                    value={ibuMin}
                    onChange={(e) => setIbuMin(parseFloat(e.target.value) || 0)}
                    placeholder="Min"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-amber-300 p-1.5 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    value={ibuMax}
                    onChange={(e) => setIbuMax(parseFloat(e.target.value) || 100)}
                    placeholder="Max"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-amber-300 p-1.5 rounded-lg text-center"
                  />
                </div>
              </div>

              {/* SRM */}
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">SRM (Cor)</span>
                <div className="space-y-1">
                  <input
                    type="number"
                    value={srmMin}
                    onChange={(e) => setSrmMin(parseFloat(e.target.value) || 1)}
                    placeholder="Min"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-amber-400 p-1.5 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    value={srmMax}
                    onChange={(e) => setSrmMax(parseFloat(e.target.value) || 40)}
                    placeholder="Max"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-amber-400 p-1.5 rounded-lg text-center"
                  />
                </div>
              </div>

              {/* ABV */}
              <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">ABV (%)</span>
                <div className="space-y-1">
                  <input
                    type="number"
                    step="0.1"
                    value={abvMin}
                    onChange={(e) => setAbvMin(parseFloat(e.target.value) || 0)}
                    placeholder="Min"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-emerald-300 p-1.5 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={abvMax}
                    onChange={(e) => setAbvMax(parseFloat(e.target.value) || 20)}
                    placeholder="Max"
                    className="w-full bg-stone-900 border border-stone-700 text-xs font-mono text-emerald-300 p-1.5 rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              Perfil de Sabor & Descrição do Estilo
            </label>
            <textarea
              rows={2}
              value={flavorProfile}
              onChange={(e) => setFlavorProfile(e.target.value)}
              placeholder="Descreva as características sensoriais que espera deste estilo..."
              className="w-full bg-stone-950 border border-stone-700 p-2.5 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black text-stone-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salvar Estilo na Receita
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
