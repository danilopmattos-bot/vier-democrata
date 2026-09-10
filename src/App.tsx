import React, { useEffect, useMemo, useState } from 'react';
import type { BeerRecipe, BJCPStyle, BrewSession } from './types/brewing';
import { BJCP_STYLES, SIGNATURE_RECIPES, YEAST_DATABASE } from './data/ingredients';
import { calculateAllMetrics, scaleRecipeBatchSize } from './utils/brewingCalculations';
import { AppShell, AppTab } from './components/AppShell';
import { BrewDeskHome } from './components/BrewDeskHome';
import { RecipeForgeV4 } from './components/RecipeForgeV4';
import { BJCPAtlasV4 } from './components/BJCPAtlasV4';
import { BrewdayV4 } from './components/BrewdayV4';
import { WaterStudioV4 } from './components/WaterStudioV4';
import { FermentationHistoryV4 } from './components/FermentationHistoryV4';
import { DiagnosticsV4 } from './components/DiagnosticsV4';
import { LabelStudio } from './components/LabelStudio';
import { BrewSheetPrint } from './components/BrewSheetPrint';
import { AIFudgeModal } from './components/AIFudgeModal';
import { ToolsCalculatorModal } from './components/ToolsCalculatorModal';
import { PrivateGate } from './components/PrivateGate';
import { triggerRecipeCreationSpark } from './utils/dopamineEffects';
import {
  loadBrewSessions,
  loadRecipes,
  readStoredArray,
  saveBrewSessions,
  STORAGE_KEYS,
  writeStoredArray,
} from './utils/localStorage';

const isoDate = () => new Date().toISOString().slice(0, 10);

export const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => localStorage.getItem('democrata_lab_unlocked_session') === 'true');
  const [customStyles] = useState<BJCPStyle[]>(() => readStoredArray<BJCPStyle>(STORAGE_KEYS.customStyles, []));
  const allStyles = useMemo(() => [...customStyles, ...BJCP_STYLES], [customStyles]);

  const [recipes, setRecipes] = useState<BeerRecipe[]>(() => loadRecipes(SIGNATURE_RECIPES));
  const [brewSessions, setBrewSessions] = useState<BrewSession[]>(loadBrewSessions);
  const [activeRecipeId, setActiveRecipeId] = useState<string>(() => recipes[0]?.id || SIGNATURE_RECIPES[0].id);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const [isAIForgeOpen, setIsAIForgeOpen] = useState(false);
  const [isCalculatorsOpen, setIsCalculatorsOpen] = useState(false);
  const [calculatorInitialTab, setCalculatorInitialTab] = useState<'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast'>('yeast');

  const currentRecipe = useMemo(() => recipes.find((recipe) => recipe.id === activeRecipeId) || recipes[0] || SIGNATURE_RECIPES[0], [recipes, activeRecipeId]);
  const calculations = useMemo(() => calculateAllMetrics(currentRecipe), [currentRecipe]);

  const currentSession = useMemo(() => {
    const explicit = brewSessions.find((session) => session.id === activeSessionId);
    if (explicit) return explicit;
    return [...brewSessions]
      .filter((session) => session.recipeId === currentRecipe.id && session.status !== 'completed')
      .sort((a, b) => (b.updatedAt || b.brewedAt).localeCompare(a.updatedAt || a.brewedAt))[0];
  }, [activeSessionId, brewSessions, currentRecipe.id]);

  useEffect(() => writeStoredArray(STORAGE_KEYS.recipes, recipes), [recipes]);
  useEffect(() => saveBrewSessions(brewSessions), [brewSessions]);

  const handleOpenCalculators = (tab: 'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast' = 'yeast') => {
    setCalculatorInitialTab(tab);
    setIsCalculatorsOpen(true);
  };

  const handleUpdateRecipe = (updated: BeerRecipe) => {
    setRecipes((previous) => previous.map((recipe) => recipe.id === updated.id ? updated : recipe));
  };

  const handleUpdateSession = (updated: BrewSession) => {
    setBrewSessions((previous) => previous.map((session) => session.id === updated.id ? updated : session));
    setActiveSessionId(updated.id);
  };

  const handleCreateNewRecipe = () => {
    const recipe: BeerRecipe = {
      id: `democrata-${Date.now()}`,
      name: `Nova receita ${recipes.length + 1}`,
      tagline: 'Defina o objetivo sensorial desta cerveja.',
      brewer: 'Cervejeiro Democrata',
      style: BJCP_STYLES[0],
      batchSizeLiters: 20,
      boilTimeMinutes: 60,
      efficiencyPercent: 72,
      grains: [{ id: `grain-${Date.now()}`, name: 'Malte Pilsen Alemão Premium (Weyermann)', amountKg: 4.5, potentialSg: 1.038, ebc: 3, type: 'Base' }],
      hops: [{ id: `hop-${Date.now()}`, name: 'Magnum', amountGrams: 15, alphaAcids: 14, timeMinutes: 60, use: 'Boil', form: 'Pellet' }],
      yeast: YEAST_DATABASE[0],
      mashSchedule: [
        { id: `mash-${Date.now()}`, name: 'Mostura principal', tempCelsius: 66, durationMinutes: 60, type: 'Infusion', description: 'Conversão principal dos açúcares.' },
        { id: `mashout-${Date.now()}`, name: 'Mash out', tempCelsius: 76, durationMinutes: 10, type: 'Mash Out', description: 'Elevar a temperatura antes da lavagem.' },
      ],
      waterTarget: { id: 'v4-balanced', name: 'Equilibrado / Versátil', calcium: 60, magnesium: 10, sodium: 15, chloride: 65, sulfate: 65, bicarbonate: 40 },
      waterSalts: { gypsumGrams: 2.5, calciumChlorideGrams: 2.5, epsomSaltGrams: 1, tableSaltGrams: 0, bakingSodaGrams: 0, lacticAcid88Ml: 1.5 },
      fermentationStages: [
        { name: 'Fermentação principal', tempCelsius: 19, durationDays: 7, description: 'Acompanhar atividade e densidade sem perseguir um prazo exato.' },
        { name: 'Finalização', tempCelsius: 21, durationDays: 3, description: 'Confirmar estabilidade antes de resfriar ou embalar.' },
      ],
      notes: '',
      createdAt: isoDate(),
    };

    setRecipes((previous) => [recipe, ...previous]);
    setActiveRecipeId(recipe.id);
    setActiveTab('architect');
    triggerRecipeCreationSpark();
  };

  const handleCloneRecipe = (sourceRecipeId = currentRecipe.id) => {
    const source = recipes.find((recipe) => recipe.id === sourceRecipeId) || currentRecipe;
    const previousSession = [...brewSessions]
      .filter((session) => session.recipeId === source.id)
      .sort((a, b) => (b.updatedAt || b.brewedAt).localeCompare(a.updatedAt || a.brewedAt))[0];
    const clone: BeerRecipe = {
      ...source,
      id: `democrata-repeat-${Date.now()}`,
      name: `${source.name} · nova versão`,
      grains: source.grains.map((grain) => ({ ...grain, id: `${grain.id}-${Date.now()}` })),
      hops: source.hops.map((hop) => ({ ...hop, id: `${hop.id}-${Date.now()}` })),
      mashSchedule: source.mashSchedule.map((step) => ({ ...step, id: `${step.id}-${Date.now()}` })),
      fermentationStages: source.fermentationStages.map((stage) => ({ ...stage })),
      waterSalts: { ...source.waterSalts },
      notes: previousSession?.notes ? `${source.notes ? `${source.notes}\n\n` : ''}Referência do último lote: ${previousSession.notes}` : source.notes,
      createdAt: isoDate(),
    };
    setRecipes((previous) => [clone, ...previous]);
    setActiveRecipeId(clone.id);
    setActiveTab('architect');
    triggerRecipeCreationSpark();
  };

  const handleBatchScale = (newSize: number) => handleUpdateRecipe(scaleRecipeBatchSize(currentRecipe, newSize));

  const handleApplyAIRecipe = (recipe: BeerRecipe) => {
    setRecipes((previous) => [recipe, ...previous]);
    setActiveRecipeId(recipe.id);
    setActiveTab('architect');
    triggerRecipeCreationSpark();
  };

  const createBrewSession = () => {
    const existing = [...brewSessions]
      .filter((session) => session.recipeId === currentRecipe.id && (session.status === 'planned' || session.status === 'brewing'))
      .sort((a, b) => (b.updatedAt || b.brewedAt).localeCompare(a.updatedAt || a.brewedAt))[0];
    if (existing) {
      setActiveSessionId(existing.id);
      return existing.id;
    }

    const session: BrewSession = {
      id: `brew-${Date.now()}`,
      recipeId: currentRecipe.id,
      recipeName: currentRecipe.name,
      brewedAt: isoDate(),
      updatedAt: new Date().toISOString(),
      status: 'brewing',
      currentStepIndex: 0,
      planned: {
        originalGravity: calculations.og,
        finalGravity: calculations.fg,
        abv: calculations.abv,
        ibu: calculations.ibu,
        srm: calculations.srm,
        efficiencyPercent: currentRecipe.efficiencyPercent,
        batchSizeLiters: currentRecipe.batchSizeLiters,
        styleCode: currentRecipe.style.code,
        styleName: currentRecipe.style.name,
      },
      actuals: {},
      readings: [],
      fermentationReadings: [],
      notes: '',
    };
    setBrewSessions((previous) => [session, ...previous]);
    setActiveSessionId(session.id);
    return session.id;
  };

  const handleStartBrewday = () => {
    createBrewSession();
    setActiveTab('cockpit');
  };

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
  };

  if (!isUnlocked) return <PrivateGate onUnlock={() => setIsUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
      <AppShell
        currentRecipe={currentRecipe}
        allRecipes={recipes}
        onSelectRecipe={setActiveRecipeId}
        onNewRecipe={handleCreateNewRecipe}
        onCloneRecipe={() => handleCloneRecipe()}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAIForge={() => setIsAIForgeOpen(true)}
        onOpenCalculators={() => handleOpenCalculators('yeast')}
        onBatchSizeScale={handleBatchScale}
      >
        {activeTab === 'home' && (
          <BrewDeskHome
            currentRecipe={currentRecipe}
            recipes={recipes}
            brewSessions={brewSessions}
            calculations={calculations}
            onSelectRecipe={setActiveRecipeId}
            onOpenRecipe={() => setActiveTab('architect')}
            onStartBrewday={handleStartBrewday}
            onNewRecipe={handleCreateNewRecipe}
            onRepeatRecipe={handleCloneRecipe}
          />
        )}

        {activeTab === 'architect' && (
          <RecipeForgeV4
            recipe={currentRecipe}
            calculations={calculations}
            styles={allStyles}
            onChange={handleUpdateRecipe}
            onOpenStyleAtlas={() => setActiveTab('styles')}
            onOpenWaterStudio={() => setActiveTab('water')}
            onStartBrewday={handleStartBrewday}
          />
        )}

        {activeTab === 'styles' && (
          <BJCPAtlasV4
            styles={allStyles}
            recipes={recipes}
            currentStyleId={currentRecipe.style.id}
            onUseStyle={(style) => { handleUpdateRecipe({ ...currentRecipe, style }); setActiveTab('architect'); }}
            onOpenRecipe={(recipeId) => { setActiveRecipeId(recipeId); setActiveTab('architect'); }}
          />
        )}

        {activeTab === 'cockpit' && (
          <BrewdayV4
            recipe={currentRecipe}
            calculations={calculations}
            session={currentSession}
            onStartSession={createBrewSession}
            onUpdateSession={handleUpdateSession}
            onExit={() => setActiveTab('architect')}
            onOpenFermentation={() => setActiveTab('fermentation')}
          />
        )}

        {activeTab === 'fermentation' && (
          <FermentationHistoryV4
            sessions={brewSessions}
            recipes={recipes}
            activeRecipeId={currentRecipe.id}
            onUpdateSession={handleUpdateSession}
            onRepeatRecipe={handleCloneRecipe}
            onSelectRecipe={(recipeId) => { setActiveRecipeId(recipeId); setActiveTab('architect'); }}
          />
        )}

        {activeTab === 'water' && (
          <WaterStudioV4
            recipe={currentRecipe}
            calculations={calculations}
            session={currentSession}
            onChange={handleUpdateRecipe}
            onUpdateSession={handleUpdateSession}
          />
        )}

        {activeTab === 'diagnostic' && <DiagnosticsV4 recipe={currentRecipe} />}
        {activeTab === 'labels' && <LabelStudio recipe={currentRecipe} calculations={calculations} />}
        {activeTab === 'sheet' && <BrewSheetPrint recipe={currentRecipe} calculations={calculations} />}
      </AppShell>

      <AIFudgeModal
        isOpen={isAIForgeOpen}
        onClose={() => setIsAIForgeOpen(false)}
        currentRecipe={currentRecipe}
        calculations={calculations}
        onApplyRecipe={handleApplyAIRecipe}
      />

      <ToolsCalculatorModal
        isOpen={isCalculatorsOpen}
        onClose={() => setIsCalculatorsOpen(false)}
        initialTab={calculatorInitialTab}
        recipe={currentRecipe}
        calculations={calculations}
      />
    </div>
  );
};

export default App;
