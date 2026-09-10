import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Beer,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  Gauge,
  History,
  KeyRound,
  Library,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Thermometer,
  TriangleAlert,
  Wheat,
  X,
} from 'lucide-react';
import type {
  BeerRecipe,
  BJCPStyle,
  BrewReading,
  BrewSession,
  FermentationStage,
  GrainBillItem,
  HopAddition,
} from '../types/brewing';
import { BJCP_STYLES, SIGNATURE_RECIPES } from '../data/ingredients';
import { calculateAllMetrics } from '../utils/brewingCalculations';
import { loadBrewSessions, loadRecipes, saveBrewSessions, STORAGE_KEYS, writeStoredArray } from '../utils/localStorage';

const PIN_STORAGE_KEY = 'democrata_lab_private_pin';
const SESSION_UNLOCK_KEY = 'democrata_lab_unlocked_session';

type View = 'cover' | 'recipe' | 'brew' | 'notebook' | 'atlas' | 'diagnostic';
type RecipeStep = 0 | 1 | 2 | 3 | 4 | 5;

type Diagnostic = {
  id: string;
  perception: string;
  likely: string;
  causes: string[];
  now: string;
  next: string;
};

const DIAGNOSTICS: Diagnostic[] = [
  { id: 'diacetyl', perception: 'Manteiga, pipoca, caramelo amanteigado', likely: 'Diacetil', causes: ['Fermentação encerrada cedo', 'Levedura estressada ou pouco saudável', 'Temperatura baixa demais no final'], now: 'Dê tempo à levedura e, quando fizer sentido para a cepa, eleve alguns graus no fim da fermentação.', next: 'Garanta pitch adequado, oxigenação correta e não resfrie antes da densidade estabilizar.' },
  { id: 'acetaldehyde', perception: 'Maçã verde, cidra, abóbora crua', likely: 'Acetaldeído', causes: ['Cerveja jovem', 'Fermentação incompleta', 'Oxidação durante fermentação'], now: 'Se ainda está no fermentador, normalmente vale dar mais tempo à levedura.', next: 'Evite trasfegar cedo e confirme densidade estável antes de embalar.' },
  { id: 'dms', perception: 'Milho cozido, legumes cozidos', likely: 'DMS', causes: ['Fervura pouco vigorosa', 'Panela tampada na fervura', 'Resfriamento muito lento'], now: 'Depois de embalado é difícil corrigir; avalie a intensidade antes de descartar.', next: 'Ferva destampado e vigorosamente; resfrie o mosto com rapidez.' },
  { id: 'oxidation', perception: 'Papelão, vinho velho, mel escurecido', likely: 'Oxidação', causes: ['Entrada de oxigênio após fermentação', 'Transferências com respingo', 'Envase mal purgado'], now: 'Não existe correção completa depois que a oxidação aparece.', next: 'Minimize respingos e contato com ar do fim da fermentação até o copo.' },
  { id: 'phenolic', perception: 'Plástico, medicinal, esparadrapo', likely: 'Fenólico indesejado / clorofenol', causes: ['Cloro ou cloramina na água', 'Contaminação', 'Levedura inadequada ao estilo'], now: 'Clorofenol raramente melhora com o tempo.', next: 'Remova cloro/cloramina da água e revise sanitização.' },
  { id: 'fusel', perception: 'Álcool quente, solvente, ardência', likely: 'Álcoois superiores', causes: ['Fermentação quente demais', 'Pitch insuficiente', 'Mosto muito concentrado com levedura estressada'], now: 'Maturação pode arredondar parte da percepção, mas não faz milagre.', next: 'Controle temperatura e dimensione melhor a levedura para OG alta.' },
  { id: 'astringent', perception: 'Boca seca, chá preto forte, casca de fruta', likely: 'Adstringência', causes: ['Lavagem excessiva', 'pH alto na lavagem', 'Grão moído fino demais ou extração agressiva'], now: 'Tempo pode suavizar pouco; o principal ganho é corrigir o processo futuro.', next: 'Controle pH de mostura/lavagem e evite extrair demais dos grãos.' },
  { id: 'lightstruck', perception: 'Gambá, enxofre agressivo após luz', likely: 'Lightstruck', causes: ['Exposição da cerveja lupulada à luz UV/azul'], now: 'Não há correção real depois de formado.', next: 'Use vidro âmbar e mantenha cerveja pronta fora de luz intensa.' },
];

const fmtGravity = (value: number) => value.toFixed(3);
const today = () => new Date().toISOString().slice(0, 10);
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const statusLabel = (status: 'low' | 'ok' | 'high') => status === 'ok' ? 'na faixa' : status === 'low' ? 'abaixo' : 'acima';

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const valid = localStorage.getItem(PIN_STORAGE_KEY) || '1984';
    if (pin === valid) {
      localStorage.setItem(SESSION_UNLOCK_KEY, 'true');
      onUnlock();
    } else {
      setError('PIN incorreto.');
      setPin('');
    }
  };
  return (
    <main className="bb-gate">
      <img src="/brewmaster.jpg" alt="" className="bb-gate__photo" />
      <div className="bb-gate__veil" />
      <section className="bb-gate__content">
        <p className="bb-eyebrow">DEMOCRATA BIER</p>
        <h1>Receita.<br />Ritual.<br /><em>Memória.</em></h1>
        <p className="bb-gate__intro">Um caderno de cervejeiro que acompanha a ideia, a brassagem e o que realmente saiu do fermentador.</p>
        <form onSubmit={submit} className="bb-pin">
          <div>
            <span>Acesso particular</span>
            <small>PIN padrão 1984</small>
          </div>
          <div className="bb-pin__row">
            <input autoFocus inputMode="numeric" maxLength={8} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }} placeholder="••••" aria-label="PIN de acesso" />
            <button type="submit"><KeyRound /> Entrar</button>
          </div>
          {error && <p className="bb-pin__error">{error}</p>}
        </form>
      </section>
    </main>
  );
}

function BeerSilhouette({ color, name }: { color: string; name: string }) {
  return (
    <div className="bb-beer" aria-label={`Representação visual de ${name}`}>
      <div className="bb-beer__rim" />
      <div className="bb-beer__foam"><i /><i /><i /><i /></div>
      <div className="bb-beer__liquid" style={{ background: `linear-gradient(90deg, #2a1208, ${color} 28%, ${color} 72%, #2a1208)` }}>
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="bb-beer__shine" />
      <div className="bb-beer__mark">D</div>
    </div>
  );
}

function Metric({ label, value, range, state }: { label: string; value: string; range: string; state: 'low' | 'ok' | 'high' }) {
  return (
    <div className="bb-metric" data-state={state}>
      <div><span>{label}</span><b>{value}</b></div>
      <p>{range}</p>
      <small>{state === 'ok' ? <Check /> : <TriangleAlert />}{statusLabel(state)}</small>
    </div>
  );
}

function StyleInstrument({ recipe }: { recipe: BeerRecipe }) {
  const c = calculateAllMetrics(recipe);
  const s = recipe.style;
  return (
    <aside className="bb-instrument">
      <header><span>ESTILO DE REFERÊNCIA</span><strong>{s.code}</strong></header>
      <h3>{s.name}</h3>
      <p>{s.flavorProfile}</p>
      <div className="bb-instrument__metrics">
        <Metric label="OG" value={fmtGravity(c.og)} range={`${fmtGravity(s.ogMin)}–${fmtGravity(s.ogMax)}`} state={c.bjcpCompliance.ogStatus} />
        <Metric label="FG" value={fmtGravity(c.fg)} range={`${fmtGravity(s.fgMin)}–${fmtGravity(s.fgMax)}`} state={c.bjcpCompliance.fgStatus} />
        <Metric label="ABV" value={`${c.abv.toFixed(1)}%`} range={`${s.abvMin.toFixed(1)}–${s.abvMax.toFixed(1)}%`} state={c.bjcpCompliance.abvStatus} />
        <Metric label="IBU" value={`${Math.round(c.ibu)}`} range={`${s.ibuMin}–${s.ibuMax}`} state={c.bjcpCompliance.ibuStatus} />
        <Metric label="SRM" value={c.srm.toFixed(1)} range={`${s.srmMin}–${s.srmMax}`} state={c.bjcpCompliance.srmStatus} />
      </div>
      <p className="bb-instrument__note">Fora da faixa não significa “errado”. O estilo é uma referência para ajudar a decidir conscientemente.</p>
    </aside>
  );
}

function Cover({ recipe, onRecipe, onBrew, onNotebook, onAtlas }: { recipe: BeerRecipe; onRecipe: () => void; onBrew: () => void; onNotebook: () => void; onAtlas: () => void }) {
  const c = calculateAllMetrics(recipe);
  return (
    <main className="bb-cover">
      <img src="/brewmaster.jpg" alt="" className="bb-cover__photo" />
      <div className="bb-cover__veil" />
      <div className="bb-cover__topline">
        <div><b>DEMOCRATA</b><span>BREWBOOK</span></div>
        <button onClick={onAtlas}><Library /> Atlas BJCP</button>
      </div>
      <section className="bb-cover__statement">
        <p className="bb-eyebrow">CADERNO DA CASA</p>
        <h1>O próximo lote<br />começa com uma<br /><em>decisão.</em></h1>
        <p>Planeje menos como um formulário. Brasse mais como um cervejeiro.</p>
      </section>
      <section className="bb-cover__paths">
        <button onClick={onRecipe}><span>01</span><Wheat /><strong>Criar uma receita</strong><small>Do estilo ao último ajuste.</small><ChevronRight /></button>
        <button onClick={onBrew}><span>02</span><Flame /><strong>Brassar agora</strong><small>Uma etapa por vez, sem distração.</small><ChevronRight /></button>
        <button onClick={onNotebook}><span>03</span><NotebookPen /><strong>Abrir o caderno</strong><small>Lotes reais, notas e comparações.</small><ChevronRight /></button>
      </section>
      <button className="bb-cover__current" onClick={onRecipe}>
        <div><span>RECEITA ABERTA</span><strong>{recipe.name}</strong><small>{recipe.style.code} · {recipe.style.name}</small></div>
        <div className="bb-cover__numbers"><b>{fmtGravity(c.og)}</b><span>OG</span><b>{Math.round(c.ibu)}</b><span>IBU</span><b>{c.abv.toFixed(1)}%</b><span>ABV</span></div>
        <ArrowRight />
      </button>
    </main>
  );
}

const STEP_LABELS = ['Intenção', 'Estrutura', 'Lúpulo', 'Fermentação', 'Água', 'Revisão'] as const;

function RecipeEditor({ recipe, onChange, onBack, onStartBrew, onAtlas }: { recipe: BeerRecipe; onChange: (r: BeerRecipe) => void; onBack: () => void; onStartBrew: () => void; onAtlas: () => void }) {
  const [step, setStep] = useState<RecipeStep>(0);
  const calc = useMemo(() => calculateAllMetrics(recipe), [recipe]);
  const updateGrain = (id: string, patch: Partial<GrainBillItem>) => onChange({ ...recipe, grains: recipe.grains.map(g => g.id === id ? { ...g, ...patch } : g) });
  const updateHop = (id: string, patch: Partial<HopAddition>) => onChange({ ...recipe, hops: recipe.hops.map(h => h.id === id ? { ...h, ...patch } : h) });
  const updateStage = (index: number, patch: Partial<FermentationStage>) => onChange({ ...recipe, fermentationStages: recipe.fermentationStages.map((s, i) => i === index ? { ...s, ...patch } : s) });

  return (
    <main className="bb-workroom">
      <header className="bb-workroom__head">
        <button onClick={onBack}><ArrowLeft /> Capa</button>
        <div><span>RECEITA EM CONSTRUÇÃO</span><strong>{recipe.name}</strong></div>
        <button onClick={onStartBrew} className="bb-head-action"><Flame /> Brassar</button>
      </header>
      <div className="bb-recipe-layout">
        <nav className="bb-steps" aria-label="Etapas da receita">
          {STEP_LABELS.map((label, i) => <button key={label} data-active={step === i || undefined} data-done={step > i || undefined} onClick={() => setStep(i as RecipeStep)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></button>)}
        </nav>
        <section className="bb-sheet">
          {step === 0 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">01 · INTENÇÃO</p>
              <h1>Que cerveja você quer fazer?</h1>
              <p className="bb-lead">Comece pela ideia. O estilo ajuda a calibrar, mas não decide por você.</p>
              <label className="bb-field"><span>Nome da receita</span><input value={recipe.name} onChange={(e) => onChange({ ...recipe, name: e.target.value })} /></label>
              <label className="bb-field"><span>Descrição em uma frase</span><input value={recipe.tagline || ''} onChange={(e) => onChange({ ...recipe, tagline: e.target.value })} placeholder="Ex.: seca, cítrica e fácil de beber" /></label>
              <div className="bb-intent-style">
                <div><span>REFERÊNCIA ATUAL</span><strong>{recipe.style.code} · {recipe.style.name}</strong><p>{recipe.style.aromaProfile}</p></div>
                <button onClick={onAtlas}><Search /> Escolher outro estilo</button>
              </div>
              <div className="bb-two-fields">
                <label className="bb-field"><span>Volume do lote</span><div><input type="number" min="1" value={recipe.batchSizeLiters} onChange={(e) => onChange({ ...recipe, batchSizeLiters: Math.max(1, Number(e.target.value) || 1) })} /><i>L</i></div></label>
                <label className="bb-field"><span>Eficiência esperada</span><div><input type="number" min="40" max="95" value={recipe.efficiencyPercent} onChange={(e) => onChange({ ...recipe, efficiencyPercent: Number(e.target.value) || 72 })} /><i>%</i></div></label>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">02 · ESTRUTURA</p><h1>Construa a base.</h1><p className="bb-lead">Peso, potencial e cor. Sem carta 3D, sem catálogo no caminho.</p>
              <div className="bb-rows">
                {recipe.grains.map((g) => <div className="bb-row" key={g.id}><Wheat /><input className="bb-row__name" value={g.name} onChange={(e) => updateGrain(g.id, { name: e.target.value })} /><label><input type="number" step="0.05" value={g.amountKg} onChange={(e) => updateGrain(g.id, { amountKg: Number(e.target.value) || 0 })} /> kg</label><label><input type="number" step="0.5" value={g.ebc} onChange={(e) => updateGrain(g.id, { ebc: Number(e.target.value) || 0 })} /> EBC</label><button onClick={() => onChange({ ...recipe, grains: recipe.grains.filter(x => x.id !== g.id) })}><X /></button></div>)}
              </div>
              <button className="bb-add" onClick={() => onChange({ ...recipe, grains: [...recipe.grains, { id: uid('grain'), name: 'Novo malte', amountKg: 0.5, potentialSg: 1.036, ebc: 5, type: 'Base' }] })}><Plus /> Adicionar malte ou grão</button>
              <div className="bb-total-line"><span>Total de grãos</span><strong>{calc.totalGrainKg.toFixed(2)} kg</strong></div>
            </div>
          )}
          {step === 2 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">03 · LÚPULO</p><h1>Pense em tempo, não em tabela.</h1><p className="bb-lead">A posição mostra quando cada adição entra no processo.</p>
              <div className="bb-hop-line"><span>60 min</span><i /><span>30</span><i /><span>15</span><i /><span>5</span><i /><span>Whirlpool</span><i /><span>Dry hop</span></div>
              <div className="bb-hops">
                {recipe.hops.map((h) => <div className="bb-hop" key={h.id} data-use={h.use}><div><span>{h.use}</span><strong>{h.name}</strong></div><label><input value={h.amountGrams} type="number" onChange={(e) => updateHop(h.id, { amountGrams: Number(e.target.value) || 0 })} /> g</label><label><input value={h.alphaAcids} type="number" step="0.1" onChange={(e) => updateHop(h.id, { alphaAcids: Number(e.target.value) || 0 })} /> %AA</label><label><input value={h.timeMinutes} type="number" onChange={(e) => updateHop(h.id, { timeMinutes: Number(e.target.value) || 0 })} /> {h.use === 'Dry Hop' ? 'dias' : 'min'}</label><select value={h.use} onChange={(e) => updateHop(h.id, { use: e.target.value as HopAddition['use'] })}><option>Boil</option><option>Whirlpool</option><option>Dry Hop</option><option>First Wort</option><option>Mash</option></select><button onClick={() => onChange({ ...recipe, hops: recipe.hops.filter(x => x.id !== h.id) })}><X /></button></div>)}
              </div>
              <button className="bb-add" onClick={() => onChange({ ...recipe, hops: [...recipe.hops, { id: uid('hop'), name: 'Novo lúpulo', amountGrams: 20, alphaAcids: 10, timeMinutes: 10, use: 'Boil', form: 'Pellet' }] })}><Plus /> Adicionar lúpulo</button>
              <div className="bb-total-line"><span>Amargor previsto</span><strong>{Math.round(calc.ibu)} IBU</strong></div>
            </div>
          )}
          {step === 3 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">04 · FERMENTAÇÃO</p><h1>Escolha a levedura e dê um caminho.</h1>
              <div className="bb-yeast-card"><div><span>LEVEDURA</span><strong>{recipe.yeast.name}</strong><p>{recipe.yeast.brand} · {recipe.yeast.strain}</p></div><div><span>ATENUAÇÃO</span><b>{recipe.yeast.attenuationAvg}%</b><span>FAIXA</span><b>{recipe.yeast.optimalTempMin}–{recipe.yeast.optimalTempMax}°C</b></div></div>
              <div className="bb-ferment-track">
                {recipe.fermentationStages.map((s, i) => <div className="bb-ferment-stage" key={`${s.name}-${i}`}><span>{String(i + 1).padStart(2, '0')}</span><input value={s.name} onChange={(e) => updateStage(i, { name: e.target.value })} /><label><Thermometer /><input type="number" value={s.tempCelsius} onChange={(e) => updateStage(i, { tempCelsius: Number(e.target.value) || 0 })} />°C</label><label><Clock3 /><input type="number" value={s.durationDays} onChange={(e) => updateStage(i, { durationDays: Number(e.target.value) || 0 })} /> dias</label></div>)}
              </div>
              <p className="bb-rule-note">Temperatura real do lote será registrada depois, no Caderno. Aqui ficam apenas os alvos.</p>
            </div>
          )}
          {step === 4 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">05 · ÁGUA</p><h1>Alvo claro. Medição separada.</h1><p className="bb-lead">A receita guarda o perfil desejado; a brassagem guarda o que você mediu.</p>
              <div className="bb-water-grid">
                {[['Ca','calcium'],['Mg','magnesium'],['Na','sodium'],['Cl','chloride'],['SO₄','sulfate'],['HCO₃','bicarbonate']].map(([label, key]) => <label key={key}><span>{label}</span><input type="number" value={(recipe.waterTarget as unknown as Record<string, number>)[key]} onChange={(e) => onChange({ ...recipe, waterTarget: { ...recipe.waterTarget, [key]: Number(e.target.value) || 0 } })} /><small>ppm</small></label>)}
              </div>
              <div className="bb-salts"><h3>Adições previstas</h3><div>{[['Gesso','gypsumGrams'],['CaCl₂','calciumChlorideGrams'],['Epsom','epsomSaltGrams'],['NaCl','tableSaltGrams'],['Bicarbonato','bakingSodaGrams'],['Ácido lático 88%','lacticAcid88Ml']].map(([label,key]) => <label key={key}><span>{label}</span><input type="number" step="0.1" value={(recipe.waterSalts as unknown as Record<string, number>)[key]} onChange={(e) => onChange({ ...recipe, waterSalts: { ...recipe.waterSalts, [key]: Number(e.target.value) || 0 } })} /><small>{key === 'lacticAcid88Ml' ? 'mL' : 'g'}</small></label>)}</div></div>
              <div className="bb-total-line"><span>Água total prevista</span><strong>{calc.totalWaterNeededLiters.toFixed(1)} L</strong></div>
            </div>
          )}
          {step === 5 && (
            <div className="bb-sheet__section">
              <p className="bb-eyebrow">06 · REVISÃO</p><h1>Antes de aquecer a água.</h1>
              <div className="bb-review-hero"><BeerSilhouette color={calc.colorHex} name={recipe.name} /><div><span>{recipe.style.code} · {recipe.style.name}</span><h2>{recipe.name}</h2><p>{recipe.tagline}</p><button onClick={onStartBrew}><Flame /> Começar brassagem</button></div></div>
              <div className="bb-review-numbers"><div><span>OG</span><b>{fmtGravity(calc.og)}</b></div><div><span>FG</span><b>{fmtGravity(calc.fg)}</b></div><div><span>ABV</span><b>{calc.abv.toFixed(1)}%</b></div><div><span>IBU</span><b>{Math.round(calc.ibu)}</b></div><div><span>SRM</span><b>{calc.srm.toFixed(1)}</b></div></div>
              <p className="bb-rule-note">Os números são previsões. Durante a brassagem, registre OG, volumes, temperatura e pH reais no lote.</p>
            </div>
          )}
          <footer className="bb-sheet__footer"><button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1) as RecipeStep)}><ArrowLeft /> Anterior</button><span>{step + 1} / 6</span>{step < 5 ? <button onClick={() => setStep(Math.min(5, step + 1) as RecipeStep)}>Próximo <ArrowRight /></button> : <button onClick={onStartBrew}>Brassar <Flame /></button>}</footer>
        </section>
        <StyleInstrument recipe={recipe} />
      </div>
    </main>
  );
}

type BrewPhase = { id: string; title: string; eyebrow: string; target?: string; durationMinutes?: number; note: string; alert?: string };

function buildBrewPhases(recipe: BeerRecipe): BrewPhase[] {
  const phases: BrewPhase[] = [{ id: 'prep', title: 'Preparar água e equipamento', eyebrow: 'PREPARO', target: `${recipe.batchSizeLiters} L finais`, note: 'Separe ingredientes, confira volumes e deixe o sistema pronto antes de começar.' }];
  recipe.mashSchedule.forEach((m, i) => phases.push({ id: `mash-${i}`, title: m.name, eyebrow: 'MOSTURA', target: `${m.tempCelsius}°C`, durationMinutes: m.durationMinutes, note: m.description || 'Mantenha a temperatura o mais estável possível.' }));
  phases.push({ id: 'boil', title: 'Fervura', eyebrow: 'FERVURA', target: `${recipe.boilTimeMinutes} min`, durationMinutes: recipe.boilTimeMinutes, note: 'Fervura vigorosa e destampada.', alert: recipe.hops.filter(h => h.use === 'Boil').sort((a,b) => b.timeMinutes-a.timeMinutes).map(h => `${h.timeMinutes} min: ${h.amountGrams} g ${h.name}`).join(' · ') || undefined });
  const whirl = recipe.hops.filter(h => h.use === 'Whirlpool');
  if (whirl.length) phases.push({ id: 'whirlpool', title: 'Whirlpool', eyebrow: 'AROMA', target: whirl[0].tempCelsius ? `${whirl[0].tempCelsius}°C` : undefined, durationMinutes: Math.max(...whirl.map(h => h.timeMinutes || 10)), note: whirl.map(h => `${h.amountGrams} g ${h.name}`).join(' · ') });
  phases.push({ id: 'chill', title: 'Resfriar e inocular', eyebrow: 'FERMENTAÇÃO', target: `${recipe.yeast.optimalTempMin}–${recipe.yeast.optimalTempMax}°C`, note: `Resfrie, transfira com cuidado e inocule ${recipe.yeast.name}.` });
  return phases;
}

function BrewMode({ recipe, sessions, onSessions, onExit }: { recipe: BeerRecipe; sessions: BrewSession[]; onSessions: (s: BrewSession[]) => void; onExit: () => void }) {
  const calc = calculateAllMetrics(recipe);
  const phases = useMemo(() => buildBrewPhases(recipe), [recipe]);
  const existing = sessions.find(s => s.recipeId === recipe.id && (s.status === 'planned' || s.status === 'brewing'));
  const [sessionId] = useState(existing?.id || uid('batch'));
  const initialIndex = existing?.currentStepIndex || 0;
  const [index, setIndex] = useState(initialIndex);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState((phases[initialIndex]?.durationMinutes || 0) * 60);
  const [readingKind, setReadingKind] = useState<BrewReading['kind']>('temperature');
  const [readingValue, setReadingValue] = useState('');
  const phase = phases[index] || phases[phases.length - 1];

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft(v => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    const session: BrewSession = existing ? { ...existing } : {
      id: sessionId,
      recipeId: recipe.id,
      recipeName: recipe.name,
      brewedAt: today(),
      status: 'brewing',
      currentStepIndex: index,
      planned: { originalGravity: calc.og, finalGravity: calc.fg, abv: calc.abv, ibu: calc.ibu, srm: calc.srm, efficiencyPercent: recipe.efficiencyPercent, batchSizeLiters: recipe.batchSizeLiters, styleCode: recipe.style.code, styleName: recipe.style.name },
      readings: [],
    };
    session.currentStepIndex = index;
    session.status = index >= phases.length - 1 ? 'brewing' : 'brewing';
    session.updatedAt = new Date().toISOString();
    const next = sessions.some(s => s.id === session.id) ? sessions.map(s => s.id === session.id ? session : s) : [session, ...sessions];
    onSessions(next);
    // intentional one-time/session sync points are handled by event actions as well
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const syncSession = (patch: Partial<BrewSession>) => {
    const current = sessions.find(s => s.id === sessionId) || existing || {
      id: sessionId, recipeId: recipe.id, recipeName: recipe.name, brewedAt: today(), status: 'brewing' as const, readings: [], planned: { originalGravity: calc.og, finalGravity: calc.fg, abv: calc.abv, ibu: calc.ibu, srm: calc.srm, efficiencyPercent: recipe.efficiencyPercent, batchSizeLiters: recipe.batchSizeLiters, styleCode: recipe.style.code, styleName: recipe.style.name }
    };
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const next = sessions.some(s => s.id === updated.id) ? sessions.map(s => s.id === updated.id ? updated : s) : [updated, ...sessions];
    onSessions(next);
  };

  const nextPhase = () => {
    const next = Math.min(phases.length - 1, index + 1);
    setIndex(next); setRunning(false); setSecondsLeft((phases[next].durationMinutes || 0) * 60);
    if (index === phases.length - 1) syncSession({ status: 'fermenting', currentStepIndex: index }); else syncSession({ currentStepIndex: next });
  };
  const addReading = () => {
    if (!readingValue.trim()) return;
    const numericKinds: BrewReading['kind'][] = ['preBoilGravity','preBoilVolume','postBoilVolume','originalGravity','finalGravity','pitchTemperature','mashPh','temperature'];
    const parsed = numericKinds.includes(readingKind) ? Number(readingValue.replace(',', '.')) : readingValue;
    const reading: BrewReading = { id: uid('read'), recordedAt: new Date().toISOString(), kind: readingKind, label: readingKind, value: Number.isNaN(parsed as number) ? readingValue : parsed };
    const current = sessions.find(s => s.id === sessionId);
    const readings = [...(current?.readings || []), reading];
    const actuals = { ...(current?.actuals || {}) };
    if (readingKind === 'originalGravity' && typeof parsed === 'number') actuals.originalGravity = parsed;
    if (readingKind === 'finalGravity' && typeof parsed === 'number') actuals.finalGravity = parsed;
    if (readingKind === 'mashPh' && typeof parsed === 'number') actuals.mashPh = parsed;
    if (readingKind === 'pitchTemperature' && typeof parsed === 'number') actuals.pitchTempCelsius = parsed;
    if (readingKind === 'preBoilGravity' && typeof parsed === 'number') actuals.preBoilGravity = parsed;
    if (readingKind === 'preBoilVolume' && typeof parsed === 'number') actuals.preBoilVolumeLiters = parsed;
    if (readingKind === 'postBoilVolume' && typeof parsed === 'number') actuals.postBoilVolumeLiters = parsed;
    syncSession({ readings, actuals }); setReadingValue('');
  };
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <main className="bb-brewmode">
      <header><button onClick={onExit}><X /></button><div><span>{recipe.name}</span><strong>{index + 1} / {phases.length}</strong></div></header>
      <section className="bb-brewmode__stage">
        <p>{phase.eyebrow}</p><h1>{phase.title}</h1>{phase.target && <div className="bb-target">{phase.target}</div>}
        {phase.durationMinutes ? <button className="bb-timer" onClick={() => setRunning(v => !v)}><span>{mm}:{ss}</span><small>{running ? <><Pause /> Pausar</> : <><Play /> Iniciar</>}</small></button> : <div className="bb-no-timer"><Gauge /><span>Sem cronômetro obrigatório</span></div>}
        <p className="bb-stage-note">{phase.note}</p>
        {phase.alert && <div className="bb-stage-alert"><Clock3 /><span><b>Linha do lúpulo</b>{phase.alert}</span></div>}
      </section>
      <aside className="bb-live-log">
        <h2>Registrar o que aconteceu</h2><div className="bb-live-log__entry"><select value={readingKind} onChange={e => setReadingKind(e.target.value as BrewReading['kind'])}><option value="temperature">Temperatura</option><option value="mashPh">pH da mostura</option><option value="preBoilGravity">Densidade pré-fervura</option><option value="preBoilVolume">Volume pré-fervura</option><option value="postBoilVolume">Volume pós-fervura</option><option value="originalGravity">OG real</option><option value="pitchTemperature">Temperatura de inoculação</option><option value="note">Nota</option></select><input value={readingValue} onChange={e => setReadingValue(e.target.value)} placeholder={readingKind === 'note' ? 'Observação...' : 'Valor'} /><button onClick={addReading}><Plus /></button></div>
      </aside>
      <footer><button onClick={nextPhase}>{index === phases.length - 1 ? 'Enviar para fermentação' : 'Concluir etapa'} <ArrowRight /></button></footer>
    </main>
  );
}

function Notebook({ sessions, recipes, onSessions, onBack }: { sessions: BrewSession[]; recipes: BeerRecipe[]; onSessions: (s: BrewSession[]) => void; onBack: () => void }) {
  const [selected, setSelected] = useState(sessions[0]?.id || '');
  const current = sessions.find(s => s.id === selected);
  const sameRecipe = current ? sessions.filter(s => s.recipeId === current.recipeId).sort((a,b) => b.brewedAt.localeCompare(a.brewedAt)) : [];
  const updateCurrent = (patch: Partial<BrewSession>) => current && onSessions(sessions.map(s => s.id === current.id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s));
  const calcActualAbv = current?.actuals?.originalGravity && current?.actuals?.finalGravity ? (current.actuals.originalGravity - current.actuals.finalGravity) * 131.25 : current?.actuals?.abv;
  return (
    <main className="bb-notebook">
      <header className="bb-page-head"><button onClick={onBack}><ArrowLeft /> Capa</button><div><span>CADERNO DEMOCRATA</span><h1>O que realmente aconteceu.</h1></div></header>
      {sessions.length === 0 ? <section className="bb-empty"><NotebookPen /><h2>O caderno ainda está em branco.</h2><p>Quando você iniciar uma brassagem, o lote aparece aqui separado da receita.</p></section> : <div className="bb-notebook__layout">
        <nav className="bb-batch-list">{sessions.map((s,i) => <button key={s.id} data-active={s.id === selected || undefined} onClick={() => setSelected(s.id)}><span>{String(sessions.length-i).padStart(2,'0')}</span><div><strong>{s.recipeName}</strong><small>{s.brewedAt} · {s.status}</small></div><ChevronRight /></button>)}</nav>
        {current && <article className="bb-batch-page">
          <p className="bb-eyebrow">LOTE REAL</p><h2>{current.recipeName}</h2><p>{current.brewedAt} · {current.status}</p>
          <section className="bb-planned-actual"><div><span>OG</span><small>prevista</small><b>{current.planned?.originalGravity?.toFixed(3) || '—'}</b><small>real</small><strong>{current.actuals?.originalGravity?.toFixed(3) || '—'}</strong></div><div><span>FG</span><small>prevista</small><b>{current.planned?.finalGravity?.toFixed(3) || '—'}</b><small>real</small><strong>{current.actuals?.finalGravity?.toFixed(3) || '—'}</strong></div><div><span>ABV</span><small>previsto</small><b>{current.planned?.abv?.toFixed(1) || '—'}%</b><small>real</small><strong>{calcActualAbv?.toFixed(1) || '—'}%</strong></div></section>
          <label className="bb-notes"><span>Notas do lote</span><textarea value={current.notes || ''} onChange={e => updateCurrent({ notes: e.target.value })} placeholder="O que mudaria na próxima?" /></label>
          <div className="bb-rating"><span>Resultado</span><div>{[1,2,3,4,5].map(n => <button key={n} onClick={() => updateCurrent({ rating: n as 1|2|3|4|5 })} data-active={(current.rating || 0) >= n || undefined}><Star /></button>)}</div><label><input type="checkbox" checked={current.wouldBrewAgain || false} onChange={e => updateCurrent({ wouldBrewAgain: e.target.checked })} /> Eu faria novamente</label></div>
          {sameRecipe.length > 1 && <section className="bb-compare"><h3>Comparar brassagens desta receita</h3><div className="bb-compare__scroll"><table><thead><tr><th>Lote</th>{sameRecipe.map(s => <th key={s.id}>{s.brewedAt}</th>)}</tr></thead><tbody><tr><td>OG real</td>{sameRecipe.map(s => <td key={s.id}>{s.actuals?.originalGravity?.toFixed(3) || '—'}</td>)}</tr><tr><td>FG real</td>{sameRecipe.map(s => <td key={s.id}>{s.actuals?.finalGravity?.toFixed(3) || '—'}</td>)}</tr><tr><td>Eficiência</td>{sameRecipe.map(s => <td key={s.id}>{s.actuals?.efficiencyPercent ? `${s.actuals.efficiencyPercent}%` : '—'}</td>)}</tr><tr><td>Nota</td>{sameRecipe.map(s => <td key={s.id}>{s.rating ? `${s.rating}/5` : '—'}</td>)}</tr></tbody></table></div></section>}
        </article>}
      </div>}
    </main>
  );
}

function Atlas({ recipe, onStyle, onBack }: { recipe: BeerRecipe; onStyle: (s: BJCPStyle) => void; onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BJCPStyle>(recipe.style);
  const filtered = BJCP_STYLES.filter(s => `${s.code} ${s.name} ${s.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 60);
  return (
    <main className="bb-atlas"><header className="bb-page-head"><button onClick={onBack}><ArrowLeft /> Voltar</button><div><span>ATLAS BJCP 2021</span><h1>Referência, não receita pronta.</h1></div></header><div className="bb-atlas__layout"><section className="bb-atlas__index"><label><Search /><input placeholder="Buscar estilo, código ou categoria" value={query} onChange={e => setQuery(e.target.value)} /></label><div>{filtered.map(s => <button key={s.id} onClick={() => setSelected(s)} data-active={selected.id === s.id || undefined}><span>{s.code}</span><strong>{s.name}</strong><small>{s.category}</small></button>)}</div></section><article className="bb-style-page"><p className="bb-eyebrow">{selected.code} · {selected.category}</p><h2>{selected.name}</h2><p className="bb-style-intro">{selected.flavorProfile}</p><div className="bb-style-ranges"><div><span>OG</span><b>{fmtGravity(selected.ogMin)}–{fmtGravity(selected.ogMax)}</b></div><div><span>FG</span><b>{fmtGravity(selected.fgMin)}–{fmtGravity(selected.fgMax)}</b></div><div><span>ABV</span><b>{selected.abvMin.toFixed(1)}–{selected.abvMax.toFixed(1)}%</b></div><div><span>IBU</span><b>{selected.ibuMin}–{selected.ibuMax}</b></div><div><span>SRM</span><b>{selected.srmMin}–{selected.srmMax}</b></div></div><h3>Aroma</h3><p>{selected.aromaProfile}</p><h3>Aparência</h3><p>{selected.appearance}</p><button className="bb-style-apply" onClick={() => { onStyle(selected); onBack(); }}><Check /> Usar como referência da receita</button></article></div></main>
  );
}

function DiagnosticView({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(DIAGNOSTICS[0]);
  const filtered = DIAGNOSTICS.filter(d => `${d.perception} ${d.likely}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <main className="bb-diagnostic"><header className="bb-page-head"><button onClick={onBack}><ArrowLeft /> Capa</button><div><span>DIAGNÓSTICO SENSORIAL</span><h1>Comece pelo que você percebe.</h1></div></header><div className="bb-diagnostic__layout"><section><label className="bb-diagnostic__search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: manteiga, maçã verde, papelão..." /></label>{filtered.map(d => <button key={d.id} onClick={() => setSelected(d)} data-active={selected.id === d.id || undefined}><span>{d.perception}</span><strong>{d.likely}</strong></button>)}</section><article><p className="bb-eyebrow">HIPÓTESE MAIS PROVÁVEL</p><h2>{selected.likely}</h2><h3>O que costuma causar</h3><ul>{selected.causes.map(c => <li key={c}>{c}</li>)}</ul><h3>O que dá para fazer neste lote</h3><p>{selected.now}</p><h3>Na próxima brassagem</h3><p>{selected.next}</p><div className="bb-caution"><TriangleAlert /><span>Diagnóstico sensorial não é certeza laboratorial. Use como triagem e confirme pelo processo do lote.</span></div></article></div></main>
  );
}

export function BrewbookApp() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(SESSION_UNLOCK_KEY) === 'true');
  const [view, setView] = useState<View>('cover');
  const [recipes, setRecipes] = useState<BeerRecipe[]>(() => loadRecipes(SIGNATURE_RECIPES));
  const [sessions, setSessions] = useState<BrewSession[]>(loadBrewSessions);
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || SIGNATURE_RECIPES[0].id);
  const recipe = recipes.find(r => r.id === recipeId) || recipes[0] || SIGNATURE_RECIPES[0];

  useEffect(() => writeStoredArray(STORAGE_KEYS.recipes, recipes), [recipes]);
  useEffect(() => saveBrewSessions(sessions), [sessions]);

  const updateRecipe = (next: BeerRecipe) => setRecipes(prev => prev.map(r => r.id === next.id ? next : r));
  const createRecipe = () => {
    const source = recipe || SIGNATURE_RECIPES[0];
    const next: BeerRecipe = { ...source, id: uid('recipe'), name: `Nova receita ${recipes.length + 1}`, tagline: '', grains: source.grains.map(g => ({ ...g, id: uid('grain') })), hops: source.hops.map(h => ({ ...h, id: uid('hop') })), createdAt: new Date().toLocaleDateString('pt-BR') };
    setRecipes(prev => [next, ...prev]); setRecipeId(next.id); setView('recipe');
  };

  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;
  if (view === 'recipe') return <RecipeEditor recipe={recipe} onChange={updateRecipe} onBack={() => setView('cover')} onStartBrew={() => setView('brew')} onAtlas={() => setView('atlas')} />;
  if (view === 'brew') return <BrewMode recipe={recipe} sessions={sessions} onSessions={setSessions} onExit={() => setView('cover')} />;
  if (view === 'notebook') return <Notebook sessions={sessions} recipes={recipes} onSessions={setSessions} onBack={() => setView('cover')} />;
  if (view === 'atlas') return <Atlas recipe={recipe} onStyle={(style) => updateRecipe({ ...recipe, style })} onBack={() => setView('recipe')} />;
  if (view === 'diagnostic') return <DiagnosticView onBack={() => setView('cover')} />;

  return <>
    <Cover recipe={recipe} onRecipe={() => setView('recipe')} onBrew={() => setView('brew')} onNotebook={() => setView('notebook')} onAtlas={() => setView('atlas')} />
    <div className="bb-floating-tools">
      <button onClick={createRecipe}><Plus /> Nova receita</button>
      <button onClick={() => setView('diagnostic')}><ShieldCheck /> Diagnóstico</button>
      <label><span className="sr-only">Receita aberta</span><select value={recipe.id} onChange={e => setRecipeId(e.target.value)}>{recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    </div>
  </>;
}

export default BrewbookApp;
