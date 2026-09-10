import React, { useState } from 'react';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

interface HomebrewBannerProps {
  onOpenAIForge: () => void;
  recipeName: string;
  styleName: string;
}

const HOMEBREW_TIPS = [
  'Fervura vigorosa e sem tampa ajuda a eliminar compostos indesejados do mosto.',
  'Sanitização bem feita depois da fervura vale mais do que equipamento caro.',
  'Anote o que mudou em cada lote. A melhor receita costuma nascer dessas pequenas comparações.',
  'Temperatura estável na fermentação costuma trazer mais resultado que inventar moda no final do processo.',
];

export const HomebrewBanner: React.FC<HomebrewBannerProps> = ({ onOpenAIForge, recipeName, styleName }) => {
  const [tipIndex, setTipIndex] = useState(0);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#15120e] p-5 sm:p-6 shadow-xl">
      <div className="pointer-events-none absolute right-[-5rem] top-[-8rem] h-64 w-64 rounded-full bg-amber-400/[0.07] blur-3xl" />
      <div className="relative z-10 grid gap-5 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400/80">Receita aberta</p>
          <h2 className="mt-2 truncate font-serif text-2xl font-black text-stone-100 sm:text-3xl">{recipeName}</h2>
          <p className="mt-1 text-xs text-stone-500">{styleName}</p>
        </div>

        <button
          type="button"
          onClick={() => setTipIndex((tipIndex + 1) % HOMEBREW_TIPS.length)}
          className="group rounded-2xl border border-white/8 bg-black/20 p-4 text-left transition-colors hover:bg-white/[0.035]"
          title="Mostrar outra dica"
        >
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
            <Lightbulb className="h-3.5 w-3.5 text-amber-300" /> Dica de brassagem
          </span>
          <span className="mt-2 block text-xs leading-relaxed text-stone-300">{HOMEBREW_TIPS[tipIndex]}</span>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-300/75">Outra dica <ArrowRight className="h-3 w-3" /></span>
        </button>

        <button
          type="button"
          onClick={onOpenAIForge}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-5 py-3.5 text-xs font-black text-amber-200 transition-colors hover:bg-amber-300/[0.13]"
        >
          <Sparkles className="h-4 w-4" /> Criar com ajuda da IA
        </button>
      </div>
    </section>
  );
};
