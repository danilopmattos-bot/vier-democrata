import React, { useState, useEffect, useMemo } from 'react';
import { BeerRecipe } from './types/brewing';
import { SIGNATURE_RECIPES, BJCP_STYLES, YEAST_DATABASE } from './data/ingredients';
import { calculateAllMetrics, scaleRecipeBatchSize } from './utils/brewingCalculations';
import { AppShell, AppTab } from './components/AppShell';
import { BrewDeskHome } from './components/BrewDeskHome';
import { HomebrewBanner } from './components/HomebrewBanner';
import { VisualBeerGlass } from './components/VisualBeerGlass';
import { BJCPRadarBar } from './components/BJCPRadarBar';
import { GrainBillEditor } from './components/GrainBillEditor';
import { HopScheduleEditor } from './components/HopScheduleEditor';
import { YeastAndFermentationEditor } from './components/YeastAndFermentationEditor';
import { MashStrikeCalculator } from './components/MashStrikeCalculator';
import { WaterLab } from './components/WaterLab';
import { BrewdayCockpit } from './components/BrewdayCockpit';
import { OffFlavorMatrix } from './components/OffFlavorMatrix';
import { LabelStudio } from './components/LabelStudio';
import { BrewSheetPrint } from './components/BrewSheetPrint';
import { AIFudgeModal } from './components/AIFudgeModal';
import { ToolsCalculatorModal } from './components/ToolsCalculatorModal';
import { CustomStyleModal } from './components/CustomStyleModal';
import { StyleSelectorModal } from './components/StyleSelectorModal';
import { PrivateGate } from './components/PrivateGate';
import { triggerRecipeCreationSpark } from './utils/dopamineEffects';
import { Sparkles } from 'lucide-react';
import { BJCPStyle } from './types/brewing';
import { loadBrewSessions, loadRecipes, readStoredArray, STORAGE_KEYS } from './utils/localStorage';

export const App: React.FC = () => {
  // Gate check
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('democrata_lab_unlocked_session') === 'true';
  });

  // Load saved custom styles
  const [customStyles, setCustomStyles] = useState<BJCPStyle[]>(() => {
    return readStoredArray<BJCPStyle>(STORAGE_KEYS.customStyles, []);
  });

  // Combine default BJCP styles with user's custom styles
  const allStyles = useMemo(() => {
    return [...customStyles, ...BJCP_STYLES];
  }, [customStyles]);

  // Load recipes from LocalStorage or fall back to SIGNATURE_RECIPES
  const [recipes, setRecipes] = useState<BeerRecipe[]>(() => {
    return loadRecipes(SIGNATURE_RECIPES);
  });

  // Read-only in Phase 1: later phases will create and update brew sessions.
  const [brewSessions] = useState(loadBrewSessions);

  const [activeRecipeId, setActiveRecipeId] = useState<string>(recipes[0]?.id || SIGNATURE_RECIPES[0].id);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Modals
  const [isAIForgeOpen, setIsAIForgeOpen] = useState(false);
  const [isCalculatorsOpen, setIsCalculatorsOpen] = useState(false);
  const [calculatorInitialTab, setCalculatorInitialTab] = useState<'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast'>('yeast');
  const [isCustomStyleModalOpen, setIsCustomStyleModalOpen] = useState(false);
  const [isStyleExplorerOpen, setIsStyleExplorerOpen] = useState(false);

  const handleOpenCalculators = (tab?: 'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast') => {
    setCalculatorInitialTab(tab || 'yeast');
    setIsCalculatorsOpen(true);
  };

  // Active Recipe Object
  const currentRecipe = useMemo(() => {
    return recipes.find((r) => r.id === activeRecipeId) || recipes[0];
  }, [recipes, activeRecipeId]);

  // Real-time Brewing Math Engine Calculations
  const calculations = useMemo(() => {
    return calculateAllMetrics(currentRecipe);
  }, [currentRecipe]);

  // Persist recipes to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(recipes));
  }, [recipes]);

  // Recipe Update Handlers
  const handleUpdateRecipe = (updated: BeerRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCreateNewRecipe = () => {
    const newRecipe: BeerRecipe = {
      id: `democrata-custom-${Date.now()}`,
      name: 'Democrata Autoral # ' + (recipes.length + 1),
      tagline: 'Cerveja Artesanal Feita em Casa',
      style: BJCP_STYLES[0],
      batchSizeLiters: 20,
      efficiencyPercent: 72,
      boilTimeMinutes: 60,
      grains: [
        {
          id: 'g-1',
          name: 'Malte Pilsen Agrária / Weyermann',
          amountKg: 4.5,
          potentialSg: 1.037,
          ebc: 3.5,
          type: 'Base',
        },
      ],
      hops: [
        {
          id: 'h-1',
          name: 'Magnum',
          amountGrams: 15,
          alphaAcids: 14.0,
          timeMinutes: 60,
          use: 'Boil',
          form: 'Pellet',
        },
        {
          id: 'h-2',
          name: 'Citra',
          amountGrams: 30,
          alphaAcids: 13.0,
          timeMinutes: 10,
          use: 'Boil',
          form: 'Pellet',
        },
      ],
      yeast: YEAST_DATABASE[0],
      mashSchedule: [
        {
          id: 'm-1',
          name: 'Sacarificação Geral (Mostura)',
          tempCelsius: 66,
          durationMinutes: 60,
          type: 'Infusion',
          description: 'Conversão balanceada de açúcares na panela',
        },
        {
          id: 'm-2',
          name: 'Mash Out (Inativação)',
          tempCelsius: 76,
          durationMinutes: 10,
          type: 'Mash Out',
          description: 'Fluidez do mosto para lavagem dos grãos',
        },
      ],
      waterTarget: {
        id: 'wp-balanced',
        name: 'Equilibrado / Versátil',
        calcium: 60,
        magnesium: 10,
        sodium: 15,
        chloride: 65,
        sulfate: 65,
        bicarbonate: 40,
      },
      waterSalts: {
        gypsumGrams: 2.5,
        calciumChlorideGrams: 2.5,
        epsomSaltGrams: 1.0,
        tableSaltGrams: 0,
        bakingSodaGrams: 0,
        lacticAcid88Ml: 1.5,
      },
      fermentationStages: [
        {
          name: 'Fermentação Primária',
          tempCelsius: 19,
          durationDays: 7,
          description: 'Atenuação vigorosa dos açúcares',
        },
        {
          name: 'Descanso de Diacetil',
          tempCelsius: 22,
          durationDays: 3,
          description: 'Reabsorção de subprodutos e limpeza sensorial',
        },
        {
          name: 'Cold Crash & Maturação',
          tempCelsius: 2,
          durationDays: 5,
          description: 'Clarificação e decantação da levedura no balde',
        },
      ],
      notes: 'Receita artesanal caseira calibrada para a Democrata Bier.',
      manifesto: 'Cerveja feita em casa com ingredientes de qualidade e paixão pelo processo.',
      brewer: 'Cervejeiro Democrata',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    setActiveRecipeId(newRecipe.id);
    triggerRecipeCreationSpark();
  };

  const handleCloneRecipe = (sourceRecipeId = currentRecipe.id) => {
    const sourceRecipe = recipes.find((recipe) => recipe.id === sourceRecipeId) || currentRecipe;
    const clone: BeerRecipe = {
      ...sourceRecipe,
      id: `democrata-clone-${Date.now()}`,
      name: `${sourceRecipe.name} (nova brassagem)`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    setRecipes((prev) => [clone, ...prev]);
    setActiveRecipeId(clone.id);
    triggerRecipeCreationSpark();
  };

  const handleBatchScale = (newSize: number) => {
    const scaled = scaleRecipeBatchSize(currentRecipe, newSize);
    handleUpdateRecipe(scaled);
  };

  const handleApplyAIRecipe = (aiRecipe: BeerRecipe) => {
    setRecipes((prev) => [aiRecipe, ...prev]);
    setActiveRecipeId(aiRecipe.id);
    triggerRecipeCreationSpark();
  };

  // Custom style save handler
  const handleSaveCustomStyle = (newStyle: BJCPStyle) => {
    // Check if it's in customStyles array
    setCustomStyles((prev) => {
      const idx = prev.findIndex((s) => s.id === newStyle.id);
      let updated: BJCPStyle[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newStyle;
      } else {
        updated = [newStyle, ...prev];
      }
      localStorage.setItem(STORAGE_KEYS.customStyles, JSON.stringify(updated));
      return updated;
    });

    // Set current recipe to use this style
    handleUpdateRecipe({
      ...currentRecipe,
      style: newStyle,
    });
  };

  // Style change handler
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'NEW_CUSTOM_STYLE') {
      setIsCustomStyleModalOpen(true);
      return;
    }

    const found = allStyles.find((s) => s.id === val);
    if (found) {
      handleUpdateRecipe({
        ...currentRecipe,
        style: found,
      });
    }
  };

  if (!isUnlocked) {
    return <PrivateGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
      <AppShell
        currentRecipe={currentRecipe}
        allRecipes={recipes}
        onSelectRecipe={setActiveRecipeId}
        onNewRecipe={handleCreateNewRecipe}
        onCloneRecipe={() => handleCloneRecipe()}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
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
            onStartBrewday={() => setActiveTab('cockpit')}
            onNewRecipe={handleCreateNewRecipe}
            onRepeatRecipe={handleCloneRecipe}
          />
        )}

        {/* Receita */}
        {activeTab === 'architect' && (
          <div className="space-y-6">
            {/* Homebrew Craft Banner */}
            <HomebrewBanner
              onOpenAIForge={() => setIsAIForgeOpen(true)}
              recipeName={currentRecipe.name}
              styleName={currentRecipe.style.name}
            />

            {/* Top Recipe Header & Telemetry Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left 3 cols: Recipe Name, Style, BJCP compliance meters */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="w-full sm:flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] uppercase font-bold tracking-widest text-amber-500">
                          Nome da Cerveja
                        </span>
                      </div>
                      <input
                        type="text"
                        value={currentRecipe.name}
                        onChange={(e) => handleUpdateRecipe({ ...currentRecipe, name: e.target.value })}
                        className="bg-transparent text-lg sm:text-2xl md:text-3xl font-black font-serif text-white focus:bg-stone-950 focus:outline-none px-2 py-1 rounded-xl w-full border border-transparent focus:border-stone-700 truncate"
                      />
                    </div>

                    {/* Style Dropdown Selector & Custom Style Action */}
                    <div className="w-full sm:w-auto sm:min-w-[280px]">
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <label className="block text-[11px] uppercase font-bold text-stone-400">
                          Estilo da cerveja
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsStyleExplorerOpen(true)}
                            className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/30 transition-all shrink-0"
                            title="Abrir o catálogo completo com busca por estilo"
                          >
                            🔍 Ver estilos
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCustomStyleModalOpen(true)}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 transition-all shrink-0"
                            title="Criar estilo próprio com nome e limites customizados"
                          >
                            <Sparkles className="w-3 h-3" />
                            {currentRecipe.style.id.startsWith('custom-') ? 'Editar' : 'Ajustar limites'}
                          </button>
                        </div>
                      </div>

                      <select
                        value={currentRecipe.style.id}
                        onChange={handleStyleChange}
                        className="w-full bg-stone-950 border border-stone-700 text-amber-300 text-xs sm:text-sm font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-inner cursor-pointer"
                      >
                        <option value="NEW_CUSTOM_STYLE">✨ + Criar Novo Estilo Personalizado...</option>
                        
                        {customStyles.length > 0 && (
                          <optgroup label="⭐ Estilos Personalizados Salvos">
                            {customStyles.map((st) => (
                              <option key={st.id} value={st.id}>
                                ⭐ {st.name} ({st.category})
                              </option>
                            ))}
                          </optgroup>
                        )}

                        <optgroup label="Guia Oficial BJCP 2021">
                          {BJCP_STYLES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.code} - {st.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Tagline & Efficiency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800 text-xs sm:text-sm">
                    <div className="sm:col-span-2">
                      <span className="text-stone-400 font-semibold block mb-0.5">Descrição / Notas de Sabor:</span>
                      <input
                        type="text"
                        value={currentRecipe.tagline || ''}
                        onChange={(e) => handleUpdateRecipe({ ...currentRecipe, tagline: e.target.value })}
                        placeholder="Ex: Refrescante, aroma cítrico de maracujá e corpo aveludado..."
                        className="w-full bg-stone-950 border border-stone-800 text-stone-200 px-3 py-2 rounded-xl focus:outline-none text-xs sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-stone-950 px-3 py-2 rounded-xl border border-stone-800">
                      <span className="text-stone-300 font-bold">Eficiência:</span>
                      <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-sm sm:text-base">
                        <input
                          type="number"
                          step="1"
                          min="50"
                          max="95"
                          value={currentRecipe.efficiencyPercent}
                          onChange={(e) =>
                            handleUpdateRecipe({
                              ...currentRecipe,
                              efficiencyPercent: parseFloat(e.target.value) || 72,
                            })
                          }
                          className="w-10 sm:w-12 bg-transparent text-right focus:outline-none"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BJCP Real-Time Compliance Radar */}
                <BJCPRadarBar style={currentRecipe.style} calculations={calculations} />
              </div>

              {/* Right 1 col: Visual Animated Beer Glass */}
              <div className="lg:col-span-1 flex flex-col justify-between">
                <VisualBeerGlass
                  srm={calculations.srm}
                  ebc={calculations.ebc}
                  abv={calculations.abv}
                  ibu={calculations.ibu}
                  name={currentRecipe.name}
                  styleName={currentRecipe.style.name}
                />
              </div>
            </div>

            {/* Grain Bill Editor */}
            <GrainBillEditor
              grains={currentRecipe.grains}
              onChange={(newGrains) => handleUpdateRecipe({ ...currentRecipe, grains: newGrains })}
              totalGrainKg={calculations.totalGrainKg}
            />

            {/* Hop Schedule Editor */}
            <HopScheduleEditor
              hops={currentRecipe.hops}
              onChange={(newHops) => handleUpdateRecipe({ ...currentRecipe, hops: newHops })}
              totalHopsGrams={calculations.totalHopsGrams}
              totalIbu={calculations.ibu}
            />

            {/* Yeast & Fermentation Schedule */}
            <YeastAndFermentationEditor
              yeast={currentRecipe.yeast}
              onYeastChange={(newYeast) => handleUpdateRecipe({ ...currentRecipe, yeast: newYeast })}
              stages={currentRecipe.fermentationStages}
              onStagesChange={(newStages) => handleUpdateRecipe({ ...currentRecipe, fermentationStages: newStages })}
              batchSizeLiters={currentRecipe.batchSizeLiters}
              og={calculations.og}
              calculations={calculations}
              onOpenCalculatorModal={() => handleOpenCalculators('yeast')}
            />

            {/* Mash & Strike Water Schedule */}
            <MashStrikeCalculator
              mashSchedule={currentRecipe.mashSchedule}
              onScheduleChange={(newMash) => handleUpdateRecipe({ ...currentRecipe, mashSchedule: newMash })}
              strikeWaterVolumeLiters={calculations.strikeWaterVolumeLiters}
              strikeWaterTempCelsius={calculations.strikeWaterTempCelsius}
              spargeWaterVolumeLiters={calculations.spargeWaterVolumeLiters}
              preBoilVolumeLiters={calculations.preBoilVolumeLiters}
              totalGrainKg={calculations.totalGrainKg}
              batchSizeLiters={currentRecipe.batchSizeLiters}
              calculations={calculations}
            />
          </div>
        )}

        {/* TAB 2: WATER CHEMISTRY LAB */}
        {activeTab === 'water' && (
          <WaterLab
            waterTarget={currentRecipe.waterTarget}
            onWaterTargetChange={(newTarget) => handleUpdateRecipe({ ...currentRecipe, waterTarget: newTarget })}
            baseWaterSource={currentRecipe.baseWaterSource}
            onBaseWaterSourceChange={(newBase) => handleUpdateRecipe({ ...currentRecipe, baseWaterSource: newBase })}
            waterSalts={currentRecipe.waterSalts}
            onSaltsChange={(newSalts) => handleUpdateRecipe({ ...currentRecipe, waterSalts: newSalts })}
            calculatedWater={{
              ...calculations.waterProfileResult,
              sulfateToChlorideRatio: calculations.sulfateToChlorideRatio,
            }}
            grains={currentRecipe.grains}
            totalWaterNeededLiters={calculations.totalWaterNeededLiters}
          />
        )}

        {/* TAB 3: BREWDAY LIVE COCKPIT */}
        {activeTab === 'cockpit' && (
          <BrewdayCockpit
            recipe={currentRecipe}
            calculations={calculations}
            onExit={() => setActiveTab('architect')}
          />
        )}

        {/* TAB 4: OFF-FLAVOR DIAGNOSTIC MATRIX & AI DOCTOR */}
        {activeTab === 'diagnostic' && <OffFlavorMatrix currentRecipe={currentRecipe} />}

        {/* TAB 5: DEMOCRATA ART & LABEL STUDIO */}
        {activeTab === 'labels' && <LabelStudio recipe={currentRecipe} calculations={calculations} />}

        {/* TAB 6: BREW SHEET PRINT / EXPORT */}
        {activeTab === 'sheet' && <BrewSheetPrint recipe={currentRecipe} calculations={calculations} />}
      </AppShell>

      {/* AI Forge Alchemist Modal */}
      <AIFudgeModal
        isOpen={isAIForgeOpen}
        onClose={() => setIsAIForgeOpen(false)}
        currentRecipe={currentRecipe}
        calculations={calculations}
        onApplyRecipe={handleApplyAIRecipe}
      />

      {/* Quick Calculators Modal */}
      <ToolsCalculatorModal
        isOpen={isCalculatorsOpen}
        onClose={() => setIsCalculatorsOpen(false)}
        initialTab={calculatorInitialTab}
        recipe={currentRecipe}
        calculations={calculations}
      />

      {/* Custom Style Creation & Editing Modal */}
      <CustomStyleModal
        isOpen={isCustomStyleModalOpen}
        onClose={() => setIsCustomStyleModalOpen(false)}
        currentStyle={currentRecipe.style}
        currentCalculations={calculations}
        onSaveStyle={handleSaveCustomStyle}
      />

      {/* BJCP 2021 Style Explorer & Search Modal */}
      <StyleSelectorModal
        isOpen={isStyleExplorerOpen}
        onClose={() => setIsStyleExplorerOpen(false)}
        styles={allStyles}
        currentStyleId={currentRecipe.style.id}
        onSelectStyle={(selectedStyle) => {
          handleUpdateRecipe({
            ...currentRecipe,
            style: selectedStyle,
          });
        }}
        onCreateCustomStyle={() => setIsCustomStyleModalOpen(true)}
      />
    </div>
  );
};

export default App;

