import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Droplets,
  FlaskConical,
  Gauge,
  Hop,
  Plus,
  Save,
  Trash2,
  Wheat,
} from 'lucide-react';
import type {
  BeerRecipe,
  BJCPStyle,
  FermentationStage,
  GrainBillItem,
  HopAddition,
  RecipeCalculations,
} from '../types/brewing';
import {
  GRAINS_DATABASE,
  HOPS_DATABASE,
  WATER_PROFILES,
  YEAST_DATABASE,
} from '../data/ingredients';

interface RecipeForgeV4Props {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
  styles: BJCPStyle[];
  onChange: (recipe: BeerRecipe) => void;
  onOpenStyleAtlas: () => void;
  onOpenWaterStudio: () => void;
  onStartBrewday: () => void;
}

const STEPS = [
  { id: 'intent', label: 'Intenção', icon: Gauge },
  { id: 'grain', label: 'Grãos', icon: Wheat },
  { id: 'hops', label: 'Lúpulos', icon: Hop },
  { id: 'fermentation', label: 'Fermentação', icon: FlaskConical },
  { id: 'water', label: 'Água', icon: Droplets },
  { id: 'summary', label: 'Resumo', icon: Check },
] as const;

type Status = 'low' | 'ok' | 'high';

const statusText: Record<Status, string> = {
  low: 'abaixo',
  ok: 'na faixa',
  high: 'acima',
};

const numberValue = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const FieldLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="block mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">{children}</span>
);

const Metric: React.FC<{ label: string; value: string; range: string; status: Status }> = ({ label, value, range, status }) => (
  <div className="border-b border-white/[0.07] py-3 last:border-b-0">
    <div className="flex items-center justify-between gap-3">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.13em] text-stone-500">{label}</span>
        <strong className="ml-3 font-mono text-sm text-[#f2e7d2]">{value}</strong>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${status === 'ok' ? 'text-lime-300/75' : 'text-orange-300'}`}>{statusText[status]}</span>
    </div>
    <p className="mt-1 text-[10px] text-stone-600">BJCP: {range}</p>
  </div>
);

export const RecipeForgeV4: React.FC<RecipeForgeV4Props> = ({
  recipe,
  calculations,
  styles,
  onChange,
  onOpenStyleAtlas,
  onOpenWaterStudio,
  onStartBrewday,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [grainToAdd, setGrainToAdd] = useState('');
  const [hopToAdd, setHopToAdd] = useState('');

  const styleStates = useMemo(() => [
    { label: 'OG', value: calculations.og.toFixed(3), range: `${recipe.style.ogMin.toFixed(3)}–${recipe.style.ogMax.toFixed(3)}`, status: calculations.bjcpCompliance.ogStatus },
    { label: 'FG', value: calculations.fg.toFixed(3), range: `${recipe.style.fgMin.toFixed(3)}–${recipe.style.fgMax.toFixed(3)}`, status: calculations.bjcpCompliance.fgStatus },
    { label: 'ABV', value: `${calculations.abv.toFixed(1)}%`, range: `${recipe.style.abvMin.toFixed(1)}–${recipe.style.abvMax.toFixed(1)}%`, status: calculations.bjcpCompliance.abvStatus },
    { label: 'IBU', value: Math.round(calculations.ibu).toString(), range: `${recipe.style.ibuMin}–${recipe.style.ibuMax}`, status: calculations.bjcpCompliance.ibuStatus },
    { label: 'SRM', value: calculations.srm.toFixed(1), range: `${recipe.style.srmMin}–${recipe.style.srmMax}`, status: calculations.bjcpCompliance.srmStatus },
  ], [calculations, recipe.style]);

  const outsideCount = styleStates.filter((item) => item.status !== 'ok').length;
  const currentStep = STEPS[stepIndex];

  const update = <K extends keyof BeerRecipe>(key: K, value: BeerRecipe[K]) => onChange({ ...recipe, [key]: value });

  const addGrain = () => {
    const source = GRAINS_DATABASE.find((grain) => grain.name === grainToAdd);
    if (!source) return;
    const item: GrainBillItem = {
      id: `grain-${Date.now()}`,
      name: source.name,
      amountKg: 0.5,
      potentialSg: source.potentialSg,
      ebc: source.ebc,
      type: source.type,
    };
    update('grains', [...recipe.grains, item]);
    setGrainToAdd('');
  };

  const addHop = () => {
    const source = HOPS_DATABASE.find((hop) => hop.name === hopToAdd);
    if (!source) return;
    const item: HopAddition = {
      id: `hop-${Date.now()}`,
      name: source.name,
      amountGrams: 20,
      alphaAcids: source.alphaAcids,
      timeMinutes: 10,
      use: 'Boil',
      form: 'Pellet',
    };
    update('hops', [...recipe.hops, item]);
    setHopToAdd('');
  };

  const addFermentationStage = () => {
    const stage: FermentationStage = {
      name: 'Nova etapa',
      tempCelsius: recipe.yeast.optimalTempMin,
      durationDays: 3,
      description: '',
    };
    update('fermentationStages', [...recipe.fermentationStages, stage]);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="h-fit border border-white/[0.08] bg-[#100e0b] p-3 xl:sticky xl:top-[145px]">
        <p className="px-2 pb-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Recipe Forge</p>
        <div className="grid gap-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex min-h-11 items-center gap-3 px-3 text-left text-xs font-bold transition ${index === stepIndex ? 'bg-[#2a1b12] text-[#f2e7d2]' : 'text-stone-500 hover:bg-white/[0.025] hover:text-stone-300'}`}
              >
                <span className={`font-mono text-[9px] ${index <= stepIndex ? 'text-[#bd6c32]' : 'text-stone-700'}`}>{String(index + 1).padStart(2, '0')}</span>
                <Icon className="h-4 w-4" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0 border border-white/[0.08] bg-[#14110d] shadow-2xl">
        <header className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Etapa {stepIndex + 1} de {STEPS.length}</p>
              <h1 className="mt-1 font-serif text-2xl font-black text-[#f2e7d2] sm:text-3xl">{currentStep.label}</h1>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">salvamento</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold text-lime-300/70"><Save className="h-3 w-3" /> automático neste navegador</p>
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-7">
          {currentStep.id === 'intent' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <label><FieldLabel>Nome da receita</FieldLabel><input value={recipe.name} onChange={(e) => update('name', e.target.value)} className="v4-input" /></label>
              <label><FieldLabel>Estilo BJCP</FieldLabel><select value={recipe.style.id} onChange={(e) => { const style = styles.find((item) => item.id === e.target.value); if (style) update('style', style); }} className="v4-input"><option value={recipe.style.id}>{recipe.style.code} · {recipe.style.name}</option>{styles.filter((item) => item.id !== recipe.style.id).map((style) => <option key={style.id} value={style.id}>{style.code} · {style.name}</option>)}</select></label>
              <label><FieldLabel>Volume do lote</FieldLabel><div className="relative"><input type="number" min="1" step="1" value={recipe.batchSizeLiters} onChange={(e) => update('batchSizeLiters', numberValue(e.target.value, recipe.batchSizeLiters))} className="v4-input pr-10" /><span className="absolute right-3 top-3 text-xs text-stone-600">L</span></div></label>
              <label><FieldLabel>Eficiência da casa</FieldLabel><div className="relative"><input type="number" min="45" max="95" value={recipe.efficiencyPercent} onChange={(e) => update('efficiencyPercent', numberValue(e.target.value, recipe.efficiencyPercent))} className="v4-input pr-10" /><span className="absolute right-3 top-3 text-xs text-stone-600">%</span></div></label>
              <label className="lg:col-span-2"><FieldLabel>Objetivo sensorial / descrição</FieldLabel><textarea value={recipe.tagline || ''} onChange={(e) => update('tagline', e.target.value)} rows={3} className="v4-input resize-none" placeholder="Ex.: seca, cítrica, amargor limpo e final curto" /></label>
              <div className="lg:col-span-2 border-l-2 border-[#bd6c32] bg-[#0e0c09] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Referência escolhida</p><strong className="mt-1 block text-sm text-[#f2e7d2]">{recipe.style.code} · {recipe.style.name}</strong><p className="mt-1 text-xs text-stone-500">{recipe.style.category}</p></div>
                  <button type="button" onClick={onOpenStyleAtlas} className="v4-secondary-button">Explorar estilos <ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'grain' && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <select value={grainToAdd} onChange={(e) => setGrainToAdd(e.target.value)} className="v4-input"><option value="">Escolher malte ou grão…</option>{GRAINS_DATABASE.map((grain) => <option key={grain.name} value={grain.name}>{grain.name} · {grain.ebc} EBC</option>)}</select>
                <button type="button" disabled={!grainToAdd} onClick={addGrain} className="v4-primary-action disabled:opacity-30"><Plus className="h-4 w-4" /> Adicionar</button>
              </div>
              <div className="overflow-x-auto border border-white/[0.07]">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-black/25 text-[9px] uppercase tracking-[0.14em] text-stone-600"><tr><th className="p-3">Grão</th><th className="p-3">Tipo</th><th className="p-3">Peso</th><th className="p-3">%</th><th className="p-3">Cor</th><th className="p-3" /></tr></thead>
                  <tbody>{recipe.grains.map((grain) => { const percent = calculations.totalGrainKg > 0 ? (grain.amountKg / calculations.totalGrainKg) * 100 : 0; return <tr key={grain.id} className="border-t border-white/[0.06]"><td className="p-3 font-bold text-stone-200">{grain.name}</td><td className="p-3 text-stone-500">{grain.type}</td><td className="p-3"><input type="number" min="0" step="0.05" value={grain.amountKg} onChange={(e) => update('grains', recipe.grains.map((item) => item.id === grain.id ? { ...item, amountKg: numberValue(e.target.value, item.amountKg) } : item))} className="v4-table-input" /> kg</td><td className="p-3 font-mono text-stone-400">{percent.toFixed(1)}%</td><td className="p-3 font-mono text-stone-400">{grain.ebc} EBC</td><td className="p-3 text-right"><button type="button" aria-label={`Remover ${grain.name}`} onClick={() => update('grains', recipe.grains.filter((item) => item.id !== grain.id))} className="text-stone-600 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></td></tr>; })}</tbody>
                </table>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="v4-fact"><span>Carga total</span><strong>{calculations.totalGrainKg.toFixed(2)} kg</strong></div>
                <div className="v4-fact"><span>Mostura principal</span><strong>{calculations.effectiveMashTempCelsius.toFixed(0)}°C</strong></div>
                <div className="v4-fact"><span>Perfil previsto</span><strong className="capitalize">{calculations.fermentabilityProfile.replace('_', ' ')}</strong></div>
              </div>
              {recipe.mashSchedule.map((mash, index) => <div key={mash.id} className="grid gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-[1fr_130px_130px]"><label><FieldLabel>Etapa de mostura</FieldLabel><input value={mash.name} onChange={(e) => update('mashSchedule', recipe.mashSchedule.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="v4-input" /></label><label><FieldLabel>Temperatura °C</FieldLabel><input type="number" value={mash.tempCelsius} onChange={(e) => update('mashSchedule', recipe.mashSchedule.map((item, i) => i === index ? { ...item, tempCelsius: numberValue(e.target.value, item.tempCelsius) } : item))} className="v4-input" /></label><label><FieldLabel>Minutos</FieldLabel><input type="number" value={mash.durationMinutes} onChange={(e) => update('mashSchedule', recipe.mashSchedule.map((item, i) => i === index ? { ...item, durationMinutes: numberValue(e.target.value, item.durationMinutes) } : item))} className="v4-input" /></label></div>)}
            </div>
          )}

          {currentStep.id === 'hops' && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <select value={hopToAdd} onChange={(e) => setHopToAdd(e.target.value)} className="v4-input"><option value="">Escolher lúpulo…</option>{HOPS_DATABASE.map((hop) => <option key={hop.name} value={hop.name}>{hop.name} · {hop.alphaAcids}% AA</option>)}</select>
                <button type="button" disabled={!hopToAdd} onClick={addHop} className="v4-primary-action disabled:opacity-30"><Plus className="h-4 w-4" /> Adicionar</button>
              </div>
              <div className="space-y-2">{[...recipe.hops].sort((a, b) => b.timeMinutes - a.timeMinutes).map((hop) => <div key={hop.id} className="grid gap-3 border border-white/[0.07] bg-black/15 p-3 md:grid-cols-[minmax(170px,1fr)_115px_115px_120px_105px_auto]"><div><p className="text-xs font-bold text-stone-200">{hop.name}</p><p className="mt-1 text-[9px] text-stone-600">{hop.form} · {hop.alphaAcids}% AA</p></div><label><FieldLabel>Uso</FieldLabel><select value={hop.use} onChange={(e) => update('hops', recipe.hops.map((item) => item.id === hop.id ? { ...item, use: e.target.value as HopAddition['use'] } : item))} className="v4-mini-input"><option>Boil</option><option>Whirlpool</option><option>Dry Hop</option><option>First Wort</option><option>Mash</option></select></label><label><FieldLabel>Quantidade</FieldLabel><input type="number" min="0" value={hop.amountGrams} onChange={(e) => update('hops', recipe.hops.map((item) => item.id === hop.id ? { ...item, amountGrams: numberValue(e.target.value, item.amountGrams) } : item))} className="v4-mini-input" /></label><label><FieldLabel>{hop.use === 'Dry Hop' ? 'Dias' : 'Min restantes'}</FieldLabel><input type="number" min="0" value={hop.timeMinutes} onChange={(e) => update('hops', recipe.hops.map((item) => item.id === hop.id ? { ...item, timeMinutes: numberValue(e.target.value, item.timeMinutes) } : item))} className="v4-mini-input" /></label><label><FieldLabel>Alfa ácido</FieldLabel><input type="number" step="0.1" min="0" value={hop.alphaAcids} onChange={(e) => update('hops', recipe.hops.map((item) => item.id === hop.id ? { ...item, alphaAcids: numberValue(e.target.value, item.alphaAcids) } : item))} className="v4-mini-input" /></label><button type="button" aria-label={`Remover ${hop.name}`} onClick={() => update('hops', recipe.hops.filter((item) => item.id !== hop.id))} className="self-center justify-self-end text-stone-600 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>)}</div>
              <div className="grid gap-3 sm:grid-cols-3"><div className="v4-fact"><span>Lúpulo total</span><strong>{Math.round(calculations.totalHopsGrams)} g</strong></div><div className="v4-fact"><span>Amargor previsto</span><strong>{Math.round(calculations.ibu)} IBU</strong></div><div className="v4-fact"><span>BU:GU</span><strong>{calculations.buGu.toFixed(2)}</strong></div></div>
            </div>
          )}

          {currentStep.id === 'fermentation' && (
            <div className="space-y-5">
              <label><FieldLabel>Levedura</FieldLabel><select value={recipe.yeast.id} onChange={(e) => { const yeast = YEAST_DATABASE.find((item) => item.id === e.target.value); if (yeast) update('yeast', yeast); }} className="v4-input">{YEAST_DATABASE.map((yeast) => <option key={yeast.id} value={yeast.id}>{yeast.name} · {yeast.brand}</option>)}</select></label>
              <div className="grid gap-3 sm:grid-cols-4"><div className="v4-fact"><span>Atenuação média</span><strong>{recipe.yeast.attenuationAvg}%</strong></div><div className="v4-fact"><span>Faixa térmica</span><strong>{recipe.yeast.optimalTempMin}–{recipe.yeast.optimalTempMax}°C</strong></div><div className="v4-fact"><span>FG prevista</span><strong>{calculations.fg.toFixed(3)}</strong></div><div className="v4-fact"><span>ABV previsto</span><strong>{calculations.abv.toFixed(1)}%</strong></div></div>
              <p className="border-l-2 border-[#7f8b58] bg-black/15 p-4 text-xs leading-6 text-stone-400">{recipe.yeast.notes}</p>
              <div className="space-y-2">{recipe.fermentationStages.map((stage, index) => <div key={`${stage.name}-${index}`} className="grid gap-3 border border-white/[0.07] p-3 md:grid-cols-[1fr_110px_100px_auto]"><input value={stage.name} onChange={(e) => update('fermentationStages', recipe.fermentationStages.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="v4-mini-input" /><input type="number" value={stage.tempCelsius} onChange={(e) => update('fermentationStages', recipe.fermentationStages.map((item, i) => i === index ? { ...item, tempCelsius: numberValue(e.target.value, item.tempCelsius) } : item))} className="v4-mini-input" title="Temperatura °C" /><input type="number" value={stage.durationDays} onChange={(e) => update('fermentationStages', recipe.fermentationStages.map((item, i) => i === index ? { ...item, durationDays: numberValue(e.target.value, item.durationDays) } : item))} className="v4-mini-input" title="Dias" /><button type="button" onClick={() => update('fermentationStages', recipe.fermentationStages.filter((_, i) => i !== index))} className="text-stone-600 hover:text-red-300"><Trash2 className="h-4 w-4" /></button><textarea value={stage.description} onChange={(e) => update('fermentationStages', recipe.fermentationStages.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} className="v4-mini-input resize-none md:col-span-4" rows={2} placeholder="O que observar nesta etapa" /></div>)}</div>
              <button type="button" onClick={addFermentationStage} className="v4-secondary-button"><Plus className="h-4 w-4" /> Adicionar etapa</button>
            </div>
          )}

          {currentStep.id === 'water' && (
            <div className="space-y-5">
              <label><FieldLabel>Perfil alvo</FieldLabel><select value={recipe.waterTarget.name} onChange={(e) => { const profile = WATER_PROFILES.find((item) => item.name === e.target.value); if (profile) update('waterTarget', profile); }} className="v4-input"><option value={recipe.waterTarget.name}>{recipe.waterTarget.name}</option>{WATER_PROFILES.filter((item) => item.name !== recipe.waterTarget.name).map((profile) => <option key={profile.name} value={profile.name}>{profile.name}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">{[['Ca', calculations.waterProfileResult.ca], ['Mg', calculations.waterProfileResult.mg], ['Na', calculations.waterProfileResult.na], ['Cl', calculations.waterProfileResult.cl], ['SO₄', calculations.waterProfileResult.so4], ['HCO₃', calculations.waterProfileResult.hco3]].map(([name, value]) => <div key={String(name)} className="v4-fact"><span>{String(name)} estimado</span><strong>{Number(value).toFixed(0)} ppm</strong></div>)}</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{([
                ['Gesso / CaSO₄', 'gypsumGrams'],
                ['Cloreto de cálcio', 'calciumChlorideGrams'],
                ['Sal de Epsom', 'epsomSaltGrams'],
                ['Sal / NaCl', 'tableSaltGrams'],
                ['Bicarbonato', 'bakingSodaGrams'],
                ['Ácido lático 88%', 'lacticAcid88Ml'],
              ] as const).map(([label, key]) => <label key={key}><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" min="0" step="0.1" value={recipe.waterSalts[key]} onChange={(e) => update('waterSalts', { ...recipe.waterSalts, [key]: numberValue(e.target.value, recipe.waterSalts[key]) })} className="v4-input pr-10" /><span className="absolute right-3 top-3 text-[10px] text-stone-600">{key === 'lacticAcid88Ml' ? 'mL' : 'g'}</span></div></label>)}</div>
              <div className="grid gap-3 sm:grid-cols-3"><div className="v4-fact"><span>Água total estimada</span><strong>{calculations.totalWaterNeededLiters.toFixed(1)} L</strong></div><div className="v4-fact"><span>SO₄ : Cl</span><strong>{calculations.sulfateToChlorideRatio.toFixed(2)}</strong></div><div className="v4-fact"><span>pH de mostura estimado</span><strong>{calculations.estimatedMashPh?.estimatedPh?.toFixed(2) ?? '—'}</strong></div></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4"><p className="max-w-xl text-[11px] leading-5 text-stone-600">Aqui são previsões a partir da receita. Medições reais do lote ficam registradas no Brewday.</p><button type="button" onClick={onOpenWaterStudio} className="v4-secondary-button">Abrir bancada de água <ArrowRight className="h-4 w-4" /></button></div>
            </div>
          )}

          {currentStep.id === 'summary' && (
            <div className="space-y-6">
              <div className={`border-l-4 p-5 ${outsideCount === 0 ? 'border-[#7f8b58] bg-lime-950/10' : 'border-[#bd6c32] bg-orange-950/10'}`}><p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500">Leitura da receita</p><h2 className="mt-2 font-serif text-2xl font-black text-[#f2e7d2]">{outsideCount === 0 ? 'A receita está dentro das faixas numéricas do estilo.' : `${outsideCount} ${outsideCount === 1 ? 'medida pede' : 'medidas pedem'} revisão.`}</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">BJCP é referência de estilo, não sentença de qualidade. Use as faixas para entender onde a receita está; a decisão final continua sendo do cervejeiro.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div className="v4-fact"><span>Maltes</span><strong>{calculations.totalGrainKg.toFixed(2)} kg</strong></div><div className="v4-fact"><span>Lúpulos</span><strong>{Math.round(calculations.totalHopsGrams)} g</strong></div><div className="v4-fact"><span>Água estimada</span><strong>{calculations.totalWaterNeededLiters.toFixed(1)} L</strong></div><div className="v4-fact"><span>Pré-fervura</span><strong>{calculations.preBoilVolumeLiters.toFixed(1)} L</strong></div><div className="v4-fact"><span>Mostura</span><strong>{calculations.effectiveMashTempCelsius.toFixed(0)}°C</strong></div><div className="v4-fact"><span>Levedura</span><strong>{recipe.yeast.name}</strong></div></div>
              <div className="flex flex-wrap gap-3"><button type="button" onClick={onStartBrewday} className="v4-primary-action">Começar brassagem <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => setStepIndex(0)} className="v4-secondary-button">Revisar do início</button></div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 sm:px-7">
          <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))} className="v4-secondary-button disabled:opacity-25"><ArrowLeft className="h-4 w-4" /> Anterior</button>
          <span className="hidden text-[10px] text-stone-700 sm:block">{recipe.style.code} · {recipe.style.name}</span>
          <button type="button" disabled={stepIndex === STEPS.length - 1} onClick={() => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))} className="v4-primary-action disabled:opacity-25">Próxima <ArrowRight className="h-4 w-4" /></button>
        </footer>
      </section>

      <aside className="h-fit border border-white/[0.08] bg-[#100e0b] p-5 xl:sticky xl:top-[145px]">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">Receita x estilo</p>
        <h2 className="mt-2 font-serif text-lg font-black text-[#f2e7d2]">{recipe.style.code} · {recipe.style.name}</h2>
        <div className="mt-4">{styleStates.map((item) => <Metric key={item.label} {...item} />)}</div>
        <div className="mt-4 border-t border-white/[0.07] pt-4"><div className="flex justify-between text-[10px] text-stone-500"><span>BU:GU</span><strong className="font-mono text-stone-300">{calculations.buGu.toFixed(2)}</strong></div><div className="mt-2 flex justify-between text-[10px] text-stone-500"><span>Água total</span><strong className="font-mono text-stone-300">{calculations.totalWaterNeededLiters.toFixed(1)} L</strong></div></div>
        <p className="mt-4 text-[10px] leading-5 text-stone-700">Valores previstos. Durante a brassagem, registre os números reais separadamente.</p>
      </aside>
    </div>
  );
};
