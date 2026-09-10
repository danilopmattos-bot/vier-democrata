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
  Sparkles,
  Wheat,
} from 'lucide-react';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { DemocrataLogo } from './DemocrataLogo';
import { HeroBeerStage } from './HeroBeerStage';
import breweryScene from '../assets/images/brewmaster_cinematic_1787487688648.jpg';

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const Metric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#15110d]/90 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/20 hover:bg-[#19140f] sm:p-5">
    <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-amber-300/[0.05] blur-2xl transition-opacity group-hover:opacity-100" />
    <p className="relative text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">{label}</p>
    <p className="relative mt-2 font-mono text-xl font-black tracking-[-0.04em] text-[#fff6e5] sm:text-[1.65rem]">{value}</p>
    <p className="relative mt-1 text-[10px] text-stone-600">{detail}</p>
  </div>
);

const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative min-h-[134px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/20 hover:bg-white/[0.05] sm:p-5"
  >
    <div className="mb-5 grid h-10 w-10 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.08] text-amber-200 transition-transform duration-300 group-hover:scale-105">
      <Icon className="h-[18px] w-[18px]" />
    </div>
    <p className="text-sm font-black text-stone-100">{title}</p>
    <p className="mt-1 text-[10px] leading-relaxed text-stone-500">{description}</p>
    <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 -translate-x-1 text-stone-700 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-amber-300 group-hover:opacity-100" />
  </button>
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
    <div className="space-y-5 sm:space-y-7">
      <section className="brew-hero relative isolate min-h-[610px] overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#100c08] shadow-[0_35px_120px_rgba(0,0,0,0.52)] sm:rounded-[38px] lg:min-h-[590px]">
        <img
          src={breweryScene}
          alt="Ambiente de cervejaria artesanal"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.42] saturate-[0.86] lg:object-[72%_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d0906_0%,rgba(13,9,6,.97)_34%,rgba(13,9,6,.70)_59%,rgba(13,9,6,.24)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#0d0906_0%,transparent_35%,rgba(0,0,0,.28)_100%)]" />
        <div className="brew-noise absolute inset-0 opacity-[0.13]" />
        <div className="pointer-events-none absolute -left-28 top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-amber-500/[0.11] blur-[110px]" />
        <div className="pointer-events-none absolute bottom-[-12rem] right-[5%] h-[32rem] w-[32rem] rounded-full bg-orange-600/[0.09] blur-[130px]" />

        <div className="relative z-10 grid min-h-[610px] lg:min-h-[590px] lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex flex-col justify-center px-6 pb-5 pt-9 sm:px-9 lg:px-12 xl:px-14">
            <div className="mb-8 flex items-center gap-3.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-300/25 blur-xl" />
                <DemocrataLogo size="custom" customSizePx={56} variant="circular" className="relative" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-200/75">Democrata Bier</p>
                <p className="mt-1 text-[11px] font-semibold text-stone-500">{getGreeting()}. A bancada está pronta.</p>
              </div>
            </div>

            <div className="max-w-[680px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/[0.16] bg-amber-300/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" /> Caderno de receitas & brassagens
              </span>

              <h1 className="mt-5 max-w-[650px] font-serif text-[2.7rem] font-black leading-[0.94] tracking-[-0.05em] text-[#fff8eb] sm:text-[4rem] lg:text-[4.45rem] xl:text-[4.9rem]">
                Cerveja de verdade.<br />
                <span className="brew-gold-text">Processo do seu jeito.</span>
              </h1>

              <p className="mt-6 max-w-[560px] text-sm leading-7 text-stone-400 sm:text-[15px]">
                Receita, água, fermentação e o passo a passo da panela. Tudo organizado para você repetir o que ficou bom e melhorar o próximo lote.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartBrewday}
                className="brew-primary-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black"
              >
                <Flame className="h-[18px] w-[18px]" /> Começar brassagem
              </button>
              <button
                type="button"
                onClick={onOpenRecipe}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-black/30 px-6 py-3.5 text-sm font-extrabold text-stone-100 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]"
              >
                Abrir receita <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold text-stone-600">
              <span className="inline-flex items-center gap-1.5"><Beer className="h-3.5 w-3.5 text-amber-500/70" /> {recipes.length} receitas salvas</span>
              <span className="inline-flex items-center gap-1.5"><Wheat className="h-3.5 w-3.5 text-amber-500/70" /> {calculations.totalGrainKg.toFixed(1)} kg de malte no lote</span>
            </div>
          </div>

          <div className="relative flex items-end justify-center px-4 pb-7 pt-2 sm:px-8 lg:items-center lg:pb-6 lg:pt-6">
            <div className="absolute inset-x-10 bottom-6 top-10 rounded-[36px] border border-white/[0.06] bg-black/[0.14] backdrop-blur-[2px] lg:inset-x-7" />
            <HeroBeerStage
              srm={calculations.srm}
              abv={calculations.abv}
              ibu={calculations.ibu}
              name={currentRecipe.name}
              styleName={currentRecipe.style.name}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="Densidade inicial" value={calculations.og.toFixed(3)} detail="OG prevista" />
        <Metric label="Densidade final" value={calculations.fg.toFixed(3)} detail="FG prevista" />
        <Metric label="Álcool" value={`${calculations.abv.toFixed(1)}%`} detail="ABV estimado" />
        <Metric label="Amargor" value={`${Math.round(calculations.ibu)} IBU`} detail="Receita atual" />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.18fr_.82fr]">
        <article className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#14100c] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="pointer-events-none absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-amber-500/[0.07] blur-3xl" />
          <div className="relative">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-300/70">Na bancada agora</p>
                <h2 className="mt-2 truncate font-serif text-2xl font-black tracking-[-0.025em] text-[#fff7e7] sm:text-[2rem]">{currentRecipe.name}</h2>
                <p className="mt-1.5 text-xs font-semibold text-stone-500">{currentRecipe.style.name}</p>
              </div>
              <div className="shrink-0 rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.07] px-3 py-2 text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-stone-500">Lote planejado</p>
                <p className="mt-1 font-mono text-lg font-black text-amber-200">{currentRecipe.batchSizeLiters} L</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/[0.06] bg-black/[0.22] p-3.5">
                <p className="text-[9px] font-bold text-stone-600">Eficiência</p>
                <p className="mt-1 font-mono text-sm font-black text-stone-200">{currentRecipe.efficiencyPercent}%</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/[0.22] p-3.5">
                <p className="text-[9px] font-bold text-stone-600">Maltes</p>
                <p className="mt-1 font-mono text-sm font-black text-stone-200">{calculations.totalGrainKg.toFixed(2)} kg</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/[0.22] p-3.5">
                <p className="text-[9px] font-bold text-stone-600">Lúpulos</p>
                <p className="mt-1 font-mono text-sm font-black text-stone-200">{Math.round(calculations.totalHopsGrams)} g</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/[0.22] p-3.5">
                <p className="text-[9px] font-bold text-stone-600">Fervura</p>
                <p className="mt-1 font-mono text-sm font-black text-stone-200">{currentRecipe.boilTimeMinutes || 60} min</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={onOpenRecipe} className="inline-flex items-center gap-2 rounded-xl bg-[#f4ead8] px-4 py-2.5 text-xs font-black text-stone-950 transition-colors hover:bg-white">
                <BookOpen className="h-4 w-4" /> Editar receita
              </button>
              <button type="button" onClick={onCloneRecipe} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-stone-300 transition-all hover:border-white/[0.14] hover:text-white">
                <Copy className="h-4 w-4" /> Fazer uma cópia
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/[0.08] bg-[#14100c] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-stone-600">Banco de receitas</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="font-serif text-3xl font-black text-[#fff6e5]">{recipes.length}</p>
                <p className="pb-1 text-[10px] font-semibold text-stone-600">salvas</p>
              </div>
            </div>
            <button type="button" onClick={onNewRecipe} className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300 text-stone-950 shadow-[0_10px_28px_rgba(245,158,11,0.16)] transition-transform hover:scale-105" aria-label="Criar nova receita">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            {recipes.slice(0, 4).map((recipe, index) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => {
                  onSelectRecipe(recipe.id);
                  onOpenRecipe();
                }}
                className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                  recipe.id === currentRecipe.id
                    ? 'border-amber-300/20 bg-amber-300/[0.065]'
                    : 'border-white/[0.06] bg-black/[0.16] hover:border-white/[0.11] hover:bg-white/[0.03]'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-mono text-[10px] font-black ${recipe.id === currentRecipe.id ? 'bg-amber-300 text-stone-950' : 'bg-white/[0.045] text-stone-600'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold text-stone-200">{recipe.name}</span>
                  <span className="mt-1 block truncate text-[9px] font-semibold text-stone-600">{recipe.style.name} · {recipe.batchSizeLiters} L</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-700 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-300" />
              </button>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-stone-600">Atalhos da bancada</p>
            <p className="mt-1 text-xs text-stone-500">Chegue no que você precisa sem procurar em menu.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <QuickAction icon={Plus} title="Nova receita" description="Começar uma cerveja do zero." onClick={onNewRecipe} />
          <QuickAction icon={Droplets} title="Ajustar água" description="Perfil, sais e volume de água." onClick={onOpenWater} />
          <QuickAction icon={Calculator} title="Calculadoras" description="Priming, diluição e medições." onClick={onOpenCalculators} />
          <QuickAction icon={Gauge} title="Conferir receita" description="Ingredientes e números do lote." onClick={onOpenRecipe} />
        </div>
      </section>
    </div>
  );
};
