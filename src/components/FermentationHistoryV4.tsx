import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, FlaskConical, History, Plus, Star, Thermometer } from 'lucide-react';
import type { BeerRecipe, BrewSession, FermentationReading } from '../types/brewing';

interface FermentationHistoryV4Props {
  sessions: BrewSession[];
  recipes: BeerRecipe[];
  activeRecipeId: string;
  onUpdateSession: (session: BrewSession) => void;
  onRepeatRecipe: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
}

const statusLabel: Record<BrewSession['status'], string> = {
  planned: 'Planejada',
  brewing: 'Em brassagem',
  fermenting: 'Fermentando',
  packaged: 'Embalada',
  completed: 'Concluída',
};

const realAbv = (og?: number, fg?: number) => og && fg && og > fg ? (og - fg) * 131.25 : undefined;

export const FermentationHistoryV4: React.FC<FermentationHistoryV4Props> = ({ sessions, recipes, activeRecipeId, onUpdateSession, onRepeatRecipe, onSelectRecipe }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => sessions.find((session) => session.recipeId === activeRecipeId)?.id || sessions[0]?.id || '');
  const [gravity, setGravity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [note, setNote] = useState('');

  const ordered = useMemo(() => [...sessions].sort((a, b) => (b.updatedAt || b.brewedAt).localeCompare(a.updatedAt || a.brewedAt)), [sessions]);
  const selected = sessions.find((session) => session.id === selectedSessionId) || ordered[0];
  const recipe = selected ? recipes.find((item) => item.id === selected.recipeId) : undefined;

  const update = (patch: Partial<BrewSession>) => {
    if (!selected) return;
    onUpdateSession({ ...selected, ...patch, updatedAt: new Date().toISOString() });
  };

  const addReading = () => {
    if (!selected || (!gravity && !temperature && !note.trim())) return;
    const reading: FermentationReading = {
      id: `ferm-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      gravity: gravity ? Number(gravity) : undefined,
      tempCelsius: temperature ? Number(temperature) : undefined,
      note: note.trim() || undefined,
    };
    const next = [...(selected.fermentationReadings || []), reading];
    const latestGravity = reading.gravity;
    const actuals = { ...(selected.actuals || {}) };
    if (latestGravity != null) actuals.finalGravity = latestGravity;
    const abv = realAbv(actuals.originalGravity, actuals.finalGravity);
    if (abv != null) actuals.abv = Number(abv.toFixed(2));
    onUpdateSession({ ...selected, fermentationReadings: next, actuals, status: selected.status === 'brewing' ? 'fermenting' : selected.status, updatedAt: new Date().toISOString() });
    setGravity('');
    setTemperature('');
    setNote('');
  };

  return (
    <div className="space-y-5">
      <section className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Lotes & fermentação</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-3xl font-black text-[#f2e7d2]">A receita é o plano. O lote é o que aconteceu.</h1><p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">Acompanhe densidade e temperatura, compare previsto x real e guarde a avaliação que vai melhorar a próxima brassagem.</p></div><span className="font-mono text-xs text-stone-600">{sessions.length} {sessions.length === 1 ? 'lote' : 'lotes'}</span></div>
      </section>

      {sessions.length === 0 ? (
        <section className="border border-dashed border-white/[0.12] bg-[#100e0b] p-10 text-center"><History className="mx-auto h-8 w-8 text-stone-700" /><h2 className="mt-4 font-serif text-2xl font-black text-[#f2e7d2]">Ainda não há lote registrado</h2><p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-stone-600">Comece uma brassagem a partir de uma receita. Quando o lote existir, suas medições e avaliações ficam aqui.</p></section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="h-fit border border-white/[0.08] bg-[#100e0b] p-2 xl:sticky xl:top-[145px]">
            {ordered.map((session) => <button key={session.id} type="button" onClick={() => setSelectedSessionId(session.id)} className={`block w-full border-t border-white/[0.05] px-3 py-3 text-left first:border-t-0 ${selected?.id === session.id ? 'bg-[#291a11]' : 'hover:bg-white/[0.025]'}`}><span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#bd6c32]">{statusLabel[session.status]}</span><strong className="mt-1 block text-xs text-stone-300">{session.recipeName}</strong><small className="mt-1 block font-mono text-[9px] text-stone-700">{session.brewedAt}</small></button>)}
          </aside>

          {selected && <section className="space-y-5">
            <div className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#bd6c32]">{statusLabel[selected.status]} · {selected.brewedAt}</p><h2 className="mt-2 font-serif text-2xl font-black text-[#f2e7d2]">{selected.recipeName}</h2>{selected.planned?.styleName && <p className="mt-1 text-[10px] text-stone-600">{selected.planned.styleCode} · {selected.planned.styleName}</p>}</div><select value={selected.status} onChange={(e) => update({ status: e.target.value as BrewSession['status'], packagedAt: e.target.value === 'packaged' && !selected.packagedAt ? new Date().toISOString() : selected.packagedAt })} className="v4-input w-full sm:w-48"><option value="planned">Planejada</option><option value="brewing">Em brassagem</option><option value="fermenting">Fermentando</option><option value="packaged">Embalada</option><option value="completed">Concluída</option></select></div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <CompareFact label="OG" planned={selected.planned?.originalGravity?.toFixed(3)} actual={selected.actuals?.originalGravity?.toFixed(3)} />
                <CompareFact label="FG" planned={selected.planned?.finalGravity?.toFixed(3)} actual={selected.actuals?.finalGravity?.toFixed(3)} />
                <CompareFact label="ABV" planned={selected.planned?.abv != null ? `${selected.planned.abv.toFixed(1)}%` : undefined} actual={selected.actuals?.abv != null ? `${selected.actuals.abv.toFixed(1)}%` : undefined} />
                <CompareFact label="Eficiência" planned={selected.planned?.efficiencyPercent != null ? `${selected.planned.efficiencyPercent}%` : undefined} actual={selected.actuals?.efficiencyPercent != null ? `${selected.actuals.efficiencyPercent}%` : undefined} />
              </div>
            </div>

            {recipe && <div className="border border-white/[0.08] bg-[#100e0b] p-5 sm:p-7"><div className="flex items-start gap-3"><FlaskConical className="mt-0.5 h-5 w-5 text-[#bd6c32]" /><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Roteiro da receita</p><div className="mt-4 space-y-3">{recipe.fermentationStages.map((stage, index) => <div key={`${stage.name}-${index}`} className="grid gap-1 border-l-2 border-white/[0.1] pl-3 sm:grid-cols-[1fr_auto]"><div><strong className="text-xs text-stone-300">{stage.name}</strong><p className="mt-1 text-[10px] leading-5 text-stone-600">{stage.description}</p></div><span className="font-mono text-[10px] text-[#e0aa54]">{stage.tempCelsius}°C · {stage.durationDays} d</span></div>)}</div></div></div></div>}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section className="border border-white/[0.08] bg-[#14110d] p-5 sm:p-7">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#bd6c32]">Nova leitura</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2"><label><span className="v4-field-label">Densidade</span><input value={gravity} onChange={(e) => setGravity(e.target.value)} type="number" step="0.001" className="v4-input" placeholder="ex.: 1.018" /></label><label><span className="v4-field-label">Temperatura</span><div className="relative"><Thermometer className="absolute left-3 top-3.5 h-4 w-4 text-stone-600" /><input value={temperature} onChange={(e) => setTemperature(e.target.value)} type="number" step="0.1" className="v4-input pl-10" placeholder="°C" /></div></label><label className="sm:col-span-2"><span className="v4-field-label">Observação</span><textarea value={note} onChange={(e) => setNote(e.target.value)} className="v4-input resize-none" rows={2} placeholder="Aroma, atividade, dry hop, mudança de temperatura…" /></label></div>
                <button type="button" onClick={addReading} className="v4-primary-action mt-3"><Plus className="h-4 w-4" /> Registrar leitura</button>

                <div className="mt-6 space-y-2">{[...(selected.fermentationReadings || [])].reverse().map((reading) => <article key={reading.id} className="border-t border-white/[0.06] py-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[9px] text-stone-700">{new Date(reading.recordedAt).toLocaleString('pt-BR')}</span><div className="flex gap-3 font-mono text-xs text-stone-300">{reading.gravity != null && <strong>{reading.gravity.toFixed(3)}</strong>}{reading.tempCelsius != null && <strong>{reading.tempCelsius.toFixed(1)}°C</strong>}</div></div>{reading.note && <p className="mt-1 text-[10px] leading-5 text-stone-500">{reading.note}</p>}</article>)}</div>
              </section>

              <aside className="border border-white/[0.08] bg-[#100e0b] p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Avaliação do lote</p>
                <div className="mt-4 flex gap-1">{([1,2,3,4,5] as const).map((rating) => <button key={rating} type="button" onClick={() => update({ rating })} aria-label={`${rating} estrelas`}><Star className={`h-6 w-6 ${rating <= (selected.rating || 0) ? 'fill-[#e0aa54] text-[#e0aa54]' : 'text-stone-700'}`} /></button>)}</div>
                <button type="button" onClick={() => update({ wouldBrewAgain: !selected.wouldBrewAgain })} className={`mt-4 flex w-full items-center justify-between border p-3 text-left text-xs font-bold ${selected.wouldBrewAgain ? 'border-[#7f8b58]/50 bg-lime-950/10 text-lime-200' : 'border-white/[0.08] text-stone-500'}`}><span>Faria novamente?</span>{selected.wouldBrewAgain && <Check className="h-4 w-4" />}</button>
                <label className="mt-4 block"><span className="v4-field-label">Notas finais</span><textarea value={selected.notes || ''} onChange={(e) => update({ notes: e.target.value })} rows={5} className="v4-input resize-none" placeholder="O que manter e o que mudar na próxima vez?" /></label>
                <div className="mt-4 space-y-2"><button type="button" onClick={() => { onSelectRecipe(selected.recipeId); }} className="v4-secondary-button w-full justify-center">Abrir receita <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => onRepeatRecipe(selected.recipeId)} className="v4-primary-action w-full justify-center"><Copy className="h-4 w-4" /> Fazer novamente</button></div>
              </aside>
            </div>
          </section>}
        </div>
      )}
    </div>
  );
};

const CompareFact: React.FC<{ label: string; planned?: string; actual?: string }> = ({ label, planned, actual }) => <div className="border border-white/[0.07] bg-black/15 p-3"><span className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-600">{label}</span><strong className="mt-1 block font-mono text-lg text-[#f2e7d2]">{actual || '—'}</strong><small className="text-[9px] text-stone-700">prev. {planned || '—'}</small></div>;
