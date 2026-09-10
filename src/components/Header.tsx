import React, { useState } from 'react';
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
  MoreHorizontal,
  X,
  ChevronRight,
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
  { id: 'home', label: 'Início', description: 'Visão geral da bancada', icon: Home },
  { id: 'architect', label: 'Receita', description: 'Ingredientes e medidas', icon: BookOpen },
  { id: 'cockpit', label: 'Brassagem', description: 'Passo a passo da panela', icon: Flame },
  { id: 'water', label: 'Água', description: 'Perfil e ajustes', icon: Droplets },
  { id: 'diagnostic', label: 'Problemas', description: 'Defeitos e correções', icon: Wrench },
  { id: 'labels', label: 'Rótulo', description: 'Identidade da cerveja', icon: Palette },
  { id: 'sheet', label: 'Ficha', description: 'Imprimir e exportar', icon: FileText },
];

const MOBILE_MAIN: AppTab[] = ['home', 'architect', 'cockpit', 'water'];

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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const goTo = (tab: AppTab) => {
    setMobileMoreOpen(false);
    onSelectTab(tab);
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.07] bg-[#090705]/[0.98] shadow-[24px_0_70px_rgba(0,0,0,0.26)] backdrop-blur-2xl lg:flex">
        <div className="relative overflow-hidden border-b border-white/[0.07] px-5 pb-5 pt-6">
          <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-amber-400/[0.08] blur-3xl" />
          <div className="relative flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-lg" />
              <DemocrataLogo size="custom" customSizePx={54} variant="circular" className="relative" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[17px] font-black tracking-[0.12em] text-[#f4d38f]">DEMOCRATA</p>
              <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.35em] text-stone-600">Bier · Caderno da casa</p>
            </div>
          </div>
          <div className="relative mt-5 h-px bg-gradient-to-r from-amber-300/25 via-white/[0.06] to-transparent" />
          <p className="relative mt-4 max-w-[200px] text-[10px] leading-relaxed text-stone-600">
            Receita, panela e histórico em um lugar só.
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ${
                  selected
                    ? 'border-amber-300/[0.17] bg-amber-300/[0.075] text-[#fff7e7]'
                    : 'border-transparent text-stone-500 hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-stone-200'
                }`}
              >
                {selected && <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,.7)]" />}
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all ${selected ? 'bg-amber-300 text-stone-950 shadow-[0_7px_22px_rgba(245,158,11,.16)]' : 'border border-white/[0.05] bg-white/[0.025] text-stone-600 group-hover:text-stone-300'}`}>
                  <Icon className="h-[16px] w-[16px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-extrabold">{item.label}</span>
                  <span className="mt-0.5 block truncate text-[9px] font-medium text-stone-600">{item.description}</span>
                </span>
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-all ${selected ? 'text-amber-200/70' : 'translate-x-1 text-stone-800 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.07] bg-black/[0.16] p-3.5">
          <div className="rounded-[22px] border border-white/[0.075] bg-[#12100d] p-3.5 shadow-[0_16px_45px_rgba(0,0,0,.22)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-stone-600">Receita aberta</p>
                <p className="mt-1 truncate text-[11px] font-extrabold text-stone-200">{currentRecipe.name}</p>
                <p className="mt-0.5 truncate text-[9px] text-stone-600">{currentRecipe.style.name}</p>
              </div>
              <button type="button" onClick={onCloneRecipe} title="Fazer uma cópia" className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-stone-600 transition-colors hover:text-amber-200">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <select
              value={currentRecipe.id}
              onChange={(e) => onSelectRecipe(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2 text-[10px] font-bold text-stone-300 outline-none focus:border-amber-300/30"
            >
              {allRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
              ))}
            </select>

            <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
              <label className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2">
                <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-stone-700">Volume do lote</span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={currentRecipe.batchSizeLiters}
                    onChange={(e) => onBatchSizeScale(Math.max(1, Number(e.target.value) || 1))}
                    className="w-12 bg-transparent font-mono text-sm font-black text-stone-100 outline-none"
                  />
                  <span className="text-[9px] font-bold text-stone-600">L</span>
                </div>
              </label>
              <button type="button" onClick={onNewRecipe} title="Nova receita" className="grid w-11 place-items-center rounded-xl bg-[#f1d17f] text-stone-950 transition-transform hover:scale-[1.03]">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onStartBrewday}
              className="brew-primary-button mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-black"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Começar brassagem
            </button>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button type="button" onClick={onOpenCalculators} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2 text-[9px] font-bold text-stone-600 transition-colors hover:text-stone-200">
              <Calculator className="h-3.5 w-3.5" /> Calculadoras
            </button>
            <button type="button" onClick={onOpenAIForge} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2 text-[9px] font-bold text-stone-600 transition-colors hover:text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> Ajuda da IA
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090705]/[0.91] backdrop-blur-2xl lg:hidden">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <DemocrataLogo size="custom" customSizePx={39} variant="circular" />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[13px] font-black tracking-[0.12em] text-[#f2d18a]">DEMOCRATA BIER</p>
            <p className="mt-0.5 truncate text-[9px] font-semibold text-stone-600">{currentRecipe.name} · {currentRecipe.batchSizeLiters} L</p>
          </div>
          <button type="button" onClick={onNewRecipe} className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300 text-stone-950 shadow-[0_8px_24px_rgba(245,158,11,.18)]" aria-label="Nova receita">
            <Plus className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {mobileMoreOpen && (
        <div className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setMobileMoreOpen(false)}>
          <div className="absolute bottom-[82px] left-3 right-3 rounded-[28px] border border-white/[0.1] bg-[#100d0a]/[0.98] p-3 shadow-[0_25px_80px_rgba(0,0,0,.58)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/65">Mais ferramentas</p>
                <p className="mt-0.5 text-[10px] text-stone-600">O que não precisa ficar na frente o tempo todo.</p>
              </div>
              <button type="button" onClick={() => setMobileMoreOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-stone-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.filter((item) => !MOBILE_MAIN.includes(item.id)).map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" onClick={() => goTo(item.id)} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-left">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-amber-200"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold text-stone-200">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[8px] text-stone-600">{item.description}</span>
                    </span>
                  </button>
                );
              })}
              <button type="button" onClick={() => { setMobileMoreOpen(false); onOpenCalculators(); }} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-emerald-300"><Calculator className="h-4 w-4" /></span>
                <span><span className="block text-[11px] font-extrabold text-stone-200">Calculadoras</span><span className="mt-0.5 block text-[8px] text-stone-600">Priming e medições</span></span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#090705]/[0.96] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(0,0,0,.36)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {MOBILE_MAIN.map((id) => {
            const item = NAV_ITEMS.find((nav) => nav.id === id)!;
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button key={item.id} type="button" onClick={() => goTo(item.id)} className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-black transition-all ${selected ? 'bg-amber-300 text-stone-950' : 'text-stone-600'}`}>
                <Icon className="h-[17px] w-[17px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setMobileMoreOpen(true)} className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-black transition-all ${!MOBILE_MAIN.includes(activeTab) ? 'bg-amber-300 text-stone-950' : 'text-stone-600'}`}>
            <MoreHorizontal className="h-[18px] w-[18px]" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
