import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  Gauge,
  Pause,
  Play,
  Plus,
  Thermometer,
} from 'lucide-react';
import type { BeerRecipe, BrewReading, BrewSession, BrewStepRecord, RecipeCalculations } from '../types/brewing';

interface BrewdayV4Props {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
  session?: BrewSession;
  onStartSession: () => void;
  onUpdateSession: (session: BrewSession) => void;
  onExit: () => void;
  onOpenFermentation: () => void;
}

interface StepBlueprint {
  id: string;
  name: string;
  eyebrow: string;
  instruction: string;
  next: string;
  durationMinutes?: number;
  targetTempCelsius?: number;
}

const buildSteps = (recipe: BeerRecipe, calculations: RecipeCalculations): StepBlueprint[] => {
  const steps: StepBlueprint[] = [
    {
      id: 'water-prep',
      name: 'Preparar a água',
      eyebrow: 'Água',
      instruction: `Separe aproximadamente ${calculations.totalWaterNeededLiters.toFixed(1)} L. Confira sais e tratamento antes de aquecer.`,
      next: `Aquecer a água de ataque até ${calculations.strikeWaterTempCelsius.toFixed(0)}°C.`,
    },
    {
      id: 'strike-heat',
      name: 'Aquecer água de ataque',
      eyebrow: 'Aquecimento',
      instruction: `Leve a água de ataque a ${calculations.strikeWaterTempCelsius.toFixed(0)}°C. O alvo considera a perda ao adicionar os grãos.`,
      next: 'Adicionar os grãos e estabilizar a primeira etapa da mostura.',
      targetTempCelsius: calculations.strikeWaterTempCelsius,
    },
  ];

  recipe.mashSchedule.forEach((mash, index) => {
    steps.push({
      id: `mash-${mash.id}`,
      name: mash.name || `Mostura ${index + 1}`,
      eyebrow: 'Mostura',
      instruction: mash.description || `Mantenha a mostura próxima de ${mash.tempCelsius}°C durante ${mash.durationMinutes} minutos.`,
      next: index < recipe.mashSchedule.length - 1 ? 'Seguir para a próxima rampa/descanso.' : 'Preparar a lavagem e coleta do mosto.',
      durationMinutes: mash.durationMinutes,
      targetTempCelsius: mash.tempCelsius,
    });
  });

  steps.push(
    {
      id: 'sparge',
      name: 'Lavagem e coleta',
      eyebrow: 'Lavagem',
      instruction: `Colete o mosto e use cerca de ${calculations.spargeWaterVolumeLiters.toFixed(1)} L na lavagem. Alvo pré-fervura: ${calculations.preBoilVolumeLiters.toFixed(1)} L.`,
      next: 'Registrar volume e densidade pré-fervura.',
    },
    {
      id: 'pre-boil',
      name: 'Conferir pré-fervura',
      eyebrow: 'Leitura',
      instruction: `Referência prevista: ${calculations.preBoilVolumeLiters.toFixed(1)} L e densidade ${calculations.preBoilGravity.toFixed(3)}. Registre o que realmente mediu.`,
      next: `Iniciar fervura de ${recipe.boilTimeMinutes || 60} minutos.`,
    },
    {
      id: 'boil',
      name: 'Fervura',
      eyebrow: 'Fervura',
      instruction: 'Mantenha fervura consistente. A linha de lúpulos abaixo usa os minutos restantes da receita.',
      next: recipe.hops.some((hop) => hop.use === 'Whirlpool') ? 'Desligar o fogo e seguir para o whirlpool.' : 'Desligar o fogo e iniciar o resfriamento.',
      durationMinutes: recipe.boilTimeMinutes || 60,
    },
  );

  if (recipe.hops.some((hop) => hop.use === 'Whirlpool')) {
    const whirlpool = recipe.hops.filter((hop) => hop.use === 'Whirlpool');
    const target = whirlpool.find((hop) => hop.tempCelsius)?.tempCelsius;
    const duration = Math.max(...whirlpool.map((hop) => hop.timeMinutes || 0), 15);
    steps.push({
      id: 'whirlpool',
      name: 'Whirlpool',
      eyebrow: 'Whirlpool',
      instruction: `Faça as adições de whirlpool${target ? ` próximo de ${target}°C` : ''}. Evite prolongar calor desnecessariamente.`,
      next: 'Resfriar o mosto até a faixa segura de inoculação.',
      durationMinutes: duration,
      targetTempCelsius: target,
    });
  }

  steps.push(
    {
      id: 'cool',
      name: 'Resfriar o mosto',
      eyebrow: 'Resfriamento',
      instruction: `Resfrie para a faixa de inoculação da ${recipe.yeast.name}: ${recipe.yeast.optimalTempMin}–${recipe.yeast.optimalTempMax}°C.`,
      next: 'Transferir, registrar OG real e inocular a levedura.',
      targetTempCelsius: recipe.yeast.optimalTempMin,
    },
    {
      id: 'pitch',
      name: 'Transferir e inocular',
      eyebrow: 'Fermentador',
      instruction: `Registre OG e temperatura de inoculação. Depois inocule ${recipe.yeast.name} e leve o lote ao controle de fermentação.`,
      next: 'Encerrar a brassagem e iniciar o acompanhamento da fermentação.',
      targetTempCelsius: recipe.yeast.optimalTempMin,
    },
  );

  return steps;
};

const formatClock = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const BrewdayV4: React.FC<BrewdayV4Props> = ({
  recipe,
  calculations,
  session,
  onStartSession,
  onUpdateSession,
  onExit,
  onOpenFermentation,
}) => {
  const blueprints = useMemo(() => buildSteps(recipe, calculations), [recipe, calculations]);
  const index = Math.min(session?.currentStepIndex ?? 0, blueprints.length - 1);
  const active = blueprints[index];
  const storedStep = session?.steps?.find((step) => step.id === active.id);
  const initialSeconds = active.durationMinutes ? active.durationMinutes * 60 : 0;
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let seconds = initialSeconds;
    if (storedStep?.startedAt && storedStep.status === 'active' && active.durationMinutes) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(storedStep.startedAt).getTime()) / 1000));
      seconds = Math.max(0, active.durationMinutes * 60 - elapsed);
    }
    setRemaining(seconds);
    setRunning(Boolean(storedStep?.startedAt && storedStep.status === 'active' && seconds > 0));
  }, [active.id, active.durationMinutes, initialSeconds, storedStep?.startedAt, storedStep?.status]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, remaining]);

  if (!session) {
    return (
      <section className="mx-auto max-w-3xl border border-white/[0.09] bg-[#14110d] p-7 text-center shadow-2xl sm:p-10">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bd6c32]">Modo brassagem V4</p>
        <h1 className="mt-3 font-serif text-3xl font-black text-[#f2e7d2]">Transformar receita em lote real</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">A receita é o plano. Ao iniciar, a Democrata cria um lote separado para guardar etapas, leituras reais, fermentação e avaliação sem alterar a receita original.</p>
        <button type="button" onClick={onStartSession} className="v4-primary-action mx-auto mt-6"><Flame className="h-4 w-4" /> Iniciar brassagem</button>
      </section>
    );
  }

  const records: BrewStepRecord[] = blueprints.map((step, stepIndex) => {
    const existing = session.steps?.find((record) => record.id === step.id);
    return existing ?? {
      id: step.id,
      name: step.name,
      status: stepIndex < index ? 'done' : stepIndex === index ? 'active' : 'pending',
      targetTempCelsius: step.targetTempCelsius,
      durationMinutes: step.durationMinutes,
    };
  });

  const update = (patch: Partial<BrewSession>) => onUpdateSession({ ...session, ...patch, updatedAt: new Date().toISOString() });

  const startTimer = () => {
    const now = new Date().toISOString();
    const nextRecords = records.map((record) => record.id === active.id ? { ...record, status: 'active' as const, startedAt: record.startedAt || now } : record);
    update({ steps: nextRecords, status: 'brewing' });
    setRunning(true);
  };

  const completeStep = () => {
    const now = new Date().toISOString();
    const nextIndex = Math.min(index + 1, blueprints.length - 1);
    const nextRecords = records.map((record, recordIndex) => {
      if (recordIndex < nextIndex) return { ...record, status: 'done' as const, completedAt: record.id === active.id ? now : record.completedAt };
      if (recordIndex === nextIndex) return { ...record, status: nextIndex === index ? 'done' as const : 'active' as const };
      return { ...record, status: 'pending' as const };
    });
    const isLast = index === blueprints.length - 1;
    update({
      currentStepIndex: nextIndex,
      steps: nextRecords,
      status: isLast ? 'fermenting' : 'brewing',
    });
    setRunning(false);
    if (isLast) onOpenFermentation();
  };

  const jumpTo = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(blueprints.length - 1, nextIndex));
    update({ currentStepIndex: bounded, steps: records.map((record, i) => ({ ...record, status: i < bounded ? 'done' : i === bounded ? 'active' : 'pending' })) });
    setRunning(false);
  };

  const saveActual = (key: keyof NonNullable<BrewSession['actuals']>, value: number | undefined, label: string, kind: BrewReading['kind'], unit?: string) => {
    const actuals = { ...(session.actuals || {}), [key]: value };
    const filtered = (session.readings || []).filter((reading) => reading.kind !== kind);
    const readings = value == null || Number.isNaN(value) ? filtered : [...filtered, { id: `${kind}-${Date.now()}`, recordedAt: new Date().toISOString(), kind, label, value, unit }];
    update({ actuals, readings });
  };

  const boilHops = [...recipe.hops].filter((hop) => hop.use === 'Boil' || hop.use === 'First Wort').sort((a, b) => b.timeMinutes - a.timeMinutes);
  const currentBoilMinute = active.id === 'boil' ? Math.ceil(remaining / 60) : recipe.boilTimeMinutes;
  const nextHop = boilHops.filter((hop) => hop.timeMinutes <= currentBoilMinute).sort((a, b) => b.timeMinutes - a.timeMinutes)[0];

  return (
    <div className="mx-auto max-w-[1180px] space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <button type="button" onClick={onExit} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-600 hover:text-stone-300"><ArrowLeft className="h-3.5 w-3.5" /> Voltar à receita</button>
          <h1 className="mt-2 font-serif text-xl font-black text-[#f2e7d2] sm:text-2xl">{recipe.name}</h1>
        </div>
        <div className="text-right"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Lote</p><strong className="font-mono text-xs text-[#bd6c32]">{session.brewedAt}</strong></div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden border border-white/[0.09] bg-[#11100d] shadow-2xl">
          <div className="border-b border-white/[0.08] bg-[#0d0b08] px-5 py-4 sm:px-7">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bd6c32]">Etapa {index + 1} de {blueprints.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-stone-600">{active.eyebrow}</p></div>
              <span className="font-mono text-[10px] text-stone-600">{Math.round(((index + 1) / blueprints.length) * 100)}%</span>
            </div>
            <div className="mt-3 h-1 bg-white/[0.05]"><div className="h-full bg-[#bd6c32] transition-all" style={{ width: `${((index + 1) / blueprints.length) * 100}%` }} /></div>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-10">
            <h2 className="max-w-3xl font-serif text-4xl font-black leading-none text-[#f2e7d2] sm:text-5xl">{active.name}</h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {active.targetTempCelsius != null && <div className="border-l-2 border-[#bd6c32] bg-black/20 p-4"><p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-stone-600"><Thermometer className="h-4 w-4" /> Temperatura alvo</p><strong className="mt-2 block font-mono text-4xl text-[#f2e7d2]">{active.targetTempCelsius.toFixed(0)}°C</strong></div>}
              {active.durationMinutes != null && <div className="border-l-2 border-[#7f8b58] bg-black/20 p-4"><p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-stone-600"><Clock3 className="h-4 w-4" /> Cronômetro</p><strong className="mt-2 block font-mono text-4xl text-[#f2e7d2]">{formatClock(remaining)}</strong></div>}
            </div>

            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-600">Agora</p>
              <p className="mt-2 max-w-3xl text-base leading-7 text-stone-300">{active.instruction}</p>
              <div className="mt-5 flex items-start gap-3 border-l-2 border-white/[0.12] pl-4"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#bd6c32]" /><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-600">Depois</p><p className="mt-1 text-xs leading-5 text-stone-500">{active.next}</p></div></div>
            </div>

            {active.durationMinutes != null && (
              <div className="mt-7 grid grid-cols-3 gap-2">
                <button type="button" onClick={running ? () => setRunning(false) : startTimer} className="v4-brew-button">{running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}<span>{running ? 'Pausar' : storedStep?.startedAt ? 'Continuar' : 'Iniciar'}</span></button>
                <button type="button" onClick={() => setRemaining((value) => value + 60)} className="v4-brew-button"><Plus className="h-5 w-5" /><span>+1 min</span></button>
                <button type="button" onClick={() => { setRemaining(0); setRunning(false); }} className="v4-brew-button"><Clock3 className="h-5 w-5" /><span>Zerar</span></button>
              </div>
            )}

            {active.id === 'boil' && boilHops.length > 0 && (
              <div className="mt-7 border border-[#bd6c32]/30 bg-[#1a1009] p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">Linha de lúpulos</p>{nextHop && <span className="text-[10px] text-stone-500">próxima referência: {nextHop.name}</span>}</div>
                <div className="mt-3 space-y-2">{boilHops.map((hop) => <div key={hop.id} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 border-t border-white/[0.06] pt-2 text-xs"><strong className="font-mono text-[#e0aa54]">-{hop.timeMinutes} min</strong><span className="font-bold text-stone-300">{hop.name}</span><span className="font-mono text-stone-500">{hop.amountGrams} g</span></div>)}</div>
              </div>
            )}

            <div className="mt-8 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
              <button type="button" disabled={index === 0} onClick={() => jumpTo(index - 1)} className="v4-secondary-button justify-center disabled:opacity-25"><ArrowLeft className="h-4 w-4" /> Anterior</button>
              <button type="button" onClick={completeStep} className="v4-primary-action min-h-14 justify-center text-sm"><Check className="h-5 w-5" /> {index === blueprints.length - 1 ? 'Encerrar brassagem' : 'Concluir etapa'}</button>
              <button type="button" disabled={index === blueprints.length - 1} onClick={() => jumpTo(index + 1)} className="v4-secondary-button justify-center disabled:opacity-25">Pular <ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="border border-white/[0.08] bg-[#14110d] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#bd6c32]">Leituras do lote</p>
            <p className="mt-2 text-[10px] leading-5 text-stone-600">Previsto e medido ficam separados. Preencha só o que você realmente mediu.</p>
            <div className="mt-4 space-y-3">
              <ReadingInput label="Volume pré-fervura" unit="L" predicted={calculations.preBoilVolumeLiters.toFixed(1)} value={session.actuals?.preBoilVolumeLiters} onChange={(value) => saveActual('preBoilVolumeLiters', value, 'Volume pré-fervura', 'preBoilVolume', 'L')} />
              <ReadingInput label="Densidade pré-fervura" predicted={calculations.preBoilGravity.toFixed(3)} value={session.actuals?.preBoilGravity} step="0.001" onChange={(value) => saveActual('preBoilGravity', value, 'Densidade pré-fervura', 'preBoilGravity')} />
              <ReadingInput label="Volume pós-fervura" unit="L" value={session.actuals?.postBoilVolumeLiters} onChange={(value) => saveActual('postBoilVolumeLiters', value, 'Volume pós-fervura', 'postBoilVolume', 'L')} />
              <ReadingInput label="OG real" predicted={calculations.og.toFixed(3)} value={session.actuals?.originalGravity} step="0.001" onChange={(value) => saveActual('originalGravity', value, 'OG real', 'originalGravity')} />
              <ReadingInput label="Temperatura de inoculação" unit="°C" value={session.actuals?.pitchTempCelsius} onChange={(value) => saveActual('pitchTempCelsius', value, 'Temperatura de inoculação', 'pitchTemperature', '°C')} />
              <ReadingInput label="pH de mostura medido" predicted={calculations.estimatedMashPh?.estimatedPh?.toFixed(2)} value={session.actuals?.mashPh} step="0.01" onChange={(value) => saveActual('mashPh', value, 'pH de mostura', 'mashPh')} />
            </div>
          </section>

          <section className="border border-white/[0.08] bg-[#0f0d0a] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-600">Referências</p>
            <div className="mt-4 space-y-3 text-xs"><Fact icon={Droplets} label="Água total" value={`${calculations.totalWaterNeededLiters.toFixed(1)} L`} /><Fact icon={Gauge} label="OG prevista" value={calculations.og.toFixed(3)} /><Fact icon={Flame} label="Fervura" value={`${recipe.boilTimeMinutes || 60} min`} /><Fact icon={Thermometer} label="Fermentação" value={`${recipe.yeast.optimalTempMin}–${recipe.yeast.optimalTempMax}°C`} /></div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const ReadingInput: React.FC<{ label: string; unit?: string; predicted?: string; value?: number; step?: string; onChange: (value: number | undefined) => void }> = ({ label, unit, predicted, value, step = '0.1', onChange }) => (
  <label className="block border-t border-white/[0.06] pt-3 first:border-t-0 first:pt-0">
    <span className="flex items-center justify-between gap-2 text-[10px] text-stone-500"><b className="font-bold text-stone-400">{label}</b>{predicted && <small>prev. {predicted}</small>}</span>
    <div className="relative mt-1.5"><input type="number" step={step} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} className="v4-input pr-10" placeholder="medido" />{unit && <span className="absolute right-3 top-3 text-[10px] text-stone-600">{unit}</span>}</div>
  </label>
);

const Fact: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-stone-600"><Icon className="h-3.5 w-3.5 text-[#bd6c32]" /> {label}</span><strong className="font-mono text-stone-300">{value}</strong></div>
);
