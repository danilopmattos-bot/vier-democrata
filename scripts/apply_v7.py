from pathlib import Path

app_path = Path('src/brutal/BrewbookBrutalApp.tsx')
text = app_path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global text
    if old not in text:
        raise SystemExit(f'Patch point not found: {label}')
    text = text.replace(old, new, 1)


replace_once(
    "import React, { useEffect, useMemo, useState } from 'react';",
    "import React, { useEffect, useId, useMemo, useState } from 'react';\nimport './v7-portrait-delete.css';",
    'react import',
)

replace_once(
    "  Thermometer,\n  TriangleAlert,",
    "  Thermometer,\n  Trash2,\n  TriangleAlert,",
    'trash icon import',
)

replace_once(
    "  calculatePrimingSugar,\n  calculateYeastPitch,",
    "  calculatePrimingSugar,\n  calculateYeastPitch,\n  srmToHex,",
    'srm color import',
)

brand_marker = "function AccessGate({ onUnlock }: { onUnlock: () => void }) {"
if brand_marker not in text:
    raise SystemExit('Patch point not found: AccessGate')

portrait_component = r'''function BeerPortrait({ recipe, compact = false }: { recipe: BeerRecipe; compact?: boolean }) {
  const calc = useMemo(() => calculateAllMetrics(recipe), [recipe]);
  const rawId = useId().replace(/:/g, '');
  const clipId = `v7-bowl-${rawId}`;
  const shineId = `v7-shine-${rawId}`;
  const color = srmToHex(calc.srm);
  const appearanceSource = `${recipe.style.name} ${recipe.style.category} ${recipe.style.appearance || ''} ${recipe.style.flavorProfile || ''}`.toLowerCase();
  const hazy = /hazy|new england|juicy|wit|weizen|wheat|hefe|keller|turv/.test(appearanceSource);
  const veryDark = calc.srm >= 24;
  const appearance = hazy ? 'tendência turva' : veryDark ? 'escura e pouco translúcida' : 'tendência límpida';
  const hazeOpacity = hazy ? 0.25 : veryDark ? 0.08 : 0.035;

  return (
    <section className={`v7-beer-portrait ${compact ? 'v7-beer-portrait--compact' : ''}`} aria-label={`Retrato visual da receita ${recipe.name}`}>
      <div className="v7-beer-portrait__visual">
        <svg viewBox="0 0 240 320" role="img" aria-label={`Taça com cor estimada em ${calc.srm.toFixed(1)} SRM`}>
          <defs>
            <clipPath id={clipId}>
              <path d="M49 35 Q55 139 77 202 Q85 225 120 231 Q155 225 163 202 Q185 139 191 35 Z" />
            </clipPath>
            <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".04" />
              <stop offset=".24" stopColor="#ffffff" stopOpacity=".32" />
              <stop offset=".42" stopColor="#ffffff" stopOpacity=".06" />
              <stop offset="1" stopColor="#ffffff" stopOpacity=".02" />
            </linearGradient>
          </defs>

          <g clipPath={`url(#${clipId})`}>
            <rect x="42" y="66" width="156" height="170" fill={color} />
            <rect x="42" y="66" width="156" height="170" fill="#f4dfaf" opacity={hazeOpacity} />
            <rect x="42" y="66" width="156" height="170" fill={`url(#${shineId})`} />
            <ellipse cx="120" cy="68" rx="69" ry="13" fill="#f8efd8" opacity=".96" />
            <ellipse cx="92" cy="65" rx="26" ry="13" fill="#fff8e9" />
            <ellipse cx="132" cy="61" rx="31" ry="15" fill="#fff7e4" />
            <ellipse cx="164" cy="67" rx="22" ry="11" fill="#f5ead0" />
            <g fill="#fff7df" opacity=".72">
              <circle cx="83" cy="174" r="2.2" /><circle cx="107" cy="151" r="1.7" /><circle cx="142" cy="187" r="2" />
              <circle cx="157" cy="131" r="1.5" /><circle cx="124" cy="112" r="1.3" /><circle cx="94" cy="202" r="1.4" />
            </g>
          </g>

          <path d="M49 35 Q55 139 77 202 Q85 225 120 231 Q155 225 163 202 Q185 139 191 35" fill="none" stroke="#f8edd7" strokeWidth="4" opacity=".8" />
          <path d="M49 35 Q120 49 191 35" fill="none" stroke="#fff7e5" strokeWidth="5" opacity=".72" />
          <path d="M120 231 L120 271" stroke="#f7ead1" strokeWidth="6" opacity=".74" />
          <ellipse cx="120" cy="281" rx="50" ry="9" fill="none" stroke="#f7ead1" strokeWidth="5" opacity=".65" />
          <path d="M73 54 Q67 130 84 188" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".18" />
        </svg>
      </div>
      <div className="v7-beer-portrait__copy">
        <span>RETRATO DA CERVEJA</span>
        <h3>{calc.srm.toFixed(1)} <small>SRM</small></h3>
        <p><b>{appearance}</b> · faixa do estilo {recipe.style.srmMin}–{recipe.style.srmMax} SRM.</p>
        <small>Cor calculada pela receita. Turbidez, espuma e transparência reais dependem do processo e do copo.</small>
      </div>
    </section>
  );
}

'''
text = text.replace(brand_marker, portrait_component + brand_marker, 1)

old_home_hero = '''      <section className="v6-home__hero">
        <p className="v6-kicker">DEMOCRATA BIER · CADERNO DA CASA</p>
        <h1>O próximo lote<br />não começa no software.<br /><em>Começa numa decisão.</em></h1>
        <p>Planeje com referência. Brasse com atenção. Registre o que aconteceu. Faça a próxima melhor.</p>
      </section>

      <section className="v6-paths" aria-label="Ações principais">'''

new_home_hero = '''      <section className="v7-home-stage">
        <div className="v6-home__hero">
          <p className="v6-kicker">DEMOCRATA BIER · CADERNO DA CASA</p>
          <h1>O próximo lote<br />não começa no software.<br /><em>Começa numa decisão.</em></h1>
          <p>Planeje com referência. Brasse com atenção. Registre o que aconteceu. Faça a próxima melhor.</p>
        </div>
        <BeerPortrait recipe={recipe} />
      </section>

      <section className="v6-paths" aria-label="Ações principais">'''
replace_once(old_home_hero, new_home_hero, 'home portrait stage')

replace_once(
    '''    <aside className="v6-style-rail">\n      <p className="v6-kicker">REFERÊNCIA BJCP</p>''',
    '''    <aside className="v6-style-rail">\n      <BeerPortrait recipe={recipe} compact />\n      <p className="v6-kicker">REFERÊNCIA BJCP</p>''',
    'style rail portrait',
)

notebook_start = text.find('function Notebook({')
notebook_end = text.find('\nfunction ToolField', notebook_start)
if notebook_start == -1 or notebook_end == -1:
    raise SystemExit('Patch point not found: Notebook block')

new_notebook = r'''function Notebook({
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
'''
text = text[:notebook_start] + new_notebook + text[notebook_end:]

replace_once(
    "      {view === 'notebook' && <Notebook sessions={sessions} onSessions={setSessions} />}",
    "      {view === 'notebook' && <Notebook sessions={sessions} onSessions={setSessions} recipes={recipes} onRecipes={setRecipes} activeRecipeId={recipe.id} onSelectRecipe={setRecipeId} />}",
    'Notebook props',
)

app_path.write_text(text, encoding='utf-8')

css = r'''/* V7 — Beer portrait + safe notebook management */

.v7-home-stage {
  align-self: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(290px, 360px);
  gap: clamp(28px, 4vw, 72px);
  align-items: center;
}

.v7-beer-portrait {
  --v7-panel: rgba(12, 9, 6, .82);
  position: relative;
  display: grid;
  grid-template-columns: minmax(135px, .9fr) minmax(150px, 1.1fr);
  align-items: center;
  gap: 14px;
  min-height: 360px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 246, 223, .22);
  background:
    linear-gradient(145deg, rgba(230, 173, 77, .08), transparent 38%),
    var(--v7-panel);
  box-shadow: 0 30px 90px rgba(0,0,0,.38);
  overflow: hidden;
}
.v7-beer-portrait::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 72px;
  height: 4px;
  background: var(--v6-copper-hot);
}
.v7-beer-portrait__visual { min-width: 0; align-self: stretch; display: grid; place-items: center; }
.v7-beer-portrait__visual svg { width: 100%; max-width: 190px; height: 100%; max-height: 310px; filter: drop-shadow(0 22px 20px rgba(0,0,0,.36)); }
.v7-beer-portrait__copy { display: grid; gap: 9px; align-content: center; }
.v7-beer-portrait__copy > span { color: var(--v6-copper-hot); font: 800 .72rem/1.2 var(--v6-mono); letter-spacing: .14em; }
.v7-beer-portrait__copy h3 { margin: 0; font: 400 2.7rem/.95 var(--v6-serif); color: var(--v6-cream); }
.v7-beer-portrait__copy h3 small { font: 800 .8rem var(--v6-mono); color: var(--v6-amber); }
.v7-beer-portrait__copy p { margin: 0; color: #eee1ce; font-size: .98rem; line-height: 1.5; }
.v7-beer-portrait__copy > small { color: #b9ad98; font-size: .78rem; line-height: 1.48; }

.v7-beer-portrait--compact {
  min-height: 0;
  grid-template-columns: 105px 1fr;
  padding: 14px;
  margin-bottom: 24px;
  background: rgba(239, 225, 193, .055);
}
.v7-beer-portrait--compact .v7-beer-portrait__visual svg { max-height: 170px; }
.v7-beer-portrait--compact .v7-beer-portrait__copy h3 { font-size: 2rem; }
.v7-beer-portrait--compact .v7-beer-portrait__copy p { font-size: .82rem; }
.v7-beer-portrait--compact .v7-beer-portrait__copy > small { font-size: .7rem; }

.v7-recipe-shelf {
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid rgba(255,246,223,.18);
}
.v7-recipe-shelf > header { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-bottom:14px; }
.v7-recipe-shelf > header h2 { margin:4px 0 0; font:400 1.35rem var(--v6-serif); }
.v7-recipe-shelf > header > span { min-width:36px; height:36px; border-radius:50%; display:grid; place-items:center; background:var(--v6-paper); color:var(--v6-ink); font:900 .82rem var(--v6-mono); }
.v7-recipe-shelf__list { display:grid; border-top:1px solid rgba(255,246,223,.12); }
.v7-recipe-row { display:grid; grid-template-columns:1fr 52px; align-items:stretch; border-bottom:1px solid rgba(255,246,223,.11); }
.v7-recipe-row[data-active] { box-shadow: inset 4px 0 0 var(--v6-copper-hot); background:rgba(200,101,47,.08); }
.v7-recipe-row__open { min-width:0; border:0!important; background:transparent!important; padding:14px 12px!important; display:grid!important; grid-template-columns:1fr!important; gap:4px!important; text-align:left!important; }
.v7-recipe-row__open strong { font:400 1rem var(--v6-serif)!important; color:var(--v6-cream); white-space:normal; }
.v7-recipe-row__open small { font-size:.75rem!important; color:#b9ad98!important; }
.v7-recipe-row__delete { width:52px; min-height:52px; border:0; background:transparent; color:#d78c72; display:grid; place-items:center; }
.v7-recipe-row__delete:hover:not(:disabled), .v7-delete-lot:hover { background:rgba(160,48,28,.18); color:#ffb09a; }
.v7-recipe-row__delete:disabled { opacity:.28; cursor:not-allowed; }
.v7-recipe-row__delete svg { width:20px; }
.v7-recipe-shelf__note, .v7-empty-lots { color:#a99d8c; font-size:.78rem; line-height:1.5; }
.v7-recipe-shelf__note { margin:14px 0 0; }
.v7-empty-lots { padding:16px 0 2px; }

.v7-batch-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom:26px; }
.v7-batch-heading h1 { margin-bottom:0!important; }
.v7-delete-lot { min-height:52px; border:1px solid rgba(215,140,114,.45); background:transparent; color:#e7a38d; padding:0 16px; display:flex; align-items:center; gap:9px; font-weight:800; white-space:nowrap; }
.v7-delete-lot svg { width:19px; }
.v7-notebook-empty { min-height:calc(100svh - 82px); display:grid; place-content:center; justify-items:start; padding:52px; background:var(--v6-paper); color:var(--v6-ink); }
.v7-notebook-empty>svg { width:54px; height:54px; color:var(--v6-copper); margin-bottom:18px; }
.v7-notebook-empty h1 { margin:10px 0 14px; font:400 clamp(2.7rem,5vw,5rem)/.95 var(--v6-serif); max-width:720px; }
.v7-notebook-empty>p:last-child { max-width:650px; font-size:1.05rem; line-height:1.65; color:#665746; }

@media (max-width: 1180px) {
  .v7-home-stage { grid-template-columns: minmax(0,1fr) 280px; gap:24px; }
  .v7-beer-portrait { grid-template-columns: 110px 1fr; min-height:300px; padding:14px; }
  .v7-beer-portrait__copy h3 { font-size:2.1rem; }
}

@media (max-width: 900px) {
  .v7-home-stage { grid-template-columns: 1fr; align-items:start; }
  .v7-home-stage .v7-beer-portrait { max-width:620px; min-height:260px; grid-template-columns:140px 1fr; }
  .v7-home-stage .v7-beer-portrait__visual svg { max-height:230px; }
  .v7-beer-portrait--compact { grid-template-columns:90px 1fr; }
  .v7-batch-heading { align-items:stretch; flex-direction:column; }
  .v7-delete-lot { align-self:flex-start; }
}

@media (max-width: 620px) {
  .v7-home-stage .v7-beer-portrait { grid-template-columns:112px 1fr; min-height:230px; }
  .v7-home-stage .v7-beer-portrait__copy h3 { font-size:1.85rem; }
  .v7-beer-portrait__copy p { font-size:.9rem; }
  .v7-beer-portrait__copy > small { font-size:.72rem; }
  .v7-recipe-row { grid-template-columns:1fr 58px; }
}
'''
Path('src/brutal/v7-portrait-delete.css').write_text(css, encoding='utf-8')
