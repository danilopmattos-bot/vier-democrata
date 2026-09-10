import React, { useEffect, useId, useMemo, useState } from 'react';
import './v7-portrait-delete.css';
import './v8-usability.css';
import {
  ArrowLeft,
  ArrowRight,
  Beer,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  FlaskConical,
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
  Star,
  Thermometer,
  Trash2,
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
import { BJCP_STYLES, GRAINS_DATABASE, HOPS_DATABASE, SIGNATURE_RECIPES, YEAST_DATABASE } from '../data/ingredients';
import {
  brixToFinalGravity,
  calculateABV,
  calculateAllMetrics,
  calculatePrimingSugar,
  calculateYeastPitch,
  srmToHex,
} from '../utils/brewingCalculations';
import {
  loadBrewSessions,
  loadRecipes,
  saveBrewSessions,
  STORAGE_KEYS,
  writeStoredArray,
} from '../utils/localStorage';

const PIN_STORAGE_KEY = 'democrata_lab_private_pin';
const SESSION_UNLOCK_KEY = 'democrata_lab_unlocked_session';

type View = 'home' | 'recipe' | 'brew' | 'notebook' | 'tools' | 'atlas' | 'diagnostic';
type RecipeStep = 0 | 1 | 2 | 3 | 4 | 5;
type ToolId = 'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast' | 'conversions';

type Diagnostic = {
  id: string;
  perception: string;
  likely: string;
  causes: string[];
  now: string;
  next: string;
};

const DIAGNOSTICS: Diagnostic[] = [
  {
    id: 'diacetyl',
    perception: 'Manteiga, pipoca, caramelo amanteigado',
    likely: 'Diacetil',
    causes: ['Fermentação encerrada cedo', 'Levedura estressada', 'Temperatura baixa demais no fim'],
    now: 'Se ainda está no fermentador, dê tempo à levedura e mantenha a cerveja em temperatura adequada para ela terminar o trabalho.',
    next: 'Evite resfriar cedo, dimensione melhor a levedura e confirme densidade estável antes de finalizar.',
  },
  {
    id: 'acetaldehyde',
    perception: 'Maçã verde, cidra, abóbora crua',
    likely: 'Acetaldeído',
    causes: ['Cerveja muito jovem', 'Fermentação incompleta', 'Oxidação durante a fermentação'],
    now: 'Se a cerveja ainda está fermentando, normalmente vale dar mais tempo à levedura.',
    next: 'Evite trasfegar cedo e confirme a estabilidade da densidade antes do envase.',
  },
  {
    id: 'dms',
    perception: 'Milho cozido, legumes cozidos',
    likely: 'DMS',
    causes: ['Fervura pouco vigorosa', 'Panela tampada', 'Resfriamento lento'],
    now: 'Depois de pronto é difícil corrigir. Avalie a intensidade antes de decidir o destino do lote.',
    next: 'Ferva destampado e resfrie o mosto com rapidez.',
  },
  {
    id: 'oxidation',
    perception: 'Papelão, vinho velho, mel escurecido',
    likely: 'Oxidação',
    causes: ['Entrada de oxigênio após a fermentação', 'Transferência com respingo', 'Envase mal purgado'],
    now: 'Não existe correção completa depois que a oxidação aparece.',
    next: 'Reduza respingos e contato com ar do fim da fermentação até o copo.',
  },
  {
    id: 'phenolic',
    perception: 'Plástico, medicinal, esparadrapo',
    likely: 'Fenólico indesejado / clorofenol',
    causes: ['Cloro ou cloramina na água', 'Contaminação', 'Levedura inadequada ao estilo'],
    now: 'Clorofenol raramente melhora de forma significativa com o tempo.',
    next: 'Remova cloro/cloramina da água e revise a sanitização.',
  },
  {
    id: 'fusel',
    perception: 'Álcool quente, solvente, ardência',
    likely: 'Álcoois superiores',
    causes: ['Fermentação quente', 'Pitch insuficiente', 'Levedura estressada em OG alta'],
    now: 'Maturação pode arredondar parte da percepção, mas não costuma eliminar o problema.',
    next: 'Controle a temperatura e dimensione melhor a levedura para mostos fortes.',
  },
  {
    id: 'astringent',
    perception: 'Boca seca, chá preto forte, casca de fruta',
    likely: 'Adstringência',
    causes: ['Lavagem excessiva', 'pH alto na lavagem', 'Extração agressiva dos grãos'],
    now: 'O tempo pode suavizar pouco. O ganho principal vem de corrigir o processo futuro.',
    next: 'Controle pH de mostura/lavagem e evite extrair demais dos grãos.',
  },
];

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toISOString().slice(0, 10);
const fmtGravity = (value?: number) => typeof value === 'number' ? value.toFixed(3) : '—';
const num = (value: string, fallback: number) => {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`v6-brand ${compact ? 'v6-brand--compact' : ''}`}>
      <span className="v6-brand__seal">
        <img src="/democrata-logo.svg" alt="Logo Democrata Bier" />
      </span>
      <span className="v6-brand__type">
        <strong>DEMOCRATA</strong>
        <small>BREWBOOK</small>
      </span>
    </div>
  );
}

function BeerPortrait({ recipe, compact = false }: { recipe: BeerRecipe; compact?: boolean }) {
  const calc = useMemo(() => calculateAllMetrics(recipe), [recipe]);
  const rawId = useId().replace(/:/g, '');
  const clipId = `v8-pint-${rawId}`;
  const liquidId = `v8-liquid-${rawId}`;
  const color = srmToHex(calc.srm);
  const appearanceSource = `${recipe.style.name} ${recipe.style.category} ${recipe.style.appearance || ''} ${recipe.style.flavorProfile || ''}`.toLowerCase();
  const hazy = /hazy|new england|juicy|wit|weizen|wheat|hefe|keller|turv/.test(appearanceSource);
  const tone = calc.srm < 3 ? 'palha clara' : calc.srm < 5 ? 'dourada clara' : calc.srm < 8 ? 'dourada' : calc.srm < 12 ? 'âmbar' : calc.srm < 18 ? 'cobre' : calc.srm < 25 ? 'marrom' : calc.srm < 40 ? 'marrom profunda' : 'preta profunda';
  const clarity = hazy ? 'tendência turva pelo estilo' : calc.srm >= 30 ? 'baixa transparência pela cor' : 'tendência límpida';
  const hazeOpacity = hazy ? 0.22 : calc.srm >= 30 ? 0.04 : 0.02;

  return (
    <section className={`v8-beer-sample ${compact ? 'v8-beer-sample--compact' : ''}`} aria-label={`Amostra visual da receita ${recipe.name}`}>
      <div className="v8-beer-sample__glass">
        <svg viewBox="0 0 220 286" role="img" aria-label={`Copo com cor estimada em ${calc.srm.toFixed(1)} SRM`}>
          <defs>
            <clipPath id={clipId}>
              <path d="M48 28 L172 28 L160 220 Q157 242 110 247 Q63 242 60 220 Z" />
            </clipPath>
            <linearGradient id={liquidId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity=".18" />
              <stop offset=".23" stopColor="#fff" stopOpacity=".14" />
              <stop offset=".52" stopColor="#fff" stopOpacity=".02" />
              <stop offset="1" stopColor="#000" stopOpacity=".24" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect x="42" y="66" width="136" height="190" fill={color} />
            <rect x="42" y="66" width="136" height="190" fill="#f4dfaf" opacity={hazeOpacity} />
            <rect x="42" y="66" width="136" height="190" fill={`url(#${liquidId})`} />
            <path d="M45 66 Q72 55 96 65 T142 63 T178 67 L178 88 Q154 82 132 88 T86 86 T45 88 Z" fill="#fff1ce" opacity=".98" />
            <path d="M52 69 Q74 61 91 68 T126 66 T166 69" fill="none" stroke="#fff9e9" strokeWidth="12" strokeLinecap="round" opacity=".88" />
            <g fill="#fff7df" opacity=".42">
              <circle cx="80" cy="181" r="2" /><circle cx="103" cy="158" r="1.5" /><circle cx="139" cy="201" r="1.8" /><circle cx="151" cy="132" r="1.3" />
            </g>
          </g>
          <path d="M48 28 L60 220 Q63 242 110 247 Q157 242 160 220 L172 28" fill="none" stroke="#f6ead3" strokeWidth="4" opacity=".82" />
          <path d="M48 28 Q110 39 172 28" fill="none" stroke="#fff7e6" strokeWidth="5" opacity=".72" />
          <path d="M66 54 Q62 145 75 204" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".16" />
          <ellipse cx="110" cy="251" rx="49" ry="8" fill="none" stroke="#f2e4ca" strokeWidth="3" opacity=".42" />
        </svg>
      </div>
      <div className="v8-beer-sample__copy">
        <span>COR DA RECEITA</span>
        <div className="v8-beer-sample__value"><strong>{calc.srm.toFixed(1)}</strong><small>SRM</small></div>
        <h3>{tone}</h3>
        <p>{clarity}</p>
        <div className="v8-beer-sample__style-range"><i style={{ background: color }} /><span>Estilo: {recipe.style.srmMin}–{recipe.style.srmMax} SRM</span></div>
        <small>Cor estimada pelos grãos. Espuma e transparência reais dependem do processo.</small>
      </div>
    </section>
  );
}

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const expected = localStorage.getItem(PIN_STORAGE_KEY) || '1984';
    if (pin === expected) {
      localStorage.setItem(SESSION_UNLOCK_KEY, 'true');
      onUnlock();
      return;
    }
    setError('PIN incorreto.');
    setPin('');
  };

  return (
    <main className="v6-gate">
      <img className="v6-gate__photo" src="/brewmaster.jpg" alt="" />
      <div className="v6-gate__veil" />
      <section className="v6-gate__content">
        <Brand />
        <p className="v6-kicker">CADERNO PARTICULAR DE BRASSAGEM</p>
        <h1>Receita.<br />Brassagem.<br /><em>Memória.</em></h1>
        <p className="v6-gate__intro">Um lugar para pensar a cerveja, executar o lote e aprender com o que realmente aconteceu.</p>
        <form className="v6-pin" onSubmit={submit}>
          <label>
            <span>PIN de acesso</span>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(event) => {
                setPin(event.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="••••"
              aria-label="PIN de acesso"
            />
          </label>
          <button type="submit"><KeyRound /> Entrar</button>
        </form>
        {error && <p className="v6-error">{error}</p>}
      </section>
    </main>
  );
}

function Shell({
  view,
  setView,
  children,
}: {
  view: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}) {
  const nav: Array<{ id: View; label: string }> = [
    { id: 'home', label: 'Início' },
    { id: 'recipe', label: 'Receita' },
    { id: 'brew', label: 'Brassar' },
    { id: 'notebook', label: 'Caderno' },
    { id: 'tools', label: 'Ferramentas' },
  ];

  return (
    <div className="v6-shell">
      <header className="v6-topbar">
        <button className="v6-brand-button" onClick={() => setView('home')} aria-label="Voltar ao início">
          <Brand compact />
        </button>
        <nav className="v6-mainnav" aria-label="Navegação principal">
          {nav.map((item) => (
            <button key={item.id} data-active={view === item.id || undefined} onClick={() => setView(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="v6-secondary-nav">
          <button onClick={() => setView('atlas')}><Library /> BJCP</button>
          <button onClick={() => setView('diagnostic')}><ShieldCheck /> Diagnóstico</button>
        </div>
      </header>
      {children}
    </div>
  );
}

function Home({
  recipe,
  recipes,
  onSelectRecipe,
  onCreateRecipe,
  setView,
}: {
  recipe: BeerRecipe;
  recipes: BeerRecipe[];
  onSelectRecipe: (id: string) => void;
  onCreateRecipe: () => void;
  setView: (view: View) => void;
}) {
  const calc = calculateAllMetrics(recipe);

  const paths = [
    { id: 'recipe' as View, n: '01', icon: Wheat, title: 'Construir receita', sub: 'Ingrediente por ingrediente, decisão por decisão.' },
    { id: 'brew' as View, n: '02', icon: Flame, title: 'Brassar agora', sub: 'Uma etapa por vez. Alvos grandes. Mãos ocupadas.' },
    { id: 'notebook' as View, n: '03', icon: NotebookPen, title: 'Abrir o caderno', sub: 'Lotes reais, notas, diferenças e aprendizado.' },
    { id: 'tools' as View, n: '04', icon: Calculator, title: 'Ferramentas', sub: 'Priming, refratômetro, densímetro, diluição e levedura.' },
  ];

  return (
    <main className="v6-home">
      <img src="/brewmaster.jpg" alt="" className="v6-home__photo" />
      <div className="v6-home__shade" />
      <section className="v7-home-stage">
        <div className="v6-home__hero">
          <p className="v6-kicker">DEMOCRATA BIER · CADERNO DA CASA</p>
          <h1>O próximo lote<br />não começa no software.<br /><em>Começa numa decisão.</em></h1>
          <p>Planeje com referência. Brasse com atenção. Registre o que aconteceu. Faça a próxima melhor.</p>
        </div>
        <BeerPortrait recipe={recipe} />
      </section>

      <section className="v6-paths" aria-label="Ações principais">
        {paths.map(({ id, n, icon: Icon, title, sub }) => (
          <button key={id} onClick={() => setView(id)}>
            <span className="v6-paths__number">{n}</span>
            <Icon />
            <span><strong>{title}</strong><small>{sub}</small></span>
            <ChevronRight />
          </button>
        ))}
      </section>

      <section className="v6-current">
        <div className="v6-current__recipe">
          <span>RECEITA ABERTA</span>
          <select value={recipe.id} onChange={(event) => onSelectRecipe(event.target.value)} aria-label="Receita aberta">
            {recipes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <small>{recipe.style.code} · {recipe.style.name} · {recipe.batchSizeLiters} L</small>
        </div>
        <div className="v6-current__metrics">
          <div><b>{calc.og.toFixed(3)}</b><span>OG</span></div>
          <div><b>{calc.fg.toFixed(3)}</b><span>FG</span></div>
          <div><b>{calc.abv.toFixed(1)}%</b><span>ABV</span></div>
          <div><b>{Math.round(calc.ibu)}</b><span>IBU</span></div>
          <div><b>{calc.srm.toFixed(1)}</b><span>SRM</span></div>
        </div>
        <button className="v6-new" onClick={onCreateRecipe}><Plus /> Nova receita</button>
      </section>
    </main>
  );
}

const RECIPE_STEPS = ['Intenção', 'Estrutura', 'Lúpulo', 'Fermentação', 'Água', 'Revisão'] as const;

function StyleRail({ recipe }: { recipe: BeerRecipe }) {
  const calc = calculateAllMetrics(recipe);
  const rows = [
    ['OG', calc.og.toFixed(3), `${recipe.style.ogMin.toFixed(3)}–${recipe.style.ogMax.toFixed(3)}`, calc.bjcpCompliance.ogStatus],
    ['FG', calc.fg.toFixed(3), `${recipe.style.fgMin.toFixed(3)}–${recipe.style.fgMax.toFixed(3)}`, calc.bjcpCompliance.fgStatus],
    ['ABV', `${calc.abv.toFixed(1)}%`, `${recipe.style.abvMin.toFixed(1)}–${recipe.style.abvMax.toFixed(1)}%`, calc.bjcpCompliance.abvStatus],
    ['IBU', `${Math.round(calc.ibu)}`, `${recipe.style.ibuMin}–${recipe.style.ibuMax}`, calc.bjcpCompliance.ibuStatus],
    ['SRM', calc.srm.toFixed(1), `${recipe.style.srmMin}–${recipe.style.srmMax}`, calc.bjcpCompliance.srmStatus],
  ] as const;

  return (
    <aside className="v6-style-rail">
      <BeerPortrait recipe={recipe} compact />
      <p className="v6-kicker">REFERÊNCIA BJCP</p>
      <div className="v6-style-rail__name"><b>{recipe.style.code}</b><h2>{recipe.style.name}</h2></div>
      <p>{recipe.style.flavorProfile}</p>
      <div className="v6-style-rail__rows">
        {rows.map(([label, value, range, status]) => (
          <div key={label} data-state={status}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{range}</small>
            <em>{status === 'ok' ? 'na faixa' : status === 'low' ? 'abaixo' : 'acima'}</em>
          </div>
        ))}
      </div>
      <p className="v6-style-note">Fora da faixa não quer dizer “errado”. Quer dizer que você está se afastando da referência do estilo.</p>
    </aside>
  );
}

function RecipeEditor({
  recipe,
  onChange,
  onOpenAtlas,
  onStartBrew,
}: {
  recipe: BeerRecipe;
  onChange: (recipe: BeerRecipe) => void;
  onOpenAtlas: () => void;
  onStartBrew: () => void;
}) {
  const [step, setStep] = useState<RecipeStep>(0);
  const [grainPickerOpen, setGrainPickerOpen] = useState(false);
  const [grainSearch, setGrainSearch] = useState('');
  const [hopPickerOpen, setHopPickerOpen] = useState(false);
  const [hopSearch, setHopSearch] = useState('');
  const calc = useMemo(() => calculateAllMetrics(recipe), [recipe]);

  const filteredGrains = useMemo(() => {
    const query = grainSearch.trim().toLowerCase();
    const source = query
      ? GRAINS_DATABASE.filter((item) => `${item.name} ${item.origin} ${item.type} ${(item.sensoryNotes || []).join(' ')}`.toLowerCase().includes(query))
      : GRAINS_DATABASE;
    return source.slice(0, 18);
  }, [grainSearch]);

  const filteredHops = useMemo(() => {
    const query = hopSearch.trim().toLowerCase();
    const source = query
      ? HOPS_DATABASE.filter((item) => `${item.name} ${item.origin} ${item.profile} ${(item.sensoryNotes || []).join(' ')}`.toLowerCase().includes(query))
      : HOPS_DATABASE;
    return source.slice(0, 18);
  }, [hopSearch]);

  const addGrainFromCatalog = (item: (typeof GRAINS_DATABASE)[number]) => {
    onChange({
      ...recipe,
      grains: [...recipe.grains, {
        id: uid('grain'),
        name: item.name,
        amountKg: item.type === 'Base' ? 1 : 0.25,
        potentialSg: item.potentialSg,
        ebc: item.ebc,
        type: item.type,
      }],
    });
    setGrainPickerOpen(false);
    setGrainSearch('');
  };

  const addHopFromCatalog = (item: (typeof HOPS_DATABASE)[number]) => {
    onChange({
      ...recipe,
      hops: [...recipe.hops, {
        id: uid('hop'),
        name: item.name,
        amountGrams: 25,
        alphaAcids: item.alphaAcids,
        timeMinutes: 10,
        use: 'Boil',
        form: 'Pellet',
      }],
    });
    setHopPickerOpen(false);
    setHopSearch('');
  };

  const updateGrain = (id: string, patch: Partial<GrainBillItem>) => {
    onChange({ ...recipe, grains: recipe.grains.map((grain) => grain.id === id ? { ...grain, ...patch } : grain) });
  };
  const updateHop = (id: string, patch: Partial<HopAddition>) => {
    onChange({ ...recipe, hops: recipe.hops.map((hop) => hop.id === id ? { ...hop, ...patch } : hop) });
  };
  const updateStage = (index: number, patch: Partial<FermentationStage>) => {
    onChange({ ...recipe, fermentationStages: recipe.fermentationStages.map((stage, i) => i === index ? { ...stage, ...patch } : stage) });
  };

  return (
    <main className="v6-workroom">
      <nav className="v6-stepnav" aria-label="Etapas da receita">
        <p className="v6-kicker">RECEITA</p>
        {RECIPE_STEPS.map((label, index) => (
          <button key={label} data-active={index === step || undefined} data-done={index < step || undefined} onClick={() => setStep(index as RecipeStep)}>
            <span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong>
          </button>
        ))}
      </nav>

      <section className="v6-sheet">
        {step === 0 && (
          <div className="v6-section">
            <p className="v6-kicker">01 · INTENÇÃO</p>
            <h1>Que cerveja você quer fazer?</h1>
            <p className="v6-lead">Primeiro a intenção. Depois os números.</p>
            <label className="v6-field"><span>Nome da receita</span><input value={recipe.name} onChange={(e) => onChange({ ...recipe, name: e.target.value })} /></label>
            <label className="v6-field"><span>Em uma frase</span><input value={recipe.tagline || ''} onChange={(e) => onChange({ ...recipe, tagline: e.target.value })} placeholder="Ex.: seca, cítrica, aromática e fácil de beber" /></label>
            <div className="v6-reference">
              <div><span>ESTILO DE REFERÊNCIA</span><strong>{recipe.style.code} · {recipe.style.name}</strong><p>{recipe.style.aromaProfile}</p></div>
              <button onClick={onOpenAtlas}><Search /> Escolher estilo</button>
            </div>
            <div className="v6-two">
              <label className="v6-field"><span>Volume do lote</span><div><input type="number" value={recipe.batchSizeLiters} onChange={(e) => onChange({ ...recipe, batchSizeLiters: num(e.target.value, 20) })} /><i>L</i></div></label>
              <label className="v6-field"><span>Eficiência esperada</span><div><input type="number" value={recipe.efficiencyPercent} onChange={(e) => onChange({ ...recipe, efficiencyPercent: num(e.target.value, 72) })} /><i>%</i></div></label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="v6-section">
            <p className="v6-kicker">02 · ESTRUTURA</p>
            <h1>Construa a base.</h1>
            <p className="v6-lead">Malte base, especiais e adjuntos. Peso real, sem linguagem de laboratório desnecessária.</p>
            <div className="v6-table v6-table--grains">
              {recipe.grains.map((grain) => (
                <div className="v6-table__row" key={grain.id}>
                  <Wheat />
                  <input className="v6-name-input" value={grain.name} onChange={(e) => updateGrain(grain.id, { name: e.target.value })} />
                  <label><span>kg</span><input type="number" step="0.05" value={grain.amountKg} onChange={(e) => updateGrain(grain.id, { amountKg: num(e.target.value, 0) })} /></label>
                  <label><span>EBC</span><input type="number" value={grain.ebc} onChange={(e) => updateGrain(grain.id, { ebc: num(e.target.value, 0) })} /></label>
                  <button aria-label="Remover grão" onClick={() => onChange({ ...recipe, grains: recipe.grains.filter((item) => item.id !== grain.id) })}><X /></button>
                </div>
              ))}
            </div>
            <div className="v8-add-actions">
              <button className="v6-add" onClick={() => { setGrainPickerOpen((value) => !value); setHopPickerOpen(false); }}><Search /> Escolher malte</button>
              <button className="v8-custom-add" onClick={() => onChange({ ...recipe, grains: [...recipe.grains, { id: uid('grain'), name: 'Malte personalizado', amountKg: 0.5, potentialSg: 1.036, ebc: 5, type: 'Base' }] })}><Plus /> Personalizado</button>
            </div>
            {grainPickerOpen && (
              <section className="v8-picker" aria-label="Catálogo de maltes">
                <header><div><span>CATÁLOGO DE MALTES</span><strong>Escolha a matéria-prima</strong></div><button onClick={() => setGrainPickerOpen(false)} aria-label="Fechar catálogo"><X /></button></header>
                <label className="v8-picker__search"><Search /><input autoFocus value={grainSearch} onChange={(e) => setGrainSearch(e.target.value)} placeholder="Buscar Pilsen, Munich, trigo, chocolate, Agrária..." /></label>
                <div className="v8-picker__grid">
                  {filteredGrains.map((item) => (
                    <button key={item.name} className="v8-picker__item" onClick={() => addGrainFromCatalog(item)}>
                      <strong>{item.name}</strong>
                      <span>{item.origin} · {item.type} · {item.ebc} EBC</span>
                      <small>{(item.sensoryNotes || []).slice(0, 3).join(' · ') || item.notes}</small>
                      {item.maxUsagePercent && <em>uso sugerido até {item.maxUsagePercent}%</em>}
                    </button>
                  ))}
                </div>
                {!filteredGrains.length && <p className="v8-picker__empty">Nenhum malte encontrado. Tente outro nome.</p>}
              </section>
            )}
            <div className="v6-total"><span>Total de grãos</span><strong>{calc.totalGrainKg.toFixed(2)} kg</strong></div>
          </div>
        )}

        {step === 2 && (
          <div className="v6-section">
            <p className="v6-kicker">03 · LÚPULO</p>
            <h1>Pense no tempo.</h1>
            <p className="v6-lead">A receita mostra quando cada adição entra. IBU é estimativa; aroma depende muito mais do processo real.</p>
            <div className="v6-hop-line">
              <span>60 min</span><i /><span>30</span><i /><span>15</span><i /><span>5</span><i /><span>Whirlpool</span><i /><span>Dry hop</span>
            </div>
            <div className="v6-table v6-table--hops">
              {recipe.hops.map((hop) => (
                <div className="v6-table__row" key={hop.id}>
                  <Flame />
                  <input className="v6-name-input" value={hop.name} onChange={(e) => updateHop(hop.id, { name: e.target.value })} />
                  <label><span>g</span><input type="number" value={hop.amountGrams} onChange={(e) => updateHop(hop.id, { amountGrams: num(e.target.value, 0) })} /></label>
                  <label><span>min</span><input type="number" value={hop.timeMinutes} onChange={(e) => updateHop(hop.id, { timeMinutes: num(e.target.value, 0) })} /></label>
                  <select value={hop.use} onChange={(e) => updateHop(hop.id, { use: e.target.value as HopAddition['use'] })}>
                    <option>Boil</option><option>First Wort</option><option>Whirlpool</option><option>Dry Hop</option><option>Mash</option>
                  </select>
                  <button aria-label="Remover lúpulo" onClick={() => onChange({ ...recipe, hops: recipe.hops.filter((item) => item.id !== hop.id) })}><X /></button>
                </div>
              ))}
            </div>
            <div className="v8-add-actions">
              <button className="v6-add" onClick={() => { setHopPickerOpen((value) => !value); setGrainPickerOpen(false); }}><Search /> Escolher lúpulo</button>
              <button className="v8-custom-add" onClick={() => onChange({ ...recipe, hops: [...recipe.hops, { id: uid('hop'), name: 'Lúpulo personalizado', amountGrams: 20, alphaAcids: 10, timeMinutes: 10, use: 'Boil', form: 'Pellet' }] })}><Plus /> Personalizado</button>
            </div>
            {hopPickerOpen && (
              <section className="v8-picker" aria-label="Catálogo de lúpulos">
                <header><div><span>CATÁLOGO DE LÚPULOS</span><strong>Escolha pelo perfil</strong></div><button onClick={() => setHopPickerOpen(false)} aria-label="Fechar catálogo"><X /></button></header>
                <label className="v8-picker__search"><Search /><input autoFocus value={hopSearch} onChange={(e) => setHopSearch(e.target.value)} placeholder="Buscar Citra, Mosaic, Saaz, Hallertau, Brasil..." /></label>
                <div className="v8-picker__grid">
                  {filteredHops.map((item) => (
                    <button key={item.name} className="v8-picker__item" onClick={() => addHopFromCatalog(item)}>
                      <strong>{item.name}</strong>
                      <span>{item.origin} · α {item.alphaAcids}%</span>
                      <small>{(item.sensoryNotes || []).slice(0, 3).join(' · ') || item.profile}</small>
                      <em>entra com 25 g · 10 min; ajuste depois</em>
                    </button>
                  ))}
                </div>
                {!filteredHops.length && <p className="v8-picker__empty">Nenhum lúpulo encontrado. Tente outro nome.</p>}
              </section>
            )}
            <div className="v6-total"><span>Total de lúpulo</span><strong>{calc.totalHopsGrams.toFixed(0)} g</strong></div>
          </div>
        )}

        {step === 3 && (
          <div className="v6-section">
            <p className="v6-kicker">04 · FERMENTAÇÃO</p>
            <h1>Temperatura antes de calendário.</h1>
            <p className="v6-lead">A densidade real confirma o fim da fermentação. Dias são referência, não promessa.</p>
            <div className="v6-yeast">
              <span>LEVEDURA</span><strong>{recipe.yeast.brand} · {recipe.yeast.name}</strong>
              <p>{recipe.yeast.optimalTempMin}–{recipe.yeast.optimalTempMax} °C · atenuação média {recipe.yeast.attenuationAvg}%</p>
            </div>
            <div className="v6-fermentation">
              {recipe.fermentationStages.map((stage, index) => (
                <div key={`${stage.name}-${index}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <input value={stage.name} onChange={(e) => updateStage(index, { name: e.target.value })} />
                  <label><Thermometer /><input type="number" value={stage.tempCelsius} onChange={(e) => updateStage(index, { tempCelsius: num(e.target.value, 18) })} /> °C</label>
                  <label><Clock3 /><input type="number" value={stage.durationDays} onChange={(e) => updateStage(index, { durationDays: num(e.target.value, 7) })} /> dias</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="v6-section">
            <p className="v6-kicker">05 · ÁGUA</p>
            <h1>Alvo é alvo. Medição é medição.</h1>
            <p className="v6-lead">Os valores abaixo são a água desejada para a receita. O pH calculado continua sendo uma estimativa até você medir.</p>
            <div className="v6-water-grid">
              {[
                ['calcium', 'Ca'], ['magnesium', 'Mg'], ['sodium', 'Na'], ['chloride', 'Cl'], ['sulfate', 'SO₄'], ['bicarbonate', 'HCO₃'],
              ].map(([key, label]) => (
                <label key={key}><span>{label}</span><input type="number" value={(recipe.waterTarget as unknown as Record<string, number>)[key] || 0} onChange={(e) => onChange({ ...recipe, waterTarget: { ...recipe.waterTarget, [key]: num(e.target.value, 0) } })} /><small>ppm</small></label>
              ))}
            </div>
            <div className="v6-water-result">
              <div><span>pH de mostura previsto</span><strong>{calc.estimatedMashPh?.estimatedPh?.toFixed(2) || '—'}</strong><small>estimativa</small></div>
              <div><span>SO₄ : Cl</span><strong>{calc.sulfateToChlorideRatio.toFixed(2)}</strong><small>relação prevista</small></div>
              <div><span>Água total</span><strong>{calc.totalWaterNeededLiters.toFixed(1)} L</strong><small>planejada</small></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="v6-section">
            <p className="v6-kicker">06 · REVISÃO</p>
            <h1>Está pronta para virar lote?</h1>
            <p className="v6-lead">Confira o plano. Na brassagem, o app passa a registrar o que aconteceu de verdade.</p>
            <div className="v6-review-metrics">
              <div><span>OG</span><b>{calc.og.toFixed(3)}</b></div>
              <div><span>FG</span><b>{calc.fg.toFixed(3)}</b></div>
              <div><span>ABV</span><b>{calc.abv.toFixed(1)}%</b></div>
              <div><span>IBU</span><b>{Math.round(calc.ibu)}</b></div>
              <div><span>SRM</span><b>{calc.srm.toFixed(1)}</b></div>
              <div><span>Volume</span><b>{recipe.batchSizeLiters} L</b></div>
            </div>
            <button className="v6-brew-cta" onClick={onStartBrew}><Flame /> Começar esta brassagem <ArrowRight /></button>
          </div>
        )}

        <footer className="v6-step-footer">
          <button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1) as RecipeStep)}><ArrowLeft /> Anterior</button>
          <span>{step + 1} / 6</span>
          {step < 5 && <button onClick={() => setStep(Math.min(5, step + 1) as RecipeStep)}>Próximo <ArrowRight /></button>}
        </footer>
      </section>
      <StyleRail recipe={recipe} />
    </main>
  );
}

type BrewPhase = {
  title: string;
  eyebrow: string;
  note: string;
  target?: string;
  durationMinutes?: number;
  hopAlert?: string;
};

function buildPhases(recipe: BeerRecipe): BrewPhase[] {
  const calc = calculateAllMetrics(recipe);
  const boilHops = recipe.hops.filter((hop) => hop.use === 'Boil').sort((a, b) => b.timeMinutes - a.timeMinutes);
  const whirlpool = recipe.hops.filter((hop) => hop.use === 'Whirlpool');
  return [
    { title: 'Preparar água', eyebrow: '01 · PREPARAÇÃO', note: `Separe aproximadamente ${calc.totalWaterNeededLiters.toFixed(1)} L e faça o tratamento previsto para a receita.` },
    { title: 'Aquecer água de ataque', eyebrow: '02 · AQUECIMENTO', note: 'Mexa a água antes de medir para evitar leitura enganosa.', target: `${calc.strikeWaterTempCelsius.toFixed(1)} °C` },
    ...recipe.mashSchedule.map((step, index) => ({ title: step.name, eyebrow: `${String(index + 3).padStart(2, '0')} · MOSTURA`, note: step.description || 'Mantenha a temperatura o mais estável possível.', target: `${step.tempCelsius} °C`, durationMinutes: step.durationMinutes })),
    { title: 'Lavagem e pré-fervura', eyebrow: 'LAVAGEM', note: `Alvo previsto de volume pré-fervura: ${calc.preBoilVolumeLiters.toFixed(1)} L. Registre volume e densidade reais.` },
    { title: 'Fervura', eyebrow: 'FERVURA', note: 'Ferva destampado. Use a linha do lúpulo como lembrete, não como substituto da atenção.', durationMinutes: recipe.boilTimeMinutes, hopAlert: boilHops.map((hop) => `${hop.timeMinutes} min: ${hop.amountGrams} g ${hop.name}`).join(' · ') || 'Sem adições de fervura.' },
    ...(whirlpool.length ? [{ title: 'Whirlpool', eyebrow: 'PÓS-FERVURA', note: 'Reduza para a temperatura planejada antes de iniciar a contagem.', durationMinutes: Math.max(...whirlpool.map((hop) => hop.timeMinutes || 15)), hopAlert: whirlpool.map((hop) => `${hop.amountGrams} g ${hop.name}${hop.tempCelsius ? ` a ${hop.tempCelsius} °C` : ''}`).join(' · ') }] : []),
    { title: 'Resfriar mosto', eyebrow: 'RESFRIAMENTO', note: `Leve o mosto até uma temperatura segura para a levedura ${recipe.yeast.name}.`, target: `${recipe.yeast.optimalTempMin}–${recipe.yeast.optimalTempMax} °C` },
    { title: 'Transferir e inocular', eyebrow: 'FERMENTADOR', note: 'Registre OG real e temperatura de inoculação antes de encerrar a brassagem.' },
  ];
}

function BrewMode({
  recipe,
  session,
  sessions,
  onSessions,
}: {
  recipe: BeerRecipe;
  session: BrewSession;
  sessions: BrewSession[];
  onSessions: (sessions: BrewSession[]) => void;
}) {
  const phases = useMemo(() => buildPhases(recipe), [recipe]);
  const initialIndex = Math.min(session.currentStepIndex || 0, phases.length - 1);
  const [index, setIndex] = useState(initialIndex);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState((phases[initialIndex]?.durationMinutes || 0) * 60);
  const [kind, setKind] = useState<BrewReading['kind']>('temperature');
  const [reading, setReading] = useState('');
  const phase = phases[index];

  useEffect(() => {
    setSecondsLeft((phases[index]?.durationMinutes || 0) * 60);
    setRunning(false);
  }, [index, phases]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  const updateSession = (patch: Partial<BrewSession>) => {
    const updated = { ...session, ...patch, updatedAt: new Date().toISOString() };
    onSessions(sessions.map((item) => item.id === session.id ? updated : item));
  };

  const addReading = () => {
    if (!reading.trim()) return;
    const numericKinds: BrewReading['kind'][] = ['preBoilGravity', 'preBoilVolume', 'postBoilVolume', 'originalGravity', 'finalGravity', 'pitchTemperature', 'mashPh', 'temperature'];
    const parsed = numericKinds.includes(kind) ? num(reading, Number.NaN) : reading;
    const value = typeof parsed === 'number' && Number.isNaN(parsed) ? reading : parsed;
    const nextReading: BrewReading = { id: uid('reading'), recordedAt: new Date().toISOString(), kind, label: kind, value };
    const actuals = { ...(session.actuals || {}) };
    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      if (kind === 'originalGravity') actuals.originalGravity = parsed;
      if (kind === 'finalGravity') actuals.finalGravity = parsed;
      if (kind === 'mashPh') actuals.mashPh = parsed;
      if (kind === 'pitchTemperature') actuals.pitchTempCelsius = parsed;
      if (kind === 'preBoilGravity') actuals.preBoilGravity = parsed;
      if (kind === 'preBoilVolume') actuals.preBoilVolumeLiters = parsed;
      if (kind === 'postBoilVolume') actuals.postBoilVolumeLiters = parsed;
    }
    updateSession({ readings: [...(session.readings || []), nextReading], actuals });
    setReading('');
  };

  const next = () => {
    if (index >= phases.length - 1) {
      updateSession({ status: 'fermenting', currentStepIndex: index });
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    updateSession({ currentStepIndex: nextIndex });
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <main className="v6-brewmode">
      <section className="v6-brew-stage">
        <div className="v6-brew-progress"><span>ETAPA {index + 1} DE {phases.length}</span><i style={{ width: `${((index + 1) / phases.length) * 100}%` }} /></div>
        <p className="v6-kicker">{phase.eyebrow}</p>
        <h1>{phase.title}</h1>
        {phase.target && <div className="v6-target"><Thermometer /><span>ALVO</span><strong>{phase.target}</strong></div>}
        {phase.durationMinutes ? (
          <button className="v6-timer" onClick={() => setRunning((value) => !value)}>
            <span>{mm}:{ss}</span><small>{running ? <><Pause /> Pausar</> : <><Play /> Iniciar cronômetro</>}</small>
          </button>
        ) : <div className="v6-no-timer"><Gauge /> Sem cronômetro obrigatório</div>}
        <p className="v6-brew-note">{phase.note}</p>
        {phase.hopAlert && <div className="v6-hop-alert"><Flame /><span><b>Linha do lúpulo</b>{phase.hopAlert}</span></div>}
      </section>
      <aside className="v6-brew-log">
        <p className="v6-kicker">REGISTRO REAL</p>
        <h2>O que aconteceu?</h2>
        <p>Planejado é uma coisa. Medido na panela é outra.</p>
        <label><span>Tipo de leitura</span><select value={kind} onChange={(e) => setKind(e.target.value as BrewReading['kind'])}><option value="temperature">Temperatura</option><option value="mashPh">pH da mostura</option><option value="preBoilGravity">Densidade pré-fervura</option><option value="preBoilVolume">Volume pré-fervura</option><option value="postBoilVolume">Volume pós-fervura</option><option value="originalGravity">OG real</option><option value="pitchTemperature">Temperatura de inoculação</option><option value="note">Nota</option></select></label>
        <label><span>Valor</span><input value={reading} onChange={(e) => setReading(e.target.value)} placeholder={kind === 'note' ? 'Observação do lote' : 'Digite o valor'} /></label>
        <button className="v6-log-button" onClick={addReading}><Plus /> Registrar</button>
        <div className="v6-readings">
          {(session.readings || []).slice(-5).reverse().map((item) => <div key={item.id}><span>{item.label}</span><strong>{String(item.value)}</strong></div>)}
        </div>
      </aside>
      <footer className="v6-brew-footer"><button onClick={next}>{index >= phases.length - 1 ? 'Enviar para fermentação' : 'Concluir etapa'} <ArrowRight /></button></footer>
    </main>
  );
}

function Notebook({
  sessions,
  onSessions,
  recipes,
  onRecipes,
  activeRecipeId,
  onSelectRecipe,
}: {
  sessions: BrewSession[];
  onSessions: (sessions: BrewSession[]) => void;
  recipes: BeerRecipe[];
  onRecipes: (recipes: BeerRecipe[]) => void;
  activeRecipeId: string;
  onSelectRecipe: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id || '');
  const selected = sessions.find((item) => item.id === selectedId) || sessions[0];
  const sameRecipe = selected ? sessions.filter((item) => item.recipeId === selected.recipeId).sort((a, b) => b.brewedAt.localeCompare(a.brewedAt)) : [];

  useEffect(() => {
    if (selectedId && !sessions.some((item) => item.id === selectedId)) {
      setSelectedId(sessions[0]?.id || '');
    }
  }, [selectedId, sessions]);

  const update = (patch: Partial<BrewSession>) => {
    if (!selected) return;
    onSessions(sessions.map((item) => item.id === selected.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  };

  const deleteLot = () => {
    if (!selected) return;
    const ok = window.confirm(`Apagar o lote de ${selected.recipeName} de ${selected.brewedAt}?\n\nEsta ação remove somente este lote do Caderno.`);
    if (!ok) return;
    const next = sessions.filter((item) => item.id !== selected.id);
    onSessions(next);
    setSelectedId(next[0]?.id || '');
  };

  const deleteRecipe = (recipeToDelete: BeerRecipe) => {
    if (recipes.length <= 1) {
      window.alert('Mantenha pelo menos uma receita no Brewbook. Crie outra antes de apagar esta.');
      return;
    }
    const linkedLots = sessions.filter((item) => item.recipeId === recipeToDelete.id).length;
    const lotText = linkedLots
      ? `\n\n${linkedLots} lote${linkedLots === 1 ? '' : 's'} histórico${linkedLots === 1 ? '' : 's'} desta receita continuará${linkedLots === 1 ? '' : 'ão'} no Caderno.`
      : '\n\nNenhum lote histórico será afetado.';
    const ok = window.confirm(`Apagar a receita "${recipeToDelete.name}"?${lotText}\n\nA receita não poderá ser recuperada depois.`);
    if (!ok) return;
    const next = recipes.filter((item) => item.id !== recipeToDelete.id);
    onRecipes(next);
    if (activeRecipeId === recipeToDelete.id) onSelectRecipe(next[0].id);
  };

  const actualAbv = selected?.actuals?.originalGravity && selected?.actuals?.finalGravity
    ? calculateABV(selected.actuals.originalGravity, selected.actuals.finalGravity)
    : selected?.actuals?.abv;

  return (
    <main className="v6-notebook">
      <aside className="v6-batch-list">
        <p className="v6-kicker">LOTES</p>
        <h1>Caderno</h1>
        {sessions.length ? sessions.map((item) => (
          <button key={item.id} data-active={item.id === selected?.id || undefined} onClick={() => setSelectedId(item.id)}>
            <span>{item.brewedAt}</span><strong>{item.recipeName}</strong><small>{item.status}</small><ChevronRight />
          </button>
        )) : <p className="v7-empty-lots">Ainda não há brassagens registradas.</p>}

        <section className="v7-recipe-shelf">
          <header><div><p className="v6-kicker">RECEITAS SALVAS</p><h2>Arquivo de receitas</h2></div><span>{recipes.length}</span></header>
          <div className="v7-recipe-shelf__list">
            {recipes.map((savedRecipe) => {
              const lotCount = sessions.filter((item) => item.recipeId === savedRecipe.id).length;
              const isActive = savedRecipe.id === activeRecipeId;
              return (
                <div className="v7-recipe-row" key={savedRecipe.id} data-active={isActive || undefined}>
                  <button className="v7-recipe-row__open" onClick={() => onSelectRecipe(savedRecipe.id)}>
                    <strong>{savedRecipe.name}</strong>
                    <small>{savedRecipe.style.code} · {lotCount} lote{lotCount === 1 ? '' : 's'}{isActive ? ' · aberta agora' : ''}</small>
                  </button>
                  <button
                    className="v7-recipe-row__delete"
                    onClick={() => deleteRecipe(savedRecipe)}
                    disabled={recipes.length <= 1}
                    aria-label={`Apagar receita ${savedRecipe.name}`}
                    title={recipes.length <= 1 ? 'Crie outra receita antes de apagar a última.' : 'Apagar receita'}
                  ><Trash2 /></button>
                </div>
              );
            })}
          </div>
          <p className="v7-recipe-shelf__note">Apagar uma receita não apaga os lotes antigos. O histórico continua guardado no Caderno.</p>
        </section>
      </aside>

      {selected ? (
        <article className="v6-batch-page">
          <div className="v7-batch-heading">
            <div><p className="v6-kicker">LOTE REAL · {selected.brewedAt}</p><h1>{selected.recipeName}</h1></div>
            <button className="v7-delete-lot" onClick={deleteLot}><Trash2 /> Apagar lote</button>
          </div>
          <div className="v6-planned-actual">
            <div><span>OG</span><small>prevista</small><b>{fmtGravity(selected.planned?.originalGravity)}</b><small>real</small><strong>{fmtGravity(selected.actuals?.originalGravity)}</strong></div>
            <div><span>FG</span><small>prevista</small><b>{fmtGravity(selected.planned?.finalGravity)}</b><small>real</small><strong>{fmtGravity(selected.actuals?.finalGravity)}</strong></div>
            <div><span>ABV</span><small>previsto</small><b>{selected.planned?.abv?.toFixed(1) || '—'}%</b><small>real</small><strong>{actualAbv?.toFixed(1) || '—'}%</strong></div>
          </div>
          <label className="v6-notes"><span>Notas do lote</span><textarea value={selected.notes || ''} onChange={(e) => update({ notes: e.target.value })} placeholder="O que você faria diferente na próxima?" /></label>
          <div className="v6-rating"><span>Resultado</span><div>{[1, 2, 3, 4, 5].map((score) => <button key={score} data-active={(selected.rating || 0) >= score || undefined} onClick={() => update({ rating: score as 1 | 2 | 3 | 4 | 5 })}><Star /></button>)}</div><label><input type="checkbox" checked={selected.wouldBrewAgain || false} onChange={(e) => update({ wouldBrewAgain: e.target.checked })} /> Eu faria novamente</label></div>
          {sameRecipe.length > 1 && (
            <section className="v6-compare">
              <h2>Comparar brassagens</h2>
              <p>O que mudou entre versões da mesma receita?</p>
              <div><table><thead><tr><th>Métrica</th>{sameRecipe.map((item) => <th key={item.id}>{item.brewedAt}</th>)}</tr></thead><tbody><tr><td>OG real</td>{sameRecipe.map((item) => <td key={item.id}>{fmtGravity(item.actuals?.originalGravity)}</td>)}</tr><tr><td>FG real</td>{sameRecipe.map((item) => <td key={item.id}>{fmtGravity(item.actuals?.finalGravity)}</td>)}</tr><tr><td>Eficiência</td>{sameRecipe.map((item) => <td key={item.id}>{item.actuals?.efficiencyPercent ? `${item.actuals.efficiencyPercent}%` : '—'}</td>)}</tr><tr><td>Nota</td>{sameRecipe.map((item) => <td key={item.id}>{item.rating ? `${item.rating}/5` : '—'}</td>)}</tr></tbody></table></div>
            </section>
          )}
        </article>
      ) : (
        <section className="v7-notebook-empty"><NotebookPen /><p className="v6-kicker">PRIMEIRO LOTE</p><h1>O histórico começa na panela.</h1><p>Suas receitas continuam disponíveis à esquerda. Quando iniciar uma brassagem, o lote aparece aqui.</p></section>
      )}
    </main>
  );
}

function ToolField({ label, value, onChange, unit, step = 'any' }: { label: string; value: string; onChange: (value: string) => void; unit?: string; step?: string }) {
  return <label className="v6-tool-field"><span>{label}</span><div><input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)} />{unit && <b>{unit}</b>}</div></label>;
}

function Tools() {
  const [active, setActive] = useState<ToolId>('priming');
  const [primingVolume, setPrimingVolume] = useState('20');
  const [targetCo2, setTargetCo2] = useState('2.4');
  const [beerTemp, setBeerTemp] = useState('20');
  const [originalBrix, setOriginalBrix] = useState('14.5');
  const [finalBrix, setFinalBrix] = useState('6.5');
  const [wortFactor, setWortFactor] = useState('1.04');
  const [hydroReading, setHydroReading] = useState('1.050');
  const [measureTemp, setMeasureTemp] = useState('30');
  const [calTemp, setCalTemp] = useState('20');
  const [currentVolume, setCurrentVolume] = useState('20');
  const [currentSg, setCurrentSg] = useState('1.065');
  const [targetSg, setTargetSg] = useState('1.050');
  const [pitchVolume, setPitchVolume] = useState('20');
  const [pitchOg, setPitchOg] = useState('1.050');
  const [pitchRate, setPitchRate] = useState('0.75');
  const [packetCells, setPacketCells] = useState('100');
  const [convertLiters, setConvertLiters] = useState('20');
  const [convertBrix, setConvertBrix] = useState('12');

  const priming = calculatePrimingSugar(num(primingVolume, 20), num(targetCo2, 2.4), num(beerTemp, 20), 'cane');
  const refractFg = brixToFinalGravity(num(originalBrix, 14.5), num(finalBrix, 6.5), num(wortFactor, 1.04));
  const originalSg = 1 + (num(originalBrix, 14.5) / (258.6 - ((num(originalBrix, 14.5) / 258.2) * 227.1)));
  const refractAbv = calculateABV(originalSg, refractFg);
  const tm = num(measureTemp, 20) * 1.8 + 32;
  const tc = num(calTemp, 20) * 1.8 + 32;
  const numerator = 1.00130346 - 0.000134722124 * tm + 0.00000204052596 * tm ** 2 - 0.00000000232820948 * tm ** 3;
  const denominator = 1.00130346 - 0.000134722124 * tc + 0.00000204052596 * tc ** 2 - 0.00000000232820948 * tc ** 3;
  const correctedSg = num(hydroReading, 1.05) * (numerator / denominator);
  const currentPoints = (num(currentSg, 1.065) - 1) * 1000;
  const targetPoints = (num(targetSg, 1.05) - 1) * 1000;
  const targetTotalVolume = targetPoints > 0 ? num(currentVolume, 20) * (currentPoints / targetPoints) : num(currentVolume, 20);
  const waterToAdd = Math.max(0, targetTotalVolume - num(currentVolume, 20));
  const pitch = calculateYeastPitch(num(pitchVolume, 20), num(pitchOg, 1.05), num(pitchRate, 0.75), num(packetCells, 100)) as unknown as { totalCellsBillion?: number; packetsNeeded?: number; packetEquivalent?: number };
  const liters = num(convertLiters, 20);
  const brix = num(convertBrix, 12);
  const sgFromBrix = 1 + (brix / (258.6 - ((brix / 258.2) * 227.1)));

  const items: Array<{ id: ToolId; icon: React.ComponentType; title: string; sub: string }> = [
    { id: 'priming', icon: Droplets, title: 'Priming', sub: 'Açúcar de envase' },
    { id: 'refractometer', icon: FlaskConical, title: 'Refratômetro', sub: 'Corrigir leitura com álcool' },
    { id: 'hydrometer', icon: Gauge, title: 'Densímetro', sub: 'Correção por temperatura' },
    { id: 'dilution', icon: Droplets, title: 'Diluição', sub: 'Ajustar densidade do mosto' },
    { id: 'yeast', icon: Beer, title: 'Levedura', sub: 'Pitch rate' },
    { id: 'conversions', icon: Calculator, title: 'Conversões', sub: 'Litros, galões, Brix e SG' },
  ];

  return (
    <main className="v6-tools">
      <aside className="v6-tools__index">
        <p className="v6-kicker">FERRAMENTAS DO CERVEJEIRO</p>
        <h1>Calculadoras</h1>
        <p>Sem modal, sem botão flutuante. Escolha a ferramenta e use.</p>
        <div>
          {items.map(({ id, icon: Icon, title, sub }) => <button key={id} data-active={active === id || undefined} onClick={() => setActive(id)}><Icon /><span><strong>{title}</strong><small>{sub}</small></span><ChevronRight /></button>)}
        </div>
      </aside>
      <section className="v6-tool-stage">
        {active === 'priming' && <><p className="v6-kicker">PRIMING</p><h2>Açúcar para o envase</h2><p className="v6-tool-intro">Estimativa de sacarose considerando volume de cerveja, carbonatação desejada e CO₂ residual pela temperatura.</p><div className="v6-tool-grid"><ToolField label="Volume de cerveja" value={primingVolume} onChange={setPrimingVolume} unit="L" /><ToolField label="CO₂ alvo" value={targetCo2} onChange={setTargetCo2} unit="vol" /><ToolField label="Temperatura da cerveja" value={beerTemp} onChange={setBeerTemp} unit="°C" /></div><div className="v6-tool-result"><span>Açúcar estimado</span><strong>{priming.toFixed(0)} g</strong><small>Use como referência e confira seu método de envase.</small></div></>}
        {active === 'refractometer' && <><p className="v6-kicker">REFRATÔMETRO</p><h2>Leitura depois da fermentação</h2><p className="v6-tool-intro">Depois que há álcool, Brix não converte diretamente para SG. Esta correção precisa do Brix original.</p><div className="v6-tool-grid"><ToolField label="Brix original" value={originalBrix} onChange={setOriginalBrix} unit="°Bx" /><ToolField label="Brix atual" value={finalBrix} onChange={setFinalBrix} unit="°Bx" /><ToolField label="Fator do mosto" value={wortFactor} onChange={setWortFactor} /></div><div className="v6-result-pair"><div><span>FG corrigida</span><strong>{refractFg.toFixed(3)}</strong></div><div><span>ABV estimado</span><strong>{refractAbv.toFixed(1)}%</strong></div></div></>}
        {active === 'hydrometer' && <><p className="v6-kicker">DENSÍMETRO</p><h2>Corrigir pela temperatura</h2><p className="v6-tool-intro">A leitura muda quando a amostra está acima ou abaixo da temperatura de calibração do densímetro.</p><div className="v6-tool-grid"><ToolField label="Leitura observada" value={hydroReading} onChange={setHydroReading} /><ToolField label="Temperatura da amostra" value={measureTemp} onChange={setMeasureTemp} unit="°C" /><ToolField label="Calibração do densímetro" value={calTemp} onChange={setCalTemp} unit="°C" /></div><div className="v6-tool-result"><span>SG corrigida</span><strong>{correctedSg.toFixed(3)}</strong><small>Quanto mais longe da temperatura de calibração, maior a importância da correção.</small></div></>}
        {active === 'dilution' && <><p className="v6-kicker">DILUIÇÃO</p><h2>Quanto de água adicionar?</h2><p className="v6-tool-intro">Calcula a água necessária para baixar a densidade mantendo a mesma quantidade de extrato.</p><div className="v6-tool-grid"><ToolField label="Volume atual" value={currentVolume} onChange={setCurrentVolume} unit="L" /><ToolField label="SG atual" value={currentSg} onChange={setCurrentSg} /><ToolField label="SG desejada" value={targetSg} onChange={setTargetSg} /></div><div className="v6-result-pair"><div><span>Água a adicionar</span><strong>{waterToAdd.toFixed(2)} L</strong></div><div><span>Volume final</span><strong>{targetTotalVolume.toFixed(2)} L</strong></div></div></>}
        {active === 'yeast' && <><p className="v6-kicker">LEVEDURA</p><h2>Dimensionar o inóculo</h2><p className="v6-tool-intro">Pitch rate é uma estimativa operacional. Viabilidade real depende de idade, armazenamento e preparação da levedura.</p><div className="v6-tool-grid"><ToolField label="Volume do lote" value={pitchVolume} onChange={setPitchVolume} unit="L" /><ToolField label="OG" value={pitchOg} onChange={setPitchOg} /><ToolField label="Pitch rate" value={pitchRate} onChange={setPitchRate} unit="M/mL/°P" /><ToolField label="Células por pacote" value={packetCells} onChange={setPacketCells} unit="bi" /></div><div className="v6-result-pair"><div><span>Células necessárias</span><strong>{pitch.totalCellsBillion?.toFixed(0) || '—'} bi</strong></div><div><span>Pacotes equivalentes</span><strong>{(pitch.packetsNeeded ?? pitch.packetEquivalent)?.toFixed(1) || '—'}</strong></div></div></>}
        {active === 'conversions' && <><p className="v6-kicker">CONVERSÕES</p><h2>Contas rápidas de bancada</h2><div className="v6-tool-grid"><ToolField label="Litros" value={convertLiters} onChange={setConvertLiters} unit="L" /><ToolField label="Brix" value={convertBrix} onChange={setConvertBrix} unit="°Bx" /></div><div className="v6-result-pair"><div><span>Galões US</span><strong>{(liters * 0.264172).toFixed(2)}</strong></div><div><span>SG aproximada</span><strong>{sgFromBrix.toFixed(3)}</strong></div></div><div className="v6-tool-note"><TriangleAlert /> Conversão Brix → SG é apropriada para mosto sem álcool. Durante fermentação, use a ferramenta Refratômetro.</div></>}
      </section>
    </main>
  );
}

function Atlas({ recipe, onApply }: { recipe: BeerRecipe; onApply: (style: BJCPStyle) => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BJCPStyle>(recipe.style);
  const filtered = BJCP_STYLES.filter((style) => `${style.code} ${style.name} ${style.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 80);
  return (
    <main className="v6-atlas">
      <aside className="v6-atlas__index">
        <p className="v6-kicker">BJCP 2021</p><h1>Atlas de estilos</h1><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar estilo ou código" /></label>
        <div>{filtered.map((style) => <button key={style.id} data-active={selected.id === style.id || undefined} onClick={() => setSelected(style)}><span>{style.code}</span><strong>{style.name}</strong><small>{style.category}</small></button>)}</div>
      </aside>
      <article className="v6-style-page">
        <p className="v6-kicker">{selected.code} · {selected.category}</p><h1>{selected.name}</h1><p className="v6-style-intro">{selected.flavorProfile}</p>
        <div className="v6-style-ranges"><div><span>OG</span><b>{selected.ogMin.toFixed(3)}–{selected.ogMax.toFixed(3)}</b></div><div><span>FG</span><b>{selected.fgMin.toFixed(3)}–{selected.fgMax.toFixed(3)}</b></div><div><span>ABV</span><b>{selected.abvMin.toFixed(1)}–{selected.abvMax.toFixed(1)}%</b></div><div><span>IBU</span><b>{selected.ibuMin}–{selected.ibuMax}</b></div><div><span>SRM</span><b>{selected.srmMin}–{selected.srmMax}</b></div></div>
        <h2>Aroma</h2><p>{selected.aromaProfile}</p><h2>Aparência</h2><p>{selected.appearance}</p><button className="v6-apply" onClick={() => onApply(selected)}><Check /> Usar este estilo na receita</button>
      </article>
    </main>
  );
}

function DiagnosticView() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(DIAGNOSTICS[0]);
  const filtered = DIAGNOSTICS.filter((item) => `${item.perception} ${item.likely}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <main className="v6-diagnostic">
      <aside className="v6-diagnostic__index">
        <p className="v6-kicker">DIAGNÓSTICO SENSORIAL</p><h1>O que você percebe?</h1><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: manteiga, papelão, maçã verde" /></label>
        <div>{filtered.map((item) => <button key={item.id} data-active={selected.id === item.id || undefined} onClick={() => setSelected(item)}><span>{item.perception}</span><strong>{item.likely}</strong></button>)}</div>
      </aside>
      <article className="v6-diagnostic__page">
        <p className="v6-kicker">HIPÓTESE MAIS PROVÁVEL</p><h1>{selected.likely}</h1><h2>Causas comuns</h2><ul>{selected.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul><h2>O que pode ser feito agora</h2><p>{selected.now}</p><h2>Na próxima brassagem</h2><p>{selected.next}</p><div className="v6-tool-note"><TriangleAlert /> Diagnóstico sensorial é triagem, não laudo laboratorial.</div>
      </article>
    </main>
  );
}

export function BrewbookBrutalApp() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(SESSION_UNLOCK_KEY) === 'true');
  const [view, setViewState] = useState<View>('home');
  const [recipes, setRecipes] = useState<BeerRecipe[]>(() => loadRecipes(SIGNATURE_RECIPES));
  const [sessions, setSessions] = useState<BrewSession[]>(loadBrewSessions);
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || SIGNATURE_RECIPES[0].id);
  const [sessionId, setSessionId] = useState('');
  const recipe = recipes.find((item) => item.id === recipeId) || recipes[0] || SIGNATURE_RECIPES[0];
  const calc = useMemo(() => calculateAllMetrics(recipe), [recipe]);

  useEffect(() => writeStoredArray(STORAGE_KEYS.recipes, recipes), [recipes]);
  useEffect(() => saveBrewSessions(sessions), [sessions]);

  const updateRecipe = (next: BeerRecipe) => setRecipes((previous) => previous.map((item) => item.id === next.id ? next : item));

  const createRecipe = () => {
    const source = recipe || SIGNATURE_RECIPES[0];
    const next: BeerRecipe = {
      ...source,
      id: uid('recipe'),
      name: `Nova receita ${recipes.length + 1}`,
      tagline: '',
      brewer: source.brewer || 'Cervejeiro Democrata',
      grains: source.grains.map((item) => ({ ...item, id: uid('grain') })),
      hops: source.hops.map((item) => ({ ...item, id: uid('hop') })),
      mashSchedule: source.mashSchedule.map((item) => ({ ...item, id: uid('mash') })),
      fermentationStages: source.fermentationStages.map((item) => ({ ...item })),
      waterSalts: { ...source.waterSalts },
      createdAt: today(),
    };
    setRecipes((previous) => [next, ...previous]);
    setRecipeId(next.id);
    setViewState('recipe');
  };

  const ensureSession = () => {
    const existing = sessions.find((item) => item.id === sessionId)
      || [...sessions].filter((item) => item.recipeId === recipe.id && (item.status === 'planned' || item.status === 'brewing')).sort((a, b) => (b.updatedAt || b.brewedAt).localeCompare(a.updatedAt || a.brewedAt))[0];
    if (existing) {
      setSessionId(existing.id);
      return existing;
    }
    const next: BrewSession = {
      id: uid('brew'),
      recipeId: recipe.id,
      recipeName: recipe.name,
      brewedAt: today(),
      updatedAt: new Date().toISOString(),
      status: 'brewing',
      currentStepIndex: 0,
      planned: {
        originalGravity: calc.og,
        finalGravity: calc.fg,
        abv: calc.abv,
        ibu: calc.ibu,
        srm: calc.srm,
        efficiencyPercent: recipe.efficiencyPercent,
        batchSizeLiters: recipe.batchSizeLiters,
        styleCode: recipe.style.code,
        styleName: recipe.style.name,
      },
      readings: [],
      fermentationReadings: [],
      actuals: {},
      notes: '',
    };
    setSessions((previous) => [next, ...previous]);
    setSessionId(next.id);
    return next;
  };

  const setView = (next: View) => {
    if (next === 'brew') ensureSession();
    setViewState(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;

  const activeSession = sessions.find((item) => item.id === sessionId)
    || sessions.find((item) => item.recipeId === recipe.id && (item.status === 'brewing' || item.status === 'planned'));

  return (
    <Shell view={view} setView={setView}>
      {view === 'home' && <Home recipe={recipe} recipes={recipes} onSelectRecipe={setRecipeId} onCreateRecipe={createRecipe} setView={setView} />}
      {view === 'recipe' && <RecipeEditor recipe={recipe} onChange={updateRecipe} onOpenAtlas={() => setView('atlas')} onStartBrew={() => setView('brew')} />}
      {view === 'brew' && activeSession && <BrewMode recipe={recipe} session={activeSession} sessions={sessions} onSessions={setSessions} />}
      {view === 'notebook' && <Notebook sessions={sessions} onSessions={setSessions} recipes={recipes} onRecipes={setRecipes} activeRecipeId={recipe.id} onSelectRecipe={setRecipeId} />}
      {view === 'tools' && <Tools />}
      {view === 'atlas' && <Atlas recipe={recipe} onApply={(style) => { updateRecipe({ ...recipe, style }); setView('recipe'); }} />}
      {view === 'diagnostic' && <DiagnosticView />}
    </Shell>
  );
}

export default BrewbookBrutalApp;
