import React from 'react';
import { Droplets, Info, Scale, TestTube2 } from 'lucide-react';
import type { BeerRecipe, BrewSession, RecipeCalculations, WaterSalts } from '../types/brewing';
import { CURITIBA_WATER_SOURCES, WATER_PROFILES } from '../data/ingredients';

interface WaterStudioV4Props {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
  session?: BrewSession;
  onChange: (recipe: BeerRecipe) => void;
  onUpdateSession: (session: BrewSession) => void;
}

const saltFields: Array<{ key: keyof WaterSalts; label: string; unit: string }> = [
  { key: 'gypsumGrams', label: 'Gesso · CaSO₄', unit: 'g' },
  { key: 'calciumChlorideGrams', label: 'Cloreto de cálcio · CaCl₂', unit: 'g' },
  { key: 'epsomSaltGrams', label: 'Sal de Epsom · MgSO₄', unit: 'g' },
  { key: 'tableSaltGrams', label: 'Sal · NaCl', unit: 'g' },
  { key: 'bakingSodaGrams', label: 'Bicarbonato · NaHCO₃', unit: 'g' },
  { key: 'lacticAcid88Ml', label: 'Ácido lático 88%', unit: 'mL' },
];

const Ion: React.FC<{ name: string; value: number; target: number }> = ({ name, value, target }) => (
  <div className="border-r border-white/[0.06] p-3 last:border-r-0">
    <span className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-600">{name}</span>
    <strong className="mt-1 block font-mono text-lg text-[#f2e7d2]">{Math.round(value)}</strong>
    <small className="text-[9px] text-stone-700">alvo {Math.round(target)} ppm</small>
  </div>
);

export const WaterStudioV4: React.FC<WaterStudioV4Props> = ({ recipe, calculations, session, onChange, onUpdateSession }) => {
  const result = calculations.waterProfileResult;
  const target = recipe.waterTarget;
  const ratio = calculations.sulfateToChlorideRatio;
  const ratioMeaning = ratio > 1.4 ? 'tende a destacar secura e amargor' : ratio < 0.75 ? 'tende a destacar maciez e malte' : 'equilíbrio entre sulfato e cloreto';

  const updateSalt = (key: keyof WaterSalts, value: number) => onChange({ ...recipe, waterSalts: { ...recipe.waterSalts, [key]: Math.max(0, value) } });

  const saveMeasuredPh = (value: string) => {
    if (!session) return;
    const number = value === '' ? undefined : Number(value);
    onUpdateSession({ ...session, actuals: { ...(session.actuals || {}), mashPh: number }, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-5">
      <section className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Bancada de água</p><h1 className="mt-2 font-serif text-3xl font-black text-[#f2e7d2]">Da água base ao alvo</h1><p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">Ajuste o que vai para a panela. Valores calculados são estimativas; pH e água real só viram medição quando você registra o que mediu.</p></div>
          <div className="text-right"><span className="text-[9px] uppercase tracking-[0.15em] text-stone-600">Água total estimada</span><strong className="mt-1 block font-mono text-2xl text-[#f2e7d2]">{calculations.totalWaterNeededLiters.toFixed(1)} L</strong></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          <div className="grid gap-4 border border-white/[0.08] bg-[#100e0b] p-5 md:grid-cols-2 sm:p-7">
            <label><span className="v4-field-label">Água de partida</span><select value={recipe.baseWaterSource?.name || ''} onChange={(e) => { const source = CURITIBA_WATER_SOURCES.find((item) => item.name === e.target.value); if (source) onChange({ ...recipe, baseWaterSource: source }); }} className="v4-input"><option value="">Não definida</option>{CURITIBA_WATER_SOURCES.map((source) => <option key={source.name} value={source.name}>{source.name}</option>)}</select><small className="mt-2 block text-[10px] leading-5 text-stone-700">Escolha a análise que mais representa a água usada. Se o laudo mudou, trate estes números como aproximação.</small></label>
            <label><span className="v4-field-label">Perfil alvo</span><select value={target.name} onChange={(e) => { const profile = WATER_PROFILES.find((item) => item.name === e.target.value); if (profile) onChange({ ...recipe, waterTarget: profile }); }} className="v4-input">{WATER_PROFILES.map((profile) => <option key={profile.name} value={profile.name}>{profile.name}</option>)}</select><small className="mt-2 block text-[10px] leading-5 text-stone-700">O alvo é uma direção sensorial e mineral, não uma obrigação de copiar água histórica.</small></label>
          </div>

          <section className="border border-white/[0.08] bg-[#14110d]">
            <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#bd6c32]">Perfil previsto após ajustes</p><p className="mt-1 text-[10px] text-stone-600">ppm · cálculo da receita</p></div><Droplets className="h-5 w-5 text-[#7f8b58]" /></header>
            <div className="grid grid-cols-3 sm:grid-cols-6"><Ion name="Ca" value={result.ca} target={target.calcium} /><Ion name="Mg" value={result.mg} target={target.magnesium} /><Ion name="Na" value={result.na} target={target.sodium} /><Ion name="Cl" value={result.cl} target={target.chloride} /><Ion name="SO₄" value={result.so4} target={target.sulfate} /><Ion name="HCO₃" value={result.hco3} target={target.bicarbonate} /></div>
          </section>

          <section className="border border-white/[0.08] bg-[#100e0b] p-5 sm:p-7">
            <div className="flex items-center gap-3"><Scale className="h-5 w-5 text-[#bd6c32]" /><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">O que pesar</p><h2 className="font-serif text-xl font-black text-[#f2e7d2]">Sais e ácido da receita</h2></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saltFields.map((field) => <label key={field.key}><span className="v4-field-label">{field.label}</span><div className="relative"><input type="number" min="0" step="0.1" value={recipe.waterSalts[field.key]} onChange={(e) => updateSalt(field.key, Number(e.target.value) || 0)} className="v4-input pr-12" /><span className="absolute right-3 top-3 text-[10px] text-stone-600">{field.unit}</span></div></label>)}</div>
            <div className="mt-5 flex items-start gap-3 border-l-2 border-[#7f8b58] bg-black/15 p-4"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7f8b58]" /><p className="text-[10px] leading-5 text-stone-500">Confirme a concentração dos seus produtos e pese com balança adequada. O app estima a composição; não substitui um laudo da água nem medição de pH.</p></div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="border border-white/[0.08] bg-[#14110d] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Leitura rápida</p>
            <div className="mt-4 border-t border-white/[0.06] pt-4"><span className="text-[10px] text-stone-600">SO₄ : Cl</span><strong className="float-right font-mono text-lg text-[#f2e7d2]">{ratio.toFixed(2)}</strong><p className="mt-2 clear-both text-[10px] leading-5 text-stone-500">{ratioMeaning}.</p></div>
            <div className="mt-4 border-t border-white/[0.06] pt-4"><span className="text-[10px] text-stone-600">pH estimado da mostura</span><strong className="float-right font-mono text-lg text-[#f2e7d2]">{calculations.estimatedMashPh?.estimatedPh?.toFixed(2) ?? '—'}</strong><p className="mt-2 clear-both text-[10px] leading-5 text-stone-500">{calculations.estimatedMashPh?.notes || 'Estimativa indisponível para esta receita.'}</p></div>
          </section>

          <section className="border border-[#bd6c32]/25 bg-[#1a1009] p-5">
            <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-orange-300"><TestTube2 className="h-4 w-4" /> Medido no lote</p>
            {session ? <label className="mt-4 block"><span className="v4-field-label">pH de mostura medido</span><input type="number" min="3" max="7" step="0.01" value={session.actuals?.mashPh ?? ''} onChange={(e) => saveMeasuredPh(e.target.value)} className="v4-input" placeholder="ex.: 5.35" /><small className="mt-2 block text-[10px] leading-5 text-stone-600">Este número pertence ao lote de {session.brewedAt}, não à previsão da receita.</small></label> : <p className="mt-3 text-[10px] leading-5 text-stone-600">Inicie uma brassagem para guardar medições reais separadas da receita.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
};
