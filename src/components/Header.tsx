import React from 'react';
import { BeerRecipe } from '../types/brewing';
import {
  Home,
  BookOpen,
  Flame,
  Droplets,
  Wrench,
  Palette,
  FileText,
  Calculator,
  Plus,
  Play,
  Copy,
  Sparkles,
} from 'lucide-react';
import { DemocrataLogo } from './DemocrataLogo';

export type AppTab = 'home' | 'architect' | 'water' | 'cockpit' | 'diagnostic' | 'labels' | 'sheet';

interface HeaderProps {
  currentRecipe: BeerRecipe;
  allRecipes: BeerRecipe[];
  onSelectRecipe: (id: string) => void;
  onNewRecipe: () => void;
  onCloneRecipe: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAIForge: () => void;
  onOpenCalculators: () => void;
  onStartBrewday: () => void;
  onBatchSizeScale: (newSize: number) => void;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Início', description: 'Visão geral', icon: Home },
  { id: 'architect', label: 'Receita', description: 'Maltes, lúpulos e fermentação', icon: BookOpen },
  { id: 'cockpit', label: 'Brassagem', description: 'Passo a passo e timers', icon: Flame },
  { id: 'water', label: 'Água', description: 'Perfil e ajustes', icon: Droplets },
  { id: 'diagnostic', label: 'Problemas', description: 'Defeitos e correções', icon: Wrench },
  { id: 'labels', label: 'Rótulo', description: 'Arte da cerveja', icon: Palette },
  { id: 'sheet', label: 'Ficha', description: 'Imprimir e exportar', icon: FileText },
];

export const Header: React.FC<HeaderProps> = ({
  currentRecipe,
  allRecipes,
  onSelectRecipe,
  onNewRecipe,
  onCloneRecipe,
  activeTab,
  onSelectTab,
  onOpenAIForge,
  onOpenCalculators,
  onStartBrewday,
  onBatchSizeScale,
}) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-white/10 bg-[#0b0907]/[0.96] backdrop-blur-xl shadow-[18px_0_60px_rgba(0,0,0,0.24)]">
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <DemocrataLogo size="custom" customSizePx={54} variant="circular" />
            <div className="min-w-0">
              <p className="font-serif font-black tracking-[0.14em] text-[17px] text-[#f2cf82]">DEMOCRATA</p>
              <p className="text-[10px] uppercase tracking-[0.34em] text-stone-400 mt-0.5">Bier · Desde a panela</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Caderno de receitas e brassagens da casa.
          </p>
        </div>

        <nav className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all ${
                  selected
                    ? 'bg-amber-500/12 border border-amber-400/25 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'border border-transparent text-stone-400 hover:text-stone-100 hover:bg-white/[0.035]'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${selected ? 'bg-amber-400 text-stone-950' : 'bg-white/[0.045] text-stone-400'}`}>
                  <Icon className="w-[17px] h-[17px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">{item.label}</span>
                  <span className="block text-[10px] mt-0.5 text-stone-500 truncate">{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/8 space-y-3 bg-black/[0.15]">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-500">Receita aberta</span>
            <select
              value={currentRecipe.id}
              onChange={(e) => onSelectRecipe(e.target.value)}
              className="mt-1.5 w-full bg-stone-900 border border-stone-700/80 text-stone-100 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500/60 focus:outline-none"
            >
              {allRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className="rounded-xl bg-stone-900 border border-stone-800 px-3 py-2">
              <span className="block text-[9px] uppercase tracking-widest text-stone-500">Volume</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={currentRecipe.batchSizeLiters}
                  onChange={(e) => onBatchSizeScale(Math.max(1, Number(e.target.value) || 1))}
                  className="w-12 bg-transparent text-sm font-black text-stone-100 outline-none"
                />
                <span className="text-[10px] text-stone-500">L</span>
              </div>
            </label>
            <button type="button" onClick={onCloneRecipe} title="Duplicar receita" className="w-12 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-500/30 grid place-items-center transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onStartBrewday}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black transition-colors shadow-[0_8px_28px_rgba(245,158,11,0.16)]"
          >
            <Play className="w-4 h-4 fill-current" /> Iniciar brassagem
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={onNewRecipe} className="rounded-xl border border-stone-800 bg-stone-900 py-2 text-stone-400 hover:text-stone-100 grid place-items-center" title="Nova receita"><Plus className="w-4 h-4" /></button>
            <button type="button" onClick={onOpenCalculators} className="rounded-xl border border-stone-800 bg-stone-900 py-2 text-stone-400 hover:text-stone-100 grid place-items-center" title="Calculadoras"><Calculator className="w-4 h-4" /></button>
            <button type="button" onClick={onOpenAIForge} className="rounded-xl border border-stone-800 bg-stone-900 py-2 text-stone-400 hover:text-stone-100 grid place-items-center" title="Criar com ajuda da IA"><Sparkles className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-[#0b0907]/[0.95] backdrop-blur-xl">
        <div className="px-3 py-2.5 flex items-center gap-3">
          <DemocrataLogo size="custom" customSizePx={40} variant="circular" />
          <div className="min-w-0 flex-1">
            <p className="font-serif font-black tracking-[0.13em] text-sm text-[#f2cf82]">DEMOCRATA BIER</p>
            <p className="text-[10px] text-stone-500 truncate">{currentRecipe.name}</p>
          </div>
          <button type="button" onClick={onNewRecipe} className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 grid place-items-center shadow-lg" aria-label="Nova receita">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-2 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  selected
                    ? 'bg-amber-400 border-amber-400 text-stone-950'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
};
