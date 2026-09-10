import { BeerRecipe, RecipeCalculations, GrainBillItem, HopAddition } from '../types/brewing';
import { BJCP_STYLES, GRAINS_DATABASE, HOPS_DATABASE, YEAST_DATABASE, WATER_PROFILES } from '../data/ingredients';

interface GenerateParams {
  prompt?: string;
  styleName: string;
  targetAbv: number;
  targetIbu: number;
  batchSize: number;
  specialIngredients?: string;
}

export function generateCraftRecipeLocally(params: GenerateParams): BeerRecipe {
  const { prompt = '', styleName, targetAbv = 6.5, targetIbu = 45, batchSize = 20, specialIngredients = '' } = params;

  // Find closest matching BJCP style
  const style = BJCP_STYLES.find(
    s => s.name.toLowerCase().includes(styleName.toLowerCase()) || 
         styleName.toLowerCase().includes(s.name.toLowerCase()) ||
         s.category.toLowerCase().includes(styleName.toLowerCase())
  ) || BJCP_STYLES[1]; // default to Hazy IPA

  // Calculate grain amount based on target ABV and batch size
  const totalGrainKg = Math.max(3.5, Number(((batchSize * targetAbv * 0.042)).toFixed(2)));

  // Determine grain bill according to style
  let grains: GrainBillItem[] = [];
  const pilsenOrPale = GRAINS_DATABASE[0];
  const munich = GRAINS_DATABASE[3];
  const carapils = GRAINS_DATABASE[11];
  const oats = GRAINS_DATABASE[7];
  const roasted = GRAINS_DATABASE[18];

  if (style.category.includes('IPA') || style.name.includes('IPA')) {
    grains = [
      { id: `g-${Date.now()}-1`, name: pilsenOrPale.name, potentialSg: pilsenOrPale.potentialSg, ebc: pilsenOrPale.ebc, type: pilsenOrPale.type, amountKg: Number((totalGrainKg * 0.70).toFixed(2)) },
      { id: `g-${Date.now()}-2`, name: oats.name, potentialSg: oats.potentialSg, ebc: oats.ebc, type: oats.type, amountKg: Number((totalGrainKg * 0.20).toFixed(2)) },
      { id: `g-${Date.now()}-3`, name: carapils.name, potentialSg: carapils.potentialSg, ebc: carapils.ebc, type: carapils.type, amountKg: Number((totalGrainKg * 0.10).toFixed(2)) },
    ];
  } else if (style.category.includes('Stout') || style.category.includes('Porter') || style.srmMin >= 25) {
    grains = [
      { id: `g-${Date.now()}-1`, name: pilsenOrPale.name, potentialSg: pilsenOrPale.potentialSg, ebc: pilsenOrPale.ebc, type: pilsenOrPale.type, amountKg: Number((totalGrainKg * 0.70).toFixed(2)) },
      { id: `g-${Date.now()}-2`, name: munich.name, potentialSg: munich.potentialSg, ebc: munich.ebc, type: munich.type, amountKg: Number((totalGrainKg * 0.15).toFixed(2)) },
      { id: `g-${Date.now()}-3`, name: carapils.name, potentialSg: carapils.potentialSg, ebc: carapils.ebc, type: carapils.type, amountKg: Number((totalGrainKg * 0.05).toFixed(2)) },
      { id: `g-${Date.now()}-4`, name: roasted.name, potentialSg: roasted.potentialSg, ebc: roasted.ebc, type: roasted.type, amountKg: Number((totalGrainKg * 0.10).toFixed(2)) },
    ];
  } else {
    grains = [
      { id: `g-${Date.now()}-1`, name: pilsenOrPale.name, potentialSg: pilsenOrPale.potentialSg, ebc: pilsenOrPale.ebc, type: pilsenOrPale.type, amountKg: Number((totalGrainKg * 0.85).toFixed(2)) },
      { id: `g-${Date.now()}-2`, name: munich.name, potentialSg: munich.potentialSg, ebc: munich.ebc, type: munich.type, amountKg: Number((totalGrainKg * 0.10).toFixed(2)) },
      { id: `g-${Date.now()}-3`, name: carapils.name, potentialSg: carapils.potentialSg, ebc: carapils.ebc, type: carapils.type, amountKg: Number((totalGrainKg * 0.05).toFixed(2)) },
    ];
  }

  // Select Hops
  let hops: HopAddition[] = [];
  const citra = HOPS_DATABASE.find(h => h.name === 'Citra') || HOPS_DATABASE[0];
  const mosaic = HOPS_DATABASE.find(h => h.name === 'Mosaic') || HOPS_DATABASE[1] || HOPS_DATABASE[0];
  const galaxy = HOPS_DATABASE.find(h => h.name === 'Galaxy') || HOPS_DATABASE[2] || HOPS_DATABASE[0];
  const magnum = HOPS_DATABASE.find(h => h.name === 'Magnum') || HOPS_DATABASE[0];
  const saaz = HOPS_DATABASE.find(h => h.name.includes('Saaz')) || HOPS_DATABASE[0];

  const hopScale = batchSize / 20;

  if (style.category.includes('IPA') || style.name.includes('IPA')) {
    hops = [
      { id: `h-${Date.now()}-1`, name: magnum.name, alphaAcids: magnum.alphaAcids, form: 'Pellet', use: 'Boil', timeMinutes: 60, amountGrams: Math.round(15 * hopScale) },
      { id: `h-${Date.now()}-2`, name: citra.name, alphaAcids: citra.alphaAcids, form: 'Pellet', use: 'Whirlpool', timeMinutes: 20, tempCelsius: 82, amountGrams: Math.round(50 * hopScale) },
      { id: `h-${Date.now()}-3`, name: mosaic.name, alphaAcids: mosaic.alphaAcids, form: 'Pellet', use: 'Whirlpool', timeMinutes: 20, tempCelsius: 82, amountGrams: Math.round(50 * hopScale) },
      { id: `h-${Date.now()}-4`, name: galaxy.name, alphaAcids: galaxy.alphaAcids, form: 'Pellet', use: 'Dry Hop', timeMinutes: 3, tempCelsius: 16, amountGrams: Math.round(70 * hopScale) },
    ];
  } else if (style.category.includes('Lager') || style.category.includes('Pilsner')) {
    hops = [
      { id: `h-${Date.now()}-1`, name: saaz.name, alphaAcids: saaz.alphaAcids, form: 'Pellet', use: 'Boil', timeMinutes: 60, amountGrams: Math.round(35 * hopScale) },
      { id: `h-${Date.now()}-2`, name: saaz.name, alphaAcids: saaz.alphaAcids, form: 'Pellet', use: 'Boil', timeMinutes: 15, amountGrams: Math.round(25 * hopScale) },
      { id: `h-${Date.now()}-3`, name: saaz.name, alphaAcids: saaz.alphaAcids, form: 'Pellet', use: 'Whirlpool', timeMinutes: 10, tempCelsius: 85, amountGrams: Math.round(20 * hopScale) },
    ];
  } else {
    hops = [
      { id: `h-${Date.now()}-1`, name: magnum.name, alphaAcids: magnum.alphaAcids, form: 'Pellet', use: 'Boil', timeMinutes: 60, amountGrams: Math.round(25 * hopScale) },
      { id: `h-${Date.now()}-2`, name: citra.name, alphaAcids: citra.alphaAcids, form: 'Pellet', use: 'Boil', timeMinutes: 10, amountGrams: Math.round(25 * hopScale) },
    ];
  }

  // Select Yeast
  let yeast = YEAST_DATABASE[0];
  if (style.name.includes('Hazy') || style.name.includes('New England')) {
    yeast = YEAST_DATABASE.find(y => y.id === 'verdant-ipa') || YEAST_DATABASE[1];
  } else if (style.category.includes('Lager') || style.category.includes('Pilsner')) {
    yeast = YEAST_DATABASE.find(y => y.id === 'w34-70') || YEAST_DATABASE[2];
  } else if (style.category.includes('Stout')) {
    yeast = YEAST_DATABASE.find(y => y.id === 's-04') || YEAST_DATABASE[0];
  }

  // Water Profile
  let waterProfile = WATER_PROFILES[0];
  if (style.name.includes('Hazy') || style.name.includes('New England')) {
    waterProfile = WATER_PROFILES[0];
  } else if (style.category.includes('Lager')) {
    waterProfile = WATER_PROFILES[3] || WATER_PROFILES[0];
  }

  // Generate Title
  const cleanConcept = prompt ? prompt.trim().split(' ')[0] : '';
  const recipeName = cleanConcept && cleanConcept.length > 2
    ? `Democrata ${cleanConcept.charAt(0).toUpperCase() + cleanConcept.slice(1)} ${style.name.split(' ')[0]}`
    : `Democrata Alquimia ${style.name.split(' ')[0]}`;

  return {
    id: `rec-${Date.now()}`,
    name: recipeName,
    tagline: prompt ? `Criação Alquímica: ${prompt}` : `Forjada sob medida para o caldeirão de ${batchSize}L`,
    style,
    batchSizeLiters: batchSize,
    boilTimeMinutes: 60,
    efficiencyPercent: 72,
    brewer: 'Democrata Brewmaster',
    grains,
    hops,
    yeast,
    waterTarget: waterProfile,
    waterSalts: {
      gypsumGrams: waterProfile.sulfate > 120 ? 8 : 4,
      calciumChlorideGrams: waterProfile.chloride > 120 ? 9 : 4,
      epsomSaltGrams: 3,
      tableSaltGrams: 0,
      bakingSodaGrams: 0,
      lacticAcid88Ml: 4.5,
    },
    mashSchedule: [
      { id: 'm-1', name: 'Mostura Principal (Sacarificação)', tempCelsius: 66, durationMinutes: 60, type: 'Infusion', description: 'Conversão enzimática completa e densidade sedosa' },
      { id: 'm-2', name: 'Mash Out', tempCelsius: 76, durationMinutes: 10, type: 'Mash Out', description: 'Inativação enzimática e fluidez de filtragem' },
    ],
    fermentationStages: [
      { name: 'Fermentação Primária', tempCelsius: (yeast.optimalTempMin || 18) + 1, durationDays: 7, description: 'Atenuação e formação de ésteres' },
      { name: 'Maturação / Descanso Diacetil', tempCelsius: (yeast.optimalTempMax || 22), durationDays: 3, description: 'Limpeza de off-flavors' },
      { name: 'Cold Crash & Clarificação', tempCelsius: 2, durationDays: 4, description: 'Decantação de levedura e lúpulos' },
    ],
    notes: specialIngredients ? `Ingredientes Especiais: ${specialIngredients}. ${prompt}` : `Receita calibrada para perfil ${style.flavorProfile}`,
    manifesto: 'Manifesto Democrata Bier: criação autoral com respeito ao tempo e aos insumos nobres.',
    createdAt: new Date().toISOString().split('T')[0],
  };
}

export function mutateCraftRecipeLocally(currentRecipe: BeerRecipe, goal: string): BeerRecipe {
  const mutated = JSON.parse(JSON.stringify(currentRecipe)) as BeerRecipe;
  mutated.id = `rec-mut-${Date.now()}`;
  mutated.name = `${currentRecipe.name} (Evolução)`;
  const gLower = goal.toLowerCase();

  if (gLower.includes('amarg') || gLower.includes('ibu') || gLower.includes('lupul')) {
    mutated.hops = mutated.hops.map(h => ({
      ...h,
      amountGrams: Math.round(h.amountGrams * 1.35),
    }));
    mutated.tagline = `${mutated.tagline} • Saturação Lupulada Amplificada`;
  } else if (gLower.includes('alco') || gLower.includes('abv') || gLower.includes('forte')) {
    mutated.grains = mutated.grains.map(g => ({
      ...g,
      amountKg: Number((g.amountKg * 1.25).toFixed(2)),
    }));
    mutated.tagline = `${mutated.tagline} • Potência Alcoólica Elevada`;
  } else if (gLower.includes('corpo') || gLower.includes('cremos') || gLower.includes('avelud')) {
    const oatIndex = mutated.grains.findIndex(g => g.name.toLowerCase().includes('aveia') || g.name.toLowerCase().includes('trigo'));
    if (oatIndex >= 0) {
      mutated.grains[oatIndex].amountKg = Number((mutated.grains[oatIndex].amountKg * 1.5).toFixed(2));
    } else {
      mutated.grains.push({
        id: `g-mut-${Date.now()}`,
        name: 'Aveia Flocada (Flaked Oats)',
        type: 'Adjunct',
        ebc: 2.0,
        potentialSg: 1.033,
        amountKg: 0.8,
      });
    }
    mutated.tagline = `${mutated.tagline} • Perfil Aveludado & Sedoso`;
  } else {
    mutated.hops = mutated.hops.map(h => ({
      ...h,
      amountGrams: Math.round(h.amountGrams * 1.15),
    }));
  }

  mutated.notes = `${mutated.notes ? mutated.notes + ' | ' : ''}Calibragem aplicada: ${goal}`;
  return mutated;
}

export function generateSensoryAnalysisLocally(recipe?: Partial<BeerRecipe> | null, calculations?: Partial<RecipeCalculations> | null) {
  const safeHops = recipe?.hops || [];
  const safeGrains = recipe?.grains || [];
  const hopNames = safeHops.map(h => h.name).filter(Boolean).join(', ') || 'Lúpulos nobres selecionados';
  const grainNames = safeGrains.map(g => g.name).filter(Boolean).join(', ') || 'Maltes especiais';

  const ibu = Number(calculations?.ibu) || 35;
  const fg = Number(calculations?.fg) || 1.012;
  const og = Number(calculations?.og) || 1.055;
  const abv = Number(calculations?.abv) || 5.5;
  const totalHopsGrams = Number(calculations?.totalHopsGrams) || 50;
  const buGu = Number(calculations?.buGu) || (og > 1 ? Number((ibu / ((og - 1) * 1000)).toFixed(2)) : 0.65);

  const styleCode = recipe?.style?.code || recipe?.style?.id || 'BJCP';
  const styleName = recipe?.style?.name || 'Estilo Artesanal';
  const yeastName = recipe?.yeast?.name || 'Levedura Cervejeira';

  const bitternessScore = Math.min(10, Math.max(1, Math.round(ibu / 10)));
  const sweetnessScore = Math.min(10, Math.max(1, Math.round((fg - 1.0) * 200)));
  const aromaScore = Math.min(10, Math.max(1, Math.round(totalHopsGrams / 20)));
  const bodyScore = Math.min(10, Math.max(1, Math.round((abv * 0.8) + (fg - 1.0) * 150)));

  return {
    masterVerdict: `Receita com aderência exemplar ao guia BJCP (${styleCode} - ${styleName}). A relação BU/GU calculada em ${buGu.toFixed(2)} e atenuação média da ${yeastName} entregam equilíbrio cirúrgico entre sustentação de malte (${grainNames}) e expressão de óleos essenciais de ${hopNames}.`,
    flavorRadar: {
      amargor: bitternessScore,
      aroma_lupulo: aromaScore,
      corpo: bodyScore,
      dulcor: sweetnessScore,
      citrico: Math.min(10, Math.max(2, aromaScore - 1)),
      resinoso: Math.min(10, Math.max(1, Math.round(bitternessScore * 0.8))),
      malte: Math.min(10, Math.max(3, Math.round(bodyScore * 0.9))),
      final_seco: Math.min(10, Math.max(2, 11 - sweetnessScore)),
    },
    hopOilSynergy: `A combinação de ${hopNames} atinge um pico favorável de Mirceno e Humuleno, potencializada pela biotransformação da cepa ${yeastName}. O whirlpool a 80°C preserva monoterpenos voláteis sem isomerização excessiva.`,
    waterProfileReview: `Relação Sulfato/Cloreto calibrada para realçar a sensação na boca. O pH estimado na mostura entre 5.2 e 5.4 otimiza a atividade da beta-amilase e a clarificação final do mosto.`,
    brewingTips: [
      `Ferver vigorosamente sem tampa por ${recipe?.boilTimeMinutes || 60} minutos para volatilização completa de DMS.`,
      `Girar o redemoinho (whirlpool) e aguardar 15 minutos de decantação antes de iniciar o resfriamento.`,
      `Elevar a temperatura do fermentador em 2°C nos últimos 3 dias para descanso completo de diacetil.`,
      `Armazenar as garrafas ou barril a 0°C-2°C após a maturação para precipitação de leveduras e máxima limpidez.`,
    ],
    aroma: `Intensa presença aromática de ${hopNames}, com notas florais, cítricas e suporte equilibrado de malte (${styleName}).`,
    flavor: `Entrada macia com equilíbrio perfeito entre o dulçor residual dos maltes (${grainNames}) e o amargor limpo de ${ibu} IBU. Final prazeroso e limpo.`,
    mouthfeel: `Corpo ${abv > 7 ? 'médio-alto e aveludado' : 'médio e refrescante'}, carbonatação viva com excelente sensação de preenchimento de boca.`,
    pairings: [
      'Hambúrguer artesanal com queijo cheddar maturado',
      'Carnes grelhadas na brasa ou costela defumada',
      'Queijos de média cura ou petiscos de boteco nobre',
    ],
    technicalVerdict: `Receita com aderência exemplar ao guia BJCP (${styleCode} - ${styleName}). Relação BU/GU calculada em ${buGu.toFixed(2)}, garantindo harmonia no copo.`,
  };
}
