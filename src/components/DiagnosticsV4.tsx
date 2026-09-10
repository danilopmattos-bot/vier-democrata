import React, { useMemo, useState } from 'react';
import { AlertTriangle, Search, ShieldCheck, Wrench } from 'lucide-react';
import type { BeerRecipe, OffFlavorGuide } from '../types/brewing';
import { OFF_FLAVORS_GUIDE } from '../data/ingredients';

interface DiagnosticsV4Props {
  recipe: BeerRecipe;
}

const quickTerms = ['manteiga', 'maçã verde', 'milho', 'solvente', 'papelão', 'azedo', 'fenólico', 'vegetal', 'metálico'];

const scoreGuide = (guide: OffFlavorGuide, query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const haystack = [guide.namePt, guide.nameEn, guide.sensory, guide.chemical, ...guide.causes].join(' ').toLowerCase();
  return q.split(/\s+/).reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
};

export const DiagnosticsV4: React.FC<DiagnosticsV4Props> = ({ recipe }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const ranked = useMemo(() => OFF_FLAVORS_GUIDE
    .map((guide) => ({ guide, score: scoreGuide(guide, query) }))
    .filter((item) => !query.trim() || item.score > 0)
    .sort((a, b) => b.score - a.score), [query]);

  const selected = OFF_FLAVORS_GUIDE.find((guide) => guide.id === selectedId) || ranked[0]?.guide;

  return (
    <div className="space-y-5">
      <section className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Diagnóstico prático</p>
        <h1 className="mt-2 font-serif text-3xl font-black text-[#f2e7d2]">O que você percebeu?</h1>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">Descreva o aroma ou sabor, não tente adivinhar o nome químico. A Democrata cruza sua percepção com o guia e mostra hipóteses, ações e limitações.</p>
        <div className="relative mt-5 max-w-2xl"><Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-600" /><input value={query} onChange={(e) => { setQuery(e.target.value); setSelectedId(''); }} className="v4-input pl-10" placeholder="Ex.: cheiro de manteiga, maçã verde, papelão…" /></div>
        <div className="mt-3 flex flex-wrap gap-2">{quickTerms.map((term) => <button key={term} type="button" onClick={() => { setQuery(term); setSelectedId(''); }} className="border border-white/[0.08] bg-black/15 px-3 py-1.5 text-[10px] font-bold text-stone-500 hover:border-[#bd6c32]/40 hover:text-stone-300">{term}</button>)}</div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit border border-white/[0.08] bg-[#100e0b] p-2 xl:sticky xl:top-[145px]">
          <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-stone-700">{query ? `${ranked.length} hipóteses` : 'Guia de defeitos'}</p>
          {(query ? ranked.map((item) => item.guide) : OFF_FLAVORS_GUIDE).map((guide) => <button key={guide.id} type="button" onClick={() => setSelectedId(guide.id)} className={`block w-full border-t border-white/[0.05] px-3 py-3 text-left first:border-t-0 ${selected?.id === guide.id ? 'bg-[#291a11]' : 'hover:bg-white/[0.025]'}`}><strong className="text-xs text-stone-300">{guide.namePt}</strong><small className="mt-1 block text-[9px] text-stone-700">{guide.sensory}</small></button>)}
          {query && ranked.length === 0 && <p className="p-4 text-xs leading-6 text-stone-600">Nada bateu claramente. Tente uma descrição mais simples do aroma/sabor ou navegue pelo guia.</p>}
        </aside>

        {selected ? <section className="border border-white/[0.08] bg-[#14110d]">
          <header className="border-b border-white/[0.08] p-5 sm:p-7"><div className="flex items-start gap-3"><Wrench className="mt-1 h-5 w-5 shrink-0 text-[#bd6c32]" /><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Hipótese de diagnóstico</p><h2 className="mt-1 font-serif text-3xl font-black text-[#f2e7d2]">{selected.namePt}</h2><p className="mt-1 text-[10px] text-stone-600">{selected.nameEn} · {selected.chemical}</p></div></div></header>
          <div className="grid gap-px bg-white/[0.06] md:grid-cols-2">
            <DiagnosticBlock title="O que costuma ser percebido"><p>{selected.sensory}</p></DiagnosticBlock>
            <DiagnosticBlock title="Neste lote"><p>{selected.salvage || 'Nem todo defeito tem correção segura depois de pronto. Avalie antes de intervir.'}</p></DiagnosticBlock>
            <DiagnosticBlock title="Causas prováveis"><ul>{selected.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul></DiagnosticBlock>
            <DiagnosticBlock title="Como evitar na próxima"><ul>{selected.prevention.map((item) => <li key={item}>{item}</li>)}</ul></DiagnosticBlock>
          </div>
          <div className="m-5 flex items-start gap-3 border-l-2 border-[#7f8b58] bg-black/20 p-4 sm:m-7"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#7f8b58]" /><div><strong className="text-[10px] uppercase tracking-[0.12em] text-stone-400">Limite do diagnóstico</strong><p className="mt-1 text-[10px] leading-5 text-stone-600">Isso é uma hipótese baseada em percepção sensorial. Mais de um problema pode gerar sintomas parecidos. Compare com suas temperaturas, tempos, higiene e medições antes de tomar uma ação.</p></div></div>
          <div className="border-t border-white/[0.08] px-5 py-4 sm:px-7"><p className="inline-flex items-center gap-2 text-[10px] text-stone-600"><AlertTriangle className="h-4 w-4 text-[#bd6c32]" /> Receita em contexto: <strong className="text-stone-400">{recipe.name}</strong> · {recipe.yeast.name}</p></div>
        </section> : <section className="border border-dashed border-white/[0.1] p-10 text-center text-stone-600">Escolha uma hipótese no guia.</section>}
      </div>
    </div>
  );
};

const DiagnosticBlock: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => <div className="bg-[#100e0b] p-5 sm:p-7"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#bd6c32]">{title}</p><div className="mt-3 space-y-2 text-xs leading-6 text-stone-500 [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-[#7f8b58] [&_li]:before:content-['—']">{children}</div></div>;
