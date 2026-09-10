import React, { useState, useEffect } from 'react';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Bell,
  Thermometer,
  Clock,
  Droplet,
  Flame,
  Shield,
  Dna,
  Calculator,
  Award,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { brewAudio } from '../utils/audioAlerts';
import { triggerVictoryCelebration, triggerProstCelebration } from '../utils/dopamineEffects';
import { brixToFinalGravity } from '../utils/brewingCalculations';
import { DemocrataLogo } from './DemocrataLogo';

interface BrewdayCockpitProps {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
  onExit: () => void;
}

export const BrewdayCockpit: React.FC<BrewdayCockpitProps> = ({
  recipe,
  calculations,
  onExit,
}) => {
  // Active step index
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(60 * 60); // 60 mins default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerLabel, setTimerLabel] = useState('Mostura - Sacarificação');

  // Interactive Brewer Notes & Readings
  const [preBoilSgReading, setPreBoilSgReading] = useState('');
  const [ogReading, setOgReading] = useState('');
  const [mashPhReading, setMashPhReading] = useState('5.3');

  // Refractometer mini tool in cockpit
  const [brixInput, setBrixInput] = useState('');
  const [calcSgResult, setCalcSgResult] = useState<number | null>(null);

  // Kettle Flame Intensity Control
  const [flameIntensity, setFlameIntensity] = useState<'off' | 'low' | 'high'>('high');

  // Brewday steps list
  const steps = [
    {
      id: 'step-water',
      title: '1. Tratamento da Água & Sais Minerais',
      icon: Droplet,
      color: 'text-cyan-400',
      description: `Separar ${calculations.strikeWaterVolumeLiters}L de água para mostura e ${calculations.spargeWaterVolumeLiters}L para lavagem.`,
      instructions: [
        `Descloração da Água: Adicionar ${calculations.campdenDosage?.tabletFraction || '1/3 de pastilha'} (${calculations.campdenDosage?.gramsNeeded || 0.18}g) de Campden/Metabissulfito para eliminar cloraminas e prevenir clorofenóis.`,
        `Pesar e dissolver os sais minerais: ${recipe.waterSalts?.gypsumGrams || 0}g Gipsita, ${recipe.waterSalts?.calciumChlorideGrams || 0}g Cloreto de Cálcio, ${recipe.waterSalts?.epsomSaltGrams || 0}g Epsom.`,
        (recipe.waterSalts?.lacticAcid88Ml || 0) > 0
          ? `Adicionar ${recipe.waterSalts?.lacticAcid88Ml}mL de ácido lático 88% (pH previsto da mostura: ${calculations.estimatedMashPh?.estimatedPh || 5.3}).`
          : 'Verificar pH da água.',
      ],
      defaultTimerMins: 15,
    },
    {
      id: 'step-strike',
      title: '2. Aquecimento da Água de Mostura (Strike)',
      icon: Flame,
      color: 'text-orange-400',
      description: `Aquecer ${calculations.strikeWaterVolumeLiters}L de água até a temperatura exata de ${calculations.strikeWaterTempCelsius}°C.`,
      instructions: [
        `Ao atingir ${calculations.strikeWaterTempCelsius}°C, desligar o fogo/resistência antes de despejar os maltes moídos.`,
        `O contato do malte a 20°C fará a temperatura estabilizar exatamente nos ${calculations.effectiveMashTempCelsius?.toFixed(1) || 66}°C da sacarificação desejada.`,
      ],
      defaultTimerMins: 20,
    },
    {
      id: 'step-mash',
      title: '3. Arreamento do Malte & Mostura Ativa',
      icon: Clock,
      color: 'text-amber-400',
      description: `Despejar os ${calculations.totalGrainKg}kg de malte misturando lentamente para evitar grumos (dough-in).`,
      instructions: [
        'Homogeneizar bem a cama de grãos sem espirrar.',
        'Medir a temperatura em 3 pontos da panela.',
        'Manter tampa fechada e controlar temperatura durante os 60 minutos.',
      ],
      defaultTimerMins: (recipe.mashSchedule || [])[0]?.durationMinutes || 60,
    },
    {
      id: 'step-mashout',
      title: '4. Teste de Iodo & Rampa de Mash-Out',
      icon: Thermometer,
      color: 'text-purple-400',
      description: 'Verificar conversão de amido e elevar para 76°C para encerrar ação enzimática.',
      instructions: [
        'Pingar 1 gota de tintura de iodo em amostra do mosto (se não mudar de cor, a conversão está 100% concluída!).',
        'Elevar temperatura para 76°C por 10 minutos para fluidez e fixação do perfil de açúcares.',
      ],
      defaultTimerMins: 10,
    },
    {
      id: 'step-sparge',
      title: '5. Recirculação (Vorlauf) & Lavagem (Sparge)',
      icon: Droplet,
      color: 'text-sky-400',
      description: `Recircular até o mosto sair límpido e lavar os grãos com ${calculations.spargeWaterVolumeLiters}L de água a 76°C.`,
      instructions: [
        'Recircular suavemente os primeiros litros sobre a cama de grãos.',
        `Lavar a cama com os ${calculations.spargeWaterVolumeLiters}L de água quente até atingir ${calculations.preBoilVolumeLiters}L na panela de fervura.`,
        'Medir a densidade pré-fervura (Alvo estimado: ~' + calculations.preBoilGravity + ').',
      ],
      defaultTimerMins: 30,
    },
    {
      id: 'step-boil',
      title: '6. Fervura Vigorosa & Adições de Lúpulo',
      icon: Flame,
      color: 'text-emerald-400',
      description: `Ferver vigorosamente por ${recipe.boilTimeMinutes || 60} minutos com a panela 100% destampada (para volatilizar DMS).`,
      instructions: (recipe.hops || [])
        .filter((h) => h.use === 'Boil' || h.use === 'First Wort')
        .map((h) => `Adicionar ${h.name} (${h.amountGrams}g) aos ${h.timeMinutes} minutos restantes de fervura.`),
      defaultTimerMins: recipe.boilTimeMinutes || 60,
    },
    {
      id: 'step-whirlpool',
      title: '7. Whirlpool & Decantação de Trub',
      icon: Shield,
      color: 'text-amber-300',
      description: 'Fazer o redemoinho (whirlpool) e adicionar os lúpulos aromáticos a 80°C.',
      instructions: [
        'Desligar o fogo e resfriar brevemente o mosto até 80°C.',
        ...(recipe.hops || [])
          .filter((h) => h.use === 'Whirlpool')
          .map((h) => `Adição de Whirlpool: ${h.name} (${h.amountGrams}g @ ${h.tempCelsius || 80}°C).`),
        'Girar vigorosamente o mosto em círculo por 2 minutos e deixar descansar por 15 minutos para formar o cone de trub no centro.',
      ],
      defaultTimerMins: 20,
    },
    {
      id: 'step-ferment',
      title: '8. Resfriamento Rápido & Inoculação (Pitching)',
      icon: Dna,
      color: 'text-rose-400',
      description: `Resfriar para ${recipe.yeast?.optimalTempMin || 18}°C, aerar vigorosamente e inocular ${recipe.yeast?.name || 'levedura'}.`,
      instructions: [
        `Resfriar pelo chiller até ${recipe.yeast?.optimalTempMin || 18}°C.`,
        `Transferir para o fermentador sanitizado e aerar vigorosamente com oxigênio ou agitação.`,
        `Medir a OG Final (Alvo: ${calculations.og}).`,
        `Inocular levedura ${recipe.yeast?.name || 'SafAle US-05'} (${recipe.yeast?.brand || 'Fermentis'}). Fechar fermentador e instalar airlock com álcool 70%.`,
      ],
      defaultTimerMins: 15,
    },
  ];

  // Close / Exit on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      brewAudio.playVictoryFanfare();
      triggerVictoryCelebration();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSetStep = (idx: number) => {
    setCurrentStepIdx(idx);
    setTimerSeconds(steps[idx].defaultTimerMins * 60);
    setTimerLabel(steps[idx].title);
    setIsTimerRunning(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConvertBrix = () => {
    const brix = parseFloat(brixInput);
    if (!isNaN(brix)) {
      const sg = Number((1 + (brix / (258.6 - (brix / 258.2) * 227.1))).toFixed(3));
      setCalcSgResult(sg);
    }
  };

  const isLastStep = currentStepIdx === steps.length - 1;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-3 sm:p-6 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-amber-950/60 bg-stone-900/90 p-4 rounded-3xl border border-amber-900/40 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <DemocrataLogo size="custom" customSizePx={50} variant="circular" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                MODO BRASSAGEM AO VIVO • DEMOCRATA BIER
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-black text-white tracking-wide">
                {recipe.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-mono text-amber-300 hidden md:block">
              Alvo OG: <span className="font-bold text-white">{calculations.og}</span> • IBU:{' '}
              <span className="font-bold text-emerald-400">{calculations.ibu}</span> • Caldeirão:{' '}
              <span className="font-bold text-amber-400">{recipe.batchSizeLiters}L</span>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm min-h-[38px]"
              title="Voltar à tela de edição da receita (Esc)"
              aria-label="Sair do modo brassagem"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sair da Brassagem</span>
            </button>
          </div>
        </div>

        {/* Main Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Steps Checklist */}
          <div className="lg:col-span-1 space-y-2 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center justify-between">
              <span>Roteiro da Panela</span>
              <span className="text-[10px] font-mono text-amber-500">
                Passo {currentStepIdx + 1}/{steps.length}
              </span>
            </h3>
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isDone = idx < currentStepIdx;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleSetStep(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border ${
                    isActive
                      ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
                      : isDone
                      ? 'bg-stone-950/60 border-stone-800 text-stone-400'
                      : 'bg-stone-950/40 border-stone-800/60 text-stone-500 hover:text-stone-300 hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stone-900 text-stone-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-white' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 shrink-0">
                    {step.defaultTimerMins}m
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center & Right / Live Step Execution & Giant Timer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Detail Card */}
            <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">
                    Etapa Atual {currentStepIdx + 1} de {steps.length}
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">
                    {steps[currentStepIdx].title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => brewAudio.playHopAlert()}
                    className="bg-stone-950 hover:bg-stone-800 text-amber-400 p-2.5 rounded-xl border border-stone-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Testar alarme da panela"
                  >
                    <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="hidden sm:inline">Testar Alarme</span>
                  </button>
                </div>
              </div>

              {/* Step Description */}
              <p className="text-sm font-semibold text-amber-200/90 mb-4 bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl shadow-inner">
                {steps[currentStepIdx].description}
              </p>

              {/* Instructions checklist */}
              <div className="space-y-2.5 mb-6 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">
                  Procedimento do Mestre Cervejeiro:
                </span>
                {steps[currentStepIdx].instructions.map((inst, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{inst}</span>
                  </div>
                ))}
              </div>

              {/* Giant Live Countdown Timer with Boiling Visual Effects */}
              <div className="bg-gradient-to-b from-stone-950 to-black rounded-3xl p-6 border-2 border-amber-500/40 text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {/* Visual Kettle Steam Effects when timer is running */}
                {isTimerRunning && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute top-2 left-1/4 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="absolute top-2 right-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl animate-pulse duration-700" />
                  </div>
                )}

                <div className="text-xs uppercase font-mono text-amber-400 font-bold mb-1 tracking-widest flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{timerLabel}</span>
                </div>

                <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-amber-400 tracking-wider my-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  {formatTimer(timerSeconds)}
                </div>

                {/* Flame intensity controller indicator */}
                <div className="inline-flex items-center gap-2 bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800 text-[11px] font-mono mb-4 text-stone-300">
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                  <span>Chama da Panela:</span>
                  <span className="text-amber-400 font-bold uppercase">
                    {currentStepIdx === 1 ? 'Aquecendo Strike (74°C)' : currentStepIdx === 5 ? 'Fervura Aberta 100°C' : 'Controle Térmico'}
                  </span>
                </div>

                {/* Timer Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(!isTimerRunning);
                      brewAudio.playChime();
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 ${
                      isTimerRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" /> Pausar Cronômetro
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-stone-950" /> Iniciar Cronômetro
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerSeconds(steps[currentStepIdx].defaultTimerMins * 60);
                      setIsTimerRunning(false);
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-3 rounded-2xl text-xs font-bold border border-stone-800 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Resetar
                  </button>

                  {/* Preset quick minute adjustments */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((prev) => prev + 5 * 60)}
                      className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-3 py-3 rounded-2xl text-xs font-mono font-bold border border-stone-800"
                      title="Adicionar 5 minutos"
                    >
                      +5m
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerSeconds((prev) => Math.max(0, prev - 5 * 60))}
                      className="bg-stone-900 hover:bg-stone-800 text-stone-400 px-3 py-3 rounded-2xl text-xs font-mono font-bold border border-stone-800"
                      title="Subtrair 5 minutos"
                    >
                      -5m
                    </button>
                  </div>
                </div>
              </div>

              {/* Hop Addition Timeline Reminder (If Boil Step) */}
              {currentStepIdx === 5 && (
                <div className="mt-6 bg-stone-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Cronograma de Adições na Fervura:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {recipe.hops
                      .filter((h) => h.use === 'Boil' || h.use === 'First Wort')
                      .map((hop, i) => (
                        <div key={i} className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
                          <span className="font-bold text-stone-200">{hop.name} ({hop.amountGrams}g)</span>
                          <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                            {hop.timeMinutes} min
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Next / Previous Step Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  disabled={currentStepIdx === 0}
                  onClick={() => handleSetStep(currentStepIdx - 1)}
                  className="text-stone-400 hover:text-white disabled:opacity-30 text-xs font-bold px-3 py-2 rounded-xl"
                >
                  ← Etapa Anterior
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isLastStep) {
                      triggerVictoryCelebration();
                    } else {
                      handleSetStep(currentStepIdx + 1);
                    }
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {isLastStep ? '🎉 Concluir Brassagem!' : 'Próxima Etapa →'}
                </button>
              </div>
            </div>

            {/* Quick Brewer Readings Log */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  pH Medido na Mostura:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={mashPhReading}
                    onChange={(e) => setMashPhReading(e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-amber-300 font-mono font-bold text-sm px-2 py-1 rounded-lg w-16 text-center focus:outline-none"
                  />
                  <span className="text-stone-400 text-[10px]">(Ideal: 5.2 - 5.5)</span>
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  Densidade Pré-Fervura:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`~${calculations.preBoilGravity}`}
                    value={preBoilSgReading}
                    onChange={(e) => setPreBoilSgReading(e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-cyan-300 font-mono font-bold text-sm px-2 py-1 rounded-lg w-20 text-center focus:outline-none"
                  />
                  <span className="text-stone-400 text-[10px]">SG</span>
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                  OG Real no Fermentador:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`${calculations.og}`}
                    value={ogReading}
                    onChange={(e) => setOgReading(e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-emerald-300 font-mono font-bold text-sm px-2 py-1 rounded-lg w-20 text-center focus:outline-none"
                  />
                  <span className="text-stone-400 text-[10px]">SG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
