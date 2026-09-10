import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, GitCompareArrows, Search } from 'lucide-react';
import type { BeerRecipe, BJCPStyle } from '../types/brewing';

interface BJCPAtlasV4Props {
  styles: BJCPStyle[];
  recipes: BeerRecipe[];
  currentStyleId: string;
  onUseStyle: (style: BJCPStyle) => void;
  onOpenRecipe: (recipeId: string) => void;
}

const Range: React.FC<{ label: string; a: string; b: string }> = ({ label, a, b }) => (
  <div className="border-t border-white/[0.07] py-2.5 first:border-t-0"><span className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-600">{label}</span><strong className="float-right font-mono text-xs text-stone-300">{a}–{b}</strong></div>
);

export const BJCPAtlasV4: React.FC<BJCPAtlasV4Props> = ({ styles, recipes, currentStyleId, onUseStyle, onOpenRecipe }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(currentStyleId);
  const [compareId, setCompareId] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return styles;
    return styles.filter((style) => [style.code, style.name, style.category, style.flavorProfile, style.aromaProfile].join(' ').toLowerCase().includes(q));
  }, [query, styles]);

  const selected = styles.find((style) => style.id === selectedId) || styles.find((style) => style.id === currentStyleId) || styles[0];
  const compared = styles.find((style) => style.id === compareId);
  const related = recipes.filter((recipe) => recipe.style.id === selected?.id || recipe.style.code === selected?.code).slice(0, 4);

  if (!selected) return null;

  return (
    <div className="space-y-5">
      <section className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">BJCP 2021 · cerveja</p><h1 className="mt-2 font-serif text-3xl font-black text-[#f2e7d2]">Atlas de estilos</h1><p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">Use o guia como referência de linguagem e faixa, não como uma nota de qualidade. Escolha um estilo para orientar a receita e compare quando a fronteira entre dois estilos não estiver clara.</p></div>
          <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="v4-input pl-10" placeholder="Buscar IPA, lager, stout…" /></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="max-h-[720px] overflow-y-auto border border-white/[0.08] bg-[#100e0b] p-2">
          <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-stone-700">{filtered.length} estilos encontrados</p>
          {filtered.map((style) => <button key={style.id} type="button" onClick={() => setSelectedId(style.id)} className={`block w-full border-t border-white/[0.05] px-3 py-3 text-left transition ${style.id === selected.id ? 'bg-[#291a11] text-[#f2e7d2]' : 'text-stone-500 hover:bg-white/[0.025] hover:text-stone-300'}`}><span className="font-mono text-[9px] font-bold text-[#bd6c32]">{style.code}</span><strong className="mt-1 block text-xs">{style.name}</strong><small className="mt-1 block text-[9px] text-stone-700">{style.category}</small></button>)}
        </aside>

        <section className="border border-white/[0.08] bg-[#14110d]">
          <header className="border-b border-white/[0.08] px-5 py-6 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="font-mono text-xs font-bold text-[#bd6c32]">{selected.code}</p><h2 className="mt-1 font-serif text-3xl font-black text-[#f2e7d2]">{selected.name}</h2><p className="mt-1 text-xs text-stone-600">{selected.category}</p></div>
              <button type="button" onClick={() => onUseStyle(selected)} className="v4-primary-action">Usar na receita atual <ArrowRight className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="border-b border-white/[0.08] p-5 lg:border-b-0 lg:border-r sm:p-7">
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-stone-600">Faixas numéricas</p>
              <div className="mt-3"><Range label="OG" a={selected.ogMin.toFixed(3)} b={selected.ogMax.toFixed(3)} /><Range label="FG" a={selected.fgMin.toFixed(3)} b={selected.fgMax.toFixed(3)} /><Range label="ABV" a={`${selected.abvMin.toFixed(1)}%`} b={`${selected.abvMax.toFixed(1)}%`} /><Range label="IBU" a={String(selected.ibuMin)} b={String(selected.ibuMax)} /><Range label="SRM" a={String(selected.srmMin)} b={String(selected.srmMax)} /><Range label="BU:GU alvo" a={selected.targetBuGu.toFixed(2)} b="ref." /></div>
            </div>
            <div className="space-y-6 p-5 sm:p-7">
              <StyleText title="Aroma" text={selected.aromaProfile} />
              <StyleText title="Sabor" text={selected.flavorProfile} />
              <StyleText title="Aparência" text={selected.appearance} />
              <StyleText title="Contexto" text={selected.history} />
            </div>
          </div>

          <div className="border-t border-white/[0.08] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-stone-600"><GitCompareArrows className="h-4 w-4 text-[#bd6c32]" /> Comparar</p><p className="mt-1 text-xs text-stone-500">Veja duas faixas lado a lado.</p></div><select value={compareId} onChange={(e) => setCompareId(e.target.value)} className="v4-input w-full sm:w-72"><option value="">Escolher outro estilo…</option>{styles.filter((style) => style.id !== selected.id).map((style) => <option key={style.id} value={style.id}>{style.code} · {style.name}</option>)}</select></div>
            {compared && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-xs"><thead className="text-left text-[9px] uppercase tracking-[0.13em] text-stone-600"><tr><th className="py-2">Métrica</th><th>{selected.code} · {selected.name}</th><th>{compared.code} · {compared.name}</th></tr></thead><tbody>{[['OG', `${selected.ogMin.toFixed(3)}–${selected.ogMax.toFixed(3)}`, `${compared.ogMin.toFixed(3)}–${compared.ogMax.toFixed(3)}`], ['FG', `${selected.fgMin.toFixed(3)}–${selected.fgMax.toFixed(3)}`, `${compared.fgMin.toFixed(3)}–${compared.fgMax.toFixed(3)}`], ['ABV', `${selected.abvMin}–${selected.abvMax}%`, `${compared.abvMin}–${compared.abvMax}%`], ['IBU', `${selected.ibuMin}–${selected.ibuMax}`, `${compared.ibuMin}–${compared.ibuMax}`], ['SRM', `${selected.srmMin}–${selected.srmMax}`, `${compared.srmMin}–${compared.srmMax}`]].map((row) => <tr key={row[0]} className="border-t border-white/[0.06]"><td className="py-3 font-black text-stone-500">{row[0]}</td><td className="font-mono text-stone-300">{row[1]}</td><td className="font-mono text-stone-300">{row[2]}</td></tr>)}</tbody></table></div>}
          </div>

          <div className="border-t border-white/[0.08] p-5 sm:p-7">
            <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-stone-600"><BookOpen className="h-4 w-4 text-[#bd6c32]" /> Receitas Democrata neste estilo</p>
            {related.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{related.map((recipe) => <button key={recipe.id} type="button" onClick={() => onOpenRecipe(recipe.id)} className="border border-white/[0.07] bg-black/15 p-3 text-left hover:border-[#bd6c32]/40"><strong className="block text-xs text-stone-300">{recipe.name}</strong><small className="mt-1 block text-[9px] text-stone-600">{recipe.batchSizeLiters} L · abrir receita</small></button>)}</div> : <p className="mt-3 text-xs text-stone-600">Nenhuma receita salva usa este estilo ainda.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

const StyleText: React.FC<{ title: string; text: string }> = ({ title, text }) => <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#bd6c32]">{title}</p><p className="mt-2 text-sm leading-7 text-stone-400">{text || 'Sem descrição disponível nesta base.'}</p></div>;
