import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { BJCP_STYLES } from '../data/ingredients';
import { generateCraftRecipeLocally, mutateCraftRecipeLocally, generateSensoryAnalysisLocally } from '../utils/aiRecipeGenerator';
import {
  Zap,
  RotateCw,
  FlaskConical,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sliders,
  Sparkles,
  Droplet,
  Dna,
  ShieldCheck,
  Atom,
  X,
} from 'lucide-react';
import { triggerRecipeCreationSpark, triggerHopSpark } from '../utils/dopamineEffects';
import { DemocrataLogo } from './DemocrataLogo';

interface AIFudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecipe: BeerRecipe;
  calculations: RecipeCalculations;
  onApplyRecipe: (recipe: BeerRecipe) => void;
}

export const AIFudgeModal: React.FC<AIFudgeModalProps> = ({
  isOpen,
  onClose,
  currentRecipe,
  calculations,
  onApplyRecipe,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'mutate' | 'sensory'>('create');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generator State
  const [promptConcept, setPromptConcept] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('New England / Hazy IPA');
  const [targetAbv, setTargetAbv] = useState('6.8');
  const [targetIbu, setTargetIbu] = useState('45');
  const [specialIngredients, setSpecialIngredients] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mutator State
  const [mutationGoal, setMutationGoal] = useState('');
  const [isMutating, setIsMutating] = useState(false);

  // Sensory State
  const [sensoryData, setSensoryData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  // Handle Recipe Generation with zero-failure local fallback
  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      let createdRecipe: BeerRecipe | null = null;
      try {
        const response = await fetch('/api/ai/recipe-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptConcept,
            styleName: selectedStyle,
            targetAbv: parseFloat(targetAbv) || 6.5,
            targetIbu: parseFloat(targetIbu) || 40,
            batchSize: currentRecipe.batchSizeLiters || 20,
            specialIngredients,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recipe) {
            createdRecipe = data.recipe;
          }
        }
      } catch (e) {
        // network or server not present on static deployment
      }

      if (!createdRecipe) {
        // Fallback to local alchemy engine
        createdRecipe = generateCraftRecipeLocally({
          prompt: promptConcept,
          styleName: selectedStyle,
          targetAbv: parseFloat(targetAbv) || 6.5,
          targetIbu: parseFloat(targetIbu) || 40,
          batchSize: currentRecipe.batchSizeLiters || 20,
          specialIngredients,
        });
      }

      if (createdRecipe) {
        triggerRecipeCreationSpark();
        onApplyRecipe(createdRecipe);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao processar receita. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Recipe Mutation with zero-failure local fallback
  const handleMutateRecipe = async (goal?: string) => {
    const finalGoal = goal || mutationGoal;
    if (!finalGoal) return;
    setIsMutating(true);
    setErrorMsg('');
    try {
      let mutated: BeerRecipe | null = null;
      try {
        const response = await fetch('/api/ai/recipe-mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentRecipe,
            mutationGoal: finalGoal,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.recipe) {
            mutated = data.recipe;
          }
        }
      } catch (e) {
        // static deployment
      }

      if (!mutated) {
        mutated = mutateCraftRecipeLocally(currentRecipe, finalGoal);
      }

      if (mutated) {
        triggerHopSpark(0.5, 0.5);
        onApplyRecipe(mutated);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Falha ao calibrar fórmula.');
    } finally {
      setIsMutating(false);
    }
  };

  // Handle Deep Sensory Analysis with zero-failure local fallback
  const handleSensoryAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg('');
    try {
      let analysisResult: any = null;
      try {
        const response = await fetch('/api/ai/flavor-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipe: currentRecipe,
            calculations,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.analysis) {
            analysisResult = data.analysis;
          }
        }
      } catch (e) {
        // network or server not reachable
      }

      if (!analysisResult) {
        analysisResult = generateSensoryAnalysisLocally(currentRecipe, calculations);
      }

      if (analysisResult) {
        setSensoryData(analysisResult);
      }
    } catch (err: any) {
      console.warn('Sensory analysis fallback trigger:', err);
      try {
        const fallback = generateSensoryAnalysisLocally(currentRecipe, calculations);
        setSensoryData(fallback);
      } catch {
        // Last line of defense
        setSensoryData({
          masterVerdict: `Receita com perfil artesanal autêntico, destacando harmonia entre base maltada e expressão fresca de lúpulo.`,
          flavorRadar: {
            amargor: 6,
            aroma_lupulo: 7,
            corpo: 6,
            dulcor: 4,
            citrico: 6,
            resinoso: 5,
            malte: 6,
            final_seco: 7,
          },
          hopOilSynergy: 'Equilíbrio primoroso de óleos aromáticos sem aspereza.',
          waterProfileReview: 'Perfil mineral adequado para boa estabilidade e clarificação.',
          brewingTips: [
            'Fervura vigorosa sem tampa para volatilização de compostos indesejados.',
            'Descanso de diacetil nos últimos dias da fermentação.',
            'Cold crash a 1°C-2°C para brilho e limpidez máxima.'
          ]
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Isolated backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl bg-stone-900 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto h-[90vh] sm:h-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/70 to-stone-950 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <DemocrataLogo size="custom" customSizePx={44} variant="circular" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400 font-serif font-black">
                  DEMOCRATA BIER
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40 font-bold hidden xs:inline-block">
                  Ajuda para criar receitas
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Criar Receita com IA
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-xs sm:text-sm font-bold shrink-0 min-h-[40px]"
            title="Fechar (Esc)"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4 text-amber-400" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Tab Navigation with mobile horizontal scroll */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 px-3 sm:px-6 gap-2 text-xs md:text-sm font-bold overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" /> Forjar Nova Receita
          </button>

          <button
            onClick={() => setActiveTab('mutate')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'mutate'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <RotateCw className="w-4 h-4 text-emerald-400" /> Evoluir & Remixar
          </button>

          <button
            onClick={() => setActiveTab('sensory')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'sensory'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-400" /> Raio-X Sensorial
          </button>
        </div>

        {/* Scrollable Container for Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-5">

        {/* Error Message Box */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-950/70 border border-rose-600/50 rounded-2xl flex items-center gap-3 text-xs text-rose-200 shadow-md">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: CREATE FROM SCRATCH */}
        {activeTab === 'create' && (
          <div className="p-6 space-y-5">
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 text-xs text-stone-300">
              <span className="font-bold text-amber-400 block mb-1">
                Forjador de Receitas Autênticas para a Panela Caseira
              </span>
              Defina a ideia da cerveja (ou ingredientes que você quer usar) e o sistema calcula a proporção perfeita de grãos, lúpulos em fervura/whirlpool/dry-hop, perfil de água e mostura sob medida para o volume da sua panela.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                  Conceito / Ideia da Cerveja:
                </label>
                <input
                  type="text"
                  value={promptConcept}
                  onChange={(e) => setPromptConcept(e.target.value)}
                  placeholder="Ex: Hazy IPA super frutada com maracujá e manga, corpo aveludado e amargor suave..."
                  className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                    Estilo de base:
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {BJCP_STYLES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                    Teor Alcoólico Alvo (ABV %):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetAbv}
                    onChange={(e) => setTargetAbv(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                    Amargor Alvo (IBU):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={targetIbu}
                    onChange={(e) => setTargetIbu(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                  Lúpulos Preferidos ou Ingredientes Especiais (Opcional):
                </label>
                <input
                  type="text"
                  value={specialIngredients}
                  onChange={(e) => setSpecialIngredients(e.target.value)}
                  placeholder="Ex: Mosaic, Galaxy, casca de laranja, aveia em flocos, lactose..."
                  className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-8 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Calculando e Forjando Receita...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 fill-stone-950/40" />
                    <span>Forjar Receita Democrata</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MUTATE & EVOLVE */}
        {activeTab === 'mutate' && (
          <div className="p-6 space-y-5">
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 text-xs text-stone-300">
              <span className="font-bold text-emerald-400 block mb-1">
                Evolução Cervejeira para "{currentRecipe.name}"
              </span>
              Ajuste e recalibre a receita atual para novos objetivos sem perder a harmonia dos maltes e o perfil de água.
            </div>

            {/* Quick Action Presets */}
            <div>
              <span className="block text-xs font-bold uppercase text-stone-400 mb-2">
                Ajustes Rápidos de Panela:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    title: '🔥 Turbinar para Versão Imperial / Double',
                    desc: 'Elevar ABV para 8.5% e dobrar a carga de lúpulo no dry hop',
                    goal: 'Transforme esta cerveja em uma versão Double / Imperial extrema com 8.5% ABV e carga massiva de lúpulo aromático.',
                  },
                  {
                    title: '🥭 Explosão Tropical no Dry Hop',
                    desc: 'Maximizar tióis e óleos aromáticos (maracujá, manga e goiaba)',
                    goal: 'Redesenhe a lupulagem focando em whirlpool a 80C e dry hopping massivo com lúpulos ricos em tióis tropicais.',
                  },
                  {
                    title: '⚡ Deixar Mais Seca e Crocante (Crispy)',
                    desc: 'Aumentar atratividade e diminuir FG para 1.008 com amargor limpo',
                    goal: 'Ajuste a mostura para 64C e recalibre a água para relação sulfato/cloreto de 2.5:1 para um final extra seco e refrescante.',
                  },
                  {
                    title: '🍦 Corpo Sedoso & Aveludado (Hazy/Smooth)',
                    desc: 'Adicionar aveia, trigo e água rica em cloreto para sensação cremosa',
                    goal: 'Aumente o corpo adicionando malte de trigo e aveia em flocos, com cloreto de cálcio na água para textura macia.',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMutateRecipe(item.goal)}
                    disabled={isMutating}
                    className="text-left bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 p-3 rounded-xl transition-all group"
                  >
                    <div className="font-bold text-stone-200 group-hover:text-emerald-300">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mutation Goal */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
                Ou digite seu ajuste personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mutationGoal}
                  onChange={(e) => setMutationGoal(e.target.value)}
                  placeholder="Ex: Quero diminuir o amargor para 30 IBU e adicionar raspas de limão siciliano..."
                  className="flex-1 bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleMutateRecipe()}
                  disabled={isMutating || !mutationGoal}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                  Evoluir Fórmula
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SENSORY RADAR & HOP OILS */}
        {activeTab === 'sensory' && (
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4">
              <div>
                <span className="font-bold text-cyan-400 block text-xs mb-0.5">
                  Raio-X de Óleos de Lúpulo & Termodinâmica do Mosto
                </span>
                <p className="text-stone-300 text-[11px]">
                  Analisa a interação entre terpenos (mirceno, humuleno, linalol), biotransformação da levedura e equilíbrio da água.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSensoryAnalysis}
                disabled={isAnalyzing}
                className="bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Calcular Parecer Técnico
              </button>
            </div>

            {sensoryData ? (
              <div className="space-y-4">
                {/* Master Verdict */}
                <div className="bg-stone-950 border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                    PARECER TÉCNICO DO MESTRE CERVEJEIRO:
                  </span>
                  <p className="text-xs text-stone-200 leading-relaxed italic">
                    "{sensoryData.masterVerdict}"
                  </p>
                </div>

                {/* Radar Grid Bars */}
                {sensoryData.flavorRadar && (
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
                    <span className="text-xs font-bold text-stone-300 block mb-3">
                      Impressão Sensorial Estimada (Escala 1 a 10):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {Object.entries(sensoryData.flavorRadar).map(([key, val]: [string, any]) => (
                        <div key={key} className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                          <div className="flex justify-between text-stone-400 capitalize mb-1 text-[11px]">
                            <span>{key}</span>
                            <span className="font-bold text-amber-400 font-mono">{val}/10</span>
                          </div>
                          <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700"
                              style={{ width: `${(val / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synergy & Water Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {sensoryData.hopOilSynergy && (
                    <div className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl space-y-1">
                      <span className="font-bold text-amber-400 block text-[11px] uppercase">
                        🌿 Sinergia de Óleos de Lúpulo:
                      </span>
                      <p className="text-stone-300 leading-relaxed text-[11px]">
                        {sensoryData.hopOilSynergy}
                      </p>
                    </div>
                  )}

                  {sensoryData.waterProfileReview && (
                    <div className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl space-y-1">
                      <span className="font-bold text-cyan-400 block text-[11px] uppercase">
                        💧 Balanço da Água & Sais:
                      </span>
                      <p className="text-stone-300 leading-relaxed text-[11px]">
                        {sensoryData.waterProfileReview}
                      </p>
                    </div>
                  )}
                </div>

                {/* Master Tips */}
                {sensoryData.brewingTips && (
                  <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-stone-300 block mb-2">
                      💡 Dicas Práticas de Ouro para a Brassagem Desta Receita:
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {sensoryData.brewingTips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs">
                Clique no botão acima para gerar a análise de óleos de lúpulo, tióis e água desta receita.
              </div>
            )}
          </div>
        )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 p-3 sm:p-4 border-t border-stone-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 text-xs sm:text-sm flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
