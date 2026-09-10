import React from 'react';
import {
  ArrowRight,
  Beer,
  BookOpen,
  Calculator,
  Copy,
  Droplets,
  Flame,
  Gauge,
  Plus,
  Wheat,
} from 'lucide-react';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { DemocrataLogo } from './DemocrataLogo';

interface DashboardHomeProps {
  currentRecipe: BeerRecipe;
  recipes: BeerRecipe[];
  calculations: RecipeCalculations;
  onSelectRecipe: (id: string) => void;
  onOpenRecipe: () => void;
  onStartBrewday: () => void;
  onOpenWater: () => void;
  onOpenCalculators: () => void;
  onNewRecipe: () => void;
  onCloneRecipe: () => void;
}

const Metric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
    <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold">{label}</p>
    <p className="mt-1.5 text-xl sm:text-2xl font-black text-stone-100 font-mono">{value}</p>
    <p className="mt-0.5 text-[10px] text-stone-500">{detail}</p>
  </div>
);

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentRecipe,
  recipes,
  calculations,
  onSelectRecipe,
  onOpenRecipe,
  onStartBrewday,
  onOpenWater,
  onOpenCalculators,
  onNewRecipe,
  onCloneRecipe,
}) => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] border border-amber-300/15 bg-[#13100c] shadow-[0_24px_90px_rgba(0,0,0,0.34)] min-h-[420px]">
        <div className="absolute inset-0 lg:left-[54%]">
          <img
            src="/brewmaster.jpg"
            alt="Cervejeiro da Democrata Bier com uma cerveja da casa"
            className="w-full h-full object-cover object-center opacity-60 lg:opacity-85 scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13100c] via-[#13100c]/80 to-[#13100c]/20 lg:from-[#13100c] lg:via-[#13100c]/55 lg:to-black/[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13100c] via-transparent to-black/20" />
        </div>
        <div className="absolute -left-16 -top-20 w-80 h-80 rounded-full bg-amber-400/8 blur-3xl" />

        <div className="relative z-10 p-6 sm:p-9 lg:p-12 max-w-3xl min-h-[420px] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <DemocrataLogo size="custom" customSizePx={50} variant="circular" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] font-black text-amber-300">Caderno de brassagens</p>
              <p className="text-xs text-stone-500 mt-1">Feito para a Democrata Bier</p>
            </div>
          </div>

          <h1 className="font-serif text-[2.35rem] leading-[0.98] sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-[#fff8ea] max-w-2xl">
            Do grão ao copo,<br /><span className="text-amber-300">tudo no lugar.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-stone-300/85">
            Receitas, medidas e passo a passo da brassagem em um só lugar — sem complicar o que você já sabe fazer.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={onStartBrewday} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-5 py-3.5 text-sm font-black text-stone-950 transition-colors shadow-[0_12px_35px_rgba(245,158,11,0.18)]">
              <Flame className="w-4 h-4" /> Iniciar brassagem
            </button>
            <button type="button" onClick={onOpenRecipe} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-black/[0.25] hover:bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-stone-100 transition-colors backdrop-blur-md">
              Abrir receita <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric label="Densidade inicial" value={calculations.og.toFixed(3)} detail="OG estimada" />
        <Metric label="Densidade final" value={calculations.fg.toFixed(3)} detail="FG estimada" />
        <Metric label="Álcool" value={`${calculations.abv.toFixed(1)}%`} detail="ABV estimado" />
        <Metric label="Amargor" value={`${Math.round(calculations.ibu)} IBU`} detail="Receita atual" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 rounded-[28px] border border-white/8 bg-[#12100d]/90 p-5 sm:p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-400/80 font-black">Na bancada agora</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-black text-stone-100 truncate">{currentRecipe.name}</h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-500">{currentRecipe.style.name}</p>
            </div>
            <div className="hidden sm:grid w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-300/15 place-items-center text-amber-300">
              <Beer className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-black/[0.22] border border-white/6 p-3">
              <p className="text-[10px] text-stone-500">Volume</p>
              <p className="mt-1 font-mono font-black text-stone-200">{currentRecipe.batchSizeLiters} L</p>
            </div>
            <div className="rounded-2xl bg-black/[0.22] border border-white/6 p-3">
              <p className="text-[10px] text-stone-500">Eficiência</p>
              <p className="mt-1 font-mono font-black text-stone-200">{currentRecipe.efficiencyPercent}%</p>
            </div>
            <div className="rounded-2xl bg-black/[0.22] border border-white/6 p-3">
              <p className="text-[10px] text-stone-500">Maltes</p>
              <p className="mt-1 font-mono font-black text-stone-200">{calculations.totalGrainKg.toFixed(2)} kg</p>
            </div>
            <div className="rounded-2xl bg-black/[0.22] border border-white/6 p-3">
              <p className="text-[10px] text-stone-500">Lúpulos</p>
              <p className="mt-1 font-mono font-black text-stone-200">{Math.round(calculations.totalHopsGrams)} g</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={onOpenRecipe} className="inline-flex items-center gap-2 rounded-xl bg-stone-100 text-stone-950 px-4 py-2.5 text-xs font-black hover:bg-white transition-colors">
              <BookOpen className="w-4 h-4" /> Editar receita
            </button>
            <button type="button" onClick={onCloneRecipe} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/8 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors">
              <Copy className="w-4 h-4" /> Fazer uma cópia
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-[28px] border border-white/8 bg-[#12100d]/90 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-black">Receitas salvas</p>
              <p className="mt-1 text-3xl font-black font-serif text-stone-100">{recipes.length}</p>
            </div>
            <button type="button" onClick={onNewRecipe} className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 grid place-items-center hover:bg-amber-300" aria-label="Criar nova receita">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {recipes.slice(0, 4).map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => {
                  onSelectRecipe(recipe.id);
                  onOpenRecipe();
                }}
                className={`w-full rounded-2xl border p-3 text-left transition-colors ${recipe.id === currentRecipe.id ? 'border-amber-400/20 bg-amber-400/[0.06]' : 'border-white/6 bg-black/[0.15] hover:bg-white/[0.035]'}`}
              >
                <p className="text-sm font-extrabold text-stone-200 truncate">{recipe.name}</p>
                <p className="mt-1 text-[10px] text-stone-500 truncate">{recipe.style.name} · {recipe.batchSizeLiters} L</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <button type="button" onClick={onNewRecipe} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left hover:bg-white/[0.055] transition-colors">
          <Plus className="w-5 h-5 text-amber-300" />
          <p className="mt-3 text-sm font-black text-stone-200">Nova receita</p>
          <p className="mt-1 text-[10px] text-stone-500">Começar uma cerveja nova.</p>
        </button>
        <button type="button" onClick={onOpenWater} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left hover:bg-white/[0.055] transition-colors">
          <Droplets className="w-5 h-5 text-sky-300" />
          <p className="mt-3 text-sm font-black text-stone-200">Ajustar água</p>
          <p className="mt-1 text-[10px] text-stone-500">Perfil e sais da receita.</p>
        </button>
        <button type="button" onClick={onOpenCalculators} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left hover:bg-white/[0.055] transition-colors">
          <Calculator className="w-5 h-5 text-emerald-300" />
          <p className="mt-3 text-sm font-black text-stone-200">Calculadoras</p>
          <p className="mt-1 text-[10px] text-stone-500">Priming, diluição e mais.</p>
        </button>
        <button type="button" onClick={onOpenRecipe} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left hover:bg-white/[0.055] transition-colors">
          <Gauge className="w-5 h-5 text-violet-300" />
          <p className="mt-3 text-sm font-black text-stone-200">Conferir receita</p>
          <p className="mt-1 text-[10px] text-stone-500">Veja medidas e ingredientes.</p>
        </button>
      </section>
    </div>
  );
};
