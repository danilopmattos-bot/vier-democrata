import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Flame,
  History,
  Plus,
  TriangleAlert,
} from 'lucide-react';
import { BeerRecipe, BrewSession, RecipeCalculations } from '../types/brewing';
import { HeroBeerStage } from './HeroBeerStage';

interface BrewDeskHomeProps {
  currentRecipe: BeerRecipe;
  recipes: BeerRecipe[];
  brewSessions: BrewSession[];
  calculations: RecipeCalculations;
  onSelectRecipe: (id: string) => void;
  onOpenRecipe: () => void;
  onStartBrewday: () => void;
  onNewRecipe: () => void;
  onRepeatRecipe: (id: string) => void;
}

type ComplianceStatus = 'low' | 'ok' | 'high';

interface StyleMeasure {
  key: 'og' | 'fg' | 'abv' | 'ibu' | 'srm';
  label: string;
  value: number;
  min: number;
  max: number;
  status: ComplianceStatus;
  decimals: number;
  unit?: string;
}

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  low: 'abaixo',
  ok: 'na faixa',
  high: 'acima',
};

const SESSION_STATUS: Record<BrewSession['status'], string> = {
  planned: 'planejada',
  brewing: 'em brassagem',
  fermenting: 'fermentando',
  packaged: 'embalada',
  completed: 'concluída',
};

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const markerPosition = (measure: StyleMeasure) => {
  const span = measure.max - measure.min;
  if (span <= 0) return 50;
  const paddedMin = measure.min - span * 0.25;
  const paddedMax = measure.max + span * 0.25;
  return Math.min(96, Math.max(4, ((measure.value - paddedMin) / (paddedMax - paddedMin)) * 100));
};

const formatMeasure = (value: number, decimals: number, unit?: string) =>
  `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`;

export const BrewDeskHome: React.FC<BrewDeskHomeProps> = ({
  currentRecipe,
  recipes,
  brewSessions,
  calculations,
  onSelectRecipe,
  onOpenRecipe,
  onStartBrewday,
  onNewRecipe,
  onRepeatRecipe,
}) => {
  const measures: StyleMeasure[] = [
    { key: 'og', label: 'OG', value: calculations.og, min: currentRecipe.style.ogMin, max: currentRecipe.style.ogMax, status: calculations.bjcpCompliance.ogStatus, decimals: 3 },
    { key: 'fg', label: 'FG', value: calculations.fg, min: currentRecipe.style.fgMin, max: currentRecipe.style.fgMax, status: calculations.bjcpCompliance.fgStatus, decimals: 3 },
    { key: 'abv', label: 'ABV', value: calculations.abv, min: currentRecipe.style.abvMin, max: currentRecipe.style.abvMax, status: calculations.bjcpCompliance.abvStatus, decimals: 1, unit: '%' },
    { key: 'ibu', label: 'IBU', value: calculations.ibu, min: currentRecipe.style.ibuMin, max: currentRecipe.style.ibuMax, status: calculations.bjcpCompliance.ibuStatus, decimals: 0 },
    { key: 'srm', label: 'SRM', value: calculations.srm, min: currentRecipe.style.srmMin, max: currentRecipe.style.srmMax, status: calculations.bjcpCompliance.srmStatus, decimals: 1 },
  ];
  const outsideStyle = measures.filter((measure) => measure.status !== 'ok');
  const firstOutside = outsideStyle[0];
  const styleSummary = outsideStyle.length === 0
    ? 'Todas as medidas previstas estão nas faixas do estilo.'
    : outsideStyle.map((measure) => `${measure.label} ${STATUS_LABEL[measure.status]}`).join(' · ');
  const heroSummary = outsideStyle.length === 0
    ? `Receita de ${currentRecipe.batchSizeLiters} L com os parâmetros previstos dentro das faixas BJCP do estilo.`
    : `Receita de ${currentRecipe.batchSizeLiters} L com ${outsideStyle.length} ${outsideStyle.length === 1 ? 'parâmetro que pede' : 'parâmetros que pedem'} revisão antes da brassagem.`;
  const nextAction = firstOutside
    ? {
        title: `Revise ${firstOutside.label} antes da brassagem`,
        detail: `${formatMeasure(firstOutside.value, firstOutside.decimals, firstOutside.unit)} previsto; a faixa de ${currentRecipe.style.name} é ${formatMeasure(firstOutside.min, firstOutside.decimals, firstOutside.unit)}–${formatMeasure(firstOutside.max, firstOutside.decimals, firstOutside.unit)}.`,
        label: 'Continuar receita',
        action: onOpenRecipe,
      }
    : {
        title: 'Faça a revisão final do lote',
        detail: `Confira ingredientes e volumes da receita de ${currentRecipe.batchSizeLiters} L antes de aquecer a água.`,
        label: 'Revisar receita',
        action: onOpenRecipe,
      };
  const lastSession = [...brewSessions].sort((a, b) => b.brewedAt.localeCompare(a.brewedAt))[0];
  const preferredRecipeIds = [...brewSessions]
    .filter((session) => session.wouldBrewAgain || (session.rating ?? 0) >= 4)
    .sort((a, b) => b.brewedAt.localeCompare(a.brewedAt))
    .map((session) => session.recipeId);
  const repeatRecipes = [...preferredRecipeIds.map((id) => recipes.find((recipe) => recipe.id === id)), ...recipes]
    .filter((recipe): recipe is BeerRecipe => Boolean(recipe))
    .filter((recipe, index, all) => all.findIndex((item) => item.id === recipe.id) === index)
    .slice(0, 3);

  return (
    <div className="brew-desk">
      <section className="brew-desk-hero" aria-labelledby="current-recipe-title">
        <img
          src="/brewmaster.jpg"
          alt=""
          className="brew-desk-hero__scene"
          style={{ objectPosition: '58% 32%' }}
        />
        <div className="brew-desk-hero__shade" />
        <div className="brew-desk-hero__content">
          <div className="brew-desk-hero__copy">
            <p className="brew-kicker"><span>01</span> Receita atual</p>
            <p className="brew-desk-hero__style">{currentRecipe.style.code} · {currentRecipe.style.name}</p>
            <h1 id="current-recipe-title">{currentRecipe.name}</h1>
            <p className="brew-desk-hero__tagline">{heroSummary}</p>

            <div className="brew-desk-hero__actions">
              <button type="button" className="brew-button brew-button--copper" onClick={onStartBrewday}>
                <Flame /> Começar brassagem
              </button>
              <button type="button" className="brew-button brew-button--cream" onClick={onOpenRecipe}>
                <BookOpen /> Continuar receita
              </button>
              <button type="button" className="brew-button brew-button--quiet" onClick={() => onRepeatRecipe(currentRecipe.id)}>
                <Copy /> Fazer novamente
              </button>
              <button type="button" className="brew-button brew-button--quiet" onClick={onNewRecipe}>
                <Plus /> Criar receita
              </button>
            </div>
          </div>

          <div className="brew-desk-hero__glass" aria-hidden="true">
            <HeroBeerStage
              srm={calculations.srm}
              abv={calculations.abv}
              ibu={calculations.ibu}
              name={currentRecipe.name}
              styleName={currentRecipe.style.name}
            />
          </div>
        </div>

        <dl className="brew-measure-rail" aria-label="Números principais da receita">
          <div><dt>OG prevista</dt><dd>{calculations.og.toFixed(3)}</dd></div>
          <div><dt>FG prevista</dt><dd>{calculations.fg.toFixed(3)}</dd></div>
          <div><dt>ABV estimado</dt><dd>{calculations.abv.toFixed(1)}%</dd></div>
          <div><dt>Amargor</dt><dd>{Math.round(calculations.ibu)} <small>IBU</small></dd></div>
          <div><dt>Cor estimada</dt><dd>{calculations.srm.toFixed(1)} <small>SRM</small></dd></div>
          <div><dt>Volume</dt><dd>{currentRecipe.batchSizeLiters} <small>L</small></dd></div>
        </dl>
      </section>

      <section className="bjcp-ledger" aria-labelledby="bjcp-title">
        <header className="bjcp-ledger__header">
          <div>
            <p className="brew-kicker brew-kicker--dark"><span>02</span> Estado BJCP</p>
            <h2 id="bjcp-title">{currentRecipe.style.code} · {currentRecipe.style.name}</h2>
          </div>
          <div className="bjcp-ledger__summary" data-state={outsideStyle.length === 0 ? 'ok' : 'attention'}>
            {outsideStyle.length === 0 ? <Check /> : <TriangleAlert />}
            <span><strong>{outsideStyle.length === 0 ? 'Dentro das faixas' : `${outsideStyle.length} ${outsideStyle.length === 1 ? 'medida fora' : 'medidas fora'}`}</strong><small>{styleSummary}</small></span>
          </div>
        </header>

        <div className="bjcp-measures">
          {measures.map((measure) => (
            <div className="bjcp-measure" key={measure.key} data-state={measure.status}>
              <div className="bjcp-measure__name">
                <strong>{measure.label}</strong>
                <span>{STATUS_LABEL[measure.status]}</span>
              </div>
              <div className="bjcp-measure__range">
                <div className="bjcp-measure__track"><span style={{ left: `${markerPosition(measure)}%` }} /></div>
                <small>{formatMeasure(measure.min, measure.decimals, measure.unit)} — {formatMeasure(measure.max, measure.decimals, measure.unit)}</small>
              </div>
              <div className="bjcp-measure__value">{formatMeasure(measure.value, measure.decimals, measure.unit)}</div>
            </div>
          ))}
        </div>
        <p className="bjcp-ledger__note">Valores previstos pela receita. As faixas vêm do estilo selecionado; não há nota única de conformidade.</p>
      </section>

      <section className="brew-desk-decisions" aria-label="Próxima ação e última brassagem">
        <article className="next-action">
          <p className="brew-kicker"><span>03</span> Próxima ação</p>
          <div className="next-action__body">
            <div>
              <h2>{nextAction.title}</h2>
              <p>{nextAction.detail}</p>
            </div>
            <button type="button" onClick={nextAction.action}>{nextAction.label} <ArrowRight /></button>
          </div>
          <dl className="next-action__facts">
            <div><dt>Maltes</dt><dd>{calculations.totalGrainKg.toFixed(2)} kg</dd></div>
            <div><dt>Lúpulos</dt><dd>{Math.round(calculations.totalHopsGrams)} g</dd></div>
            <div><dt>Fervura</dt><dd>{currentRecipe.boilTimeMinutes || 60} min</dd></div>
            <div><dt>Eficiência</dt><dd>{currentRecipe.efficiencyPercent}%</dd></div>
          </dl>
        </article>

        <article className="last-brew">
          <p className="brew-kicker brew-kicker--paper"><span>04</span> Última brassagem</p>
          {lastSession ? (
            <>
              <div className="last-brew__mark"><History /></div>
              <h2>{lastSession.recipeName}</h2>
              <p>{formatDate(lastSession.brewedAt)} · {SESSION_STATUS[lastSession.status]}</p>
              <dl>
                {lastSession.actuals?.originalGravity != null && <div><dt>OG real</dt><dd>{lastSession.actuals.originalGravity.toFixed(3)}</dd></div>}
                {lastSession.actuals?.finalGravity != null && <div><dt>FG real</dt><dd>{lastSession.actuals.finalGravity.toFixed(3)}</dd></div>}
                {lastSession.actuals?.efficiencyPercent != null && <div><dt>Eficiência</dt><dd>{lastSession.actuals.efficiencyPercent}%</dd></div>}
              </dl>
            </>
          ) : (
            <>
              <div className="last-brew__mark"><History /></div>
              <h2>Nenhum lote registrado</h2>
              <p>As receitas continuam salvas. O histórico será preenchido quando o acompanhamento de lotes estiver disponível.</p>
              <span className="last-brew__empty">Histórico vazio</span>
            </>
          )}
        </article>
      </section>

      <section className="repeat-shelf" aria-labelledby="repeat-title">
        <header>
          <div>
            <p className="brew-kicker"><span>05</span> Caderno da casa</p>
            <h2 id="repeat-title">Receitas para repetir</h2>
            <p>Abra uma receita salva ou crie uma nova cópia sem alterar a original.</p>
          </div>
          <button type="button" onClick={onNewRecipe}><Plus /> Criar receita</button>
        </header>

        <div className="repeat-shelf__list">
          {repeatRecipes.map((recipe, index) => {
            const markedToRepeat = preferredRecipeIds.includes(recipe.id);
            return (
              <article className="repeat-ticket" key={recipe.id}>
                <span className="repeat-ticket__number">{String(index + 1).padStart(2, '0')}</span>
                <div className="repeat-ticket__copy">
                  <small>{markedToRepeat ? 'Marcada para repetir' : `${recipe.style.code} · ${recipe.batchSizeLiters} L`}</small>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.style.name}</p>
                </div>
                <div className="repeat-ticket__actions">
                  <button type="button" onClick={() => { onSelectRecipe(recipe.id); onOpenRecipe(); }}>Abrir <ArrowRight /></button>
                  <button type="button" onClick={() => onRepeatRecipe(recipe.id)} aria-label={`Fazer ${recipe.name} novamente`}><Copy /></button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
