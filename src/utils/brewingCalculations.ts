import {
  BeerRecipe,
  BJCPStyle,
  GrainBillItem,
  HopAddition,
  MashStep,
  RecipeCalculations,
  WaterProfile,
  WaterSalts,
  YeastProfile,
} from '../types/brewing';

/**
 * EBC to SRM and SRM to EBC conversions
 */
export function ebcToSrm(ebc: number): number {
  return ebc * 0.508;
}

export function srmToEbc(srm: number): number {
  return srm * 1.97;
}

/**
 * SRM color hex code palette based on Morey color spectrum
 */
export function srmToHex(srm: number): string {
  const rounded = Math.min(Math.max(Math.round(srm), 1), 40);
  const colorMap: Record<number, string> = {
    1: '#F8F753',
    2: '#F6F512',
    3: '#ECE61A',
    4: '#D5BC26',
    5: '#BF923B',
    6: '#BF813A',
    7: '#BC673B',
    8: '#8D4C32',
    9: '#5D341A',
    10: '#472714',
    11: '#361D0F',
    12: '#28150B',
    13: '#1E1008',
    14: '#180D06',
    15: '#140B05',
    16: '#100904',
    17: '#0E0803',
    18: '#0C0703',
    19: '#0A0602',
    20: '#090502',
    21: '#080502',
    22: '#070402',
    23: '#060401',
    24: '#060301',
    25: '#050301',
    26: '#050201',
    27: '#040201',
    28: '#040201',
    29: '#030201',
    30: '#030101',
    31: '#030101',
    32: '#020100',
    33: '#020100',
    34: '#020100',
    35: '#020100',
    36: '#010000',
    37: '#010000',
    38: '#010000',
    39: '#010000',
    40: '#000000',
  };

  // Fine tuned color interpolation for smooth gradients
  if (srm <= 2) return '#FFE65A';
  if (srm <= 3) return '#FCD044';
  if (srm <= 4) return '#F6B626';
  if (srm <= 6) return '#EA8F0E';
  if (srm <= 8) return '#C55F07';
  if (srm <= 10) return '#9A3A05';
  if (srm <= 13) return '#742103';
  if (srm <= 17) return '#4E0E04';
  if (srm <= 22) return '#340605';
  if (srm <= 28) return '#200305';
  if (srm <= 35) return '#120205';
  return colorMap[rounded] || '#090103';
}

/**
 * Calculates Original Gravity (OG) based on grain bill, efficiency, and batch volume
 */
export function calculateOG(
  grains: GrainBillItem[],
  batchSizeLiters: number,
  efficiencyPercent: number
): number {
  if (batchSizeLiters <= 0 || grains.length === 0) return 1.050;

  const batchSizeGallons = batchSizeLiters * 0.264172;
  let totalGravityPoints = 0;

  for (const grain of grains) {
    const weightLbs = grain.amountKg * 2.20462;
    // potentialSg: e.g. 1.037 -> 37 points
    const ppg = (grain.potentialSg - 1.0) * 1000;
    // If roasted/specialty steeped or mashed
    const eff = grain.type === 'Roasted' || grain.type === 'Caramel/Crystal'
      ? Math.max(efficiencyPercent, 70) / 100
      : efficiencyPercent / 100;

    totalGravityPoints += (weightLbs * ppg * eff);
  }

  const ogPoints = totalGravityPoints / batchSizeGallons;
  const og = 1 + ogPoints / 1000;
  return Number(og.toFixed(3));
}

/**
 * Returns the effective saccharification temperature from mash schedule or fallback
 */
export function getEffectiveSaccharificationTemp(mashSchedule?: MashStep[] | number): number {
  if (typeof mashSchedule === 'number' && !isNaN(mashSchedule) && mashSchedule > 0) {
    return mashSchedule;
  }
  if (Array.isArray(mashSchedule) && mashSchedule.length > 0) {
    // 1. Find step explicitly containing sacarificação / mostura / beta / alfa keywords
    const keywordStep = mashSchedule.find((s) => {
      const lower = (s.name || '').toLowerCase();
      return (
        lower.includes('sacari') ||
        lower.includes('beta') ||
        lower.includes('alfa') ||
        lower.includes('mostura') ||
        lower.includes('convers')
      ) && s.tempCelsius >= 55 && s.tempCelsius <= 74;
    });
    if (keywordStep) return keywordStep.tempCelsius;

    // 2. Find step in standard saccharification range (60°C - 73°C) with highest duration
    const saccSteps = mashSchedule.filter((s) => s.tempCelsius >= 60 && s.tempCelsius <= 73);
    if (saccSteps.length > 0) {
      const longest = saccSteps.reduce((prev, curr) => (curr.durationMinutes > prev.durationMinutes ? curr : prev), saccSteps[0]);
      return longest.tempCelsius;
    }

    // 3. Fallback to first step if reasonable
    if (mashSchedule[0]?.tempCelsius && mashSchedule[0].tempCelsius > 0) {
      return mashSchedule[0].tempCelsius;
    }
  }
  return 66.0;
}

/**
 * Analyzes the enzymatic profile based on mash temperature (Beta-Amylase vs Alpha-Amylase)
 */
export function getMashFermentabilityProfile(mashTempCelsius: number): {
  profile: 'very_high' | 'high' | 'balanced' | 'dextrinous' | 'low';
  title: string;
  description: string;
  attenuationModifier: number; // e.g. +3.5 or -4.0 %
} {
  const temp = Number(mashTempCelsius) || 66;

  if (temp < 63) {
    // Very low temp - high maltose but slower enzymatic conversion
    const mod = 4.0;
    return {
      profile: 'very_high',
      title: 'Hiper-Atenuado (Beta-Amilase Extrema)',
      description: 'Gera quase exclusivamente maltose. Produz cervejas ultra secas (Brut, Saison, Light Lager), corpo muito leve e FG mínima.',
      attenuationModifier: mod,
    };
  } else if (temp <= 65) {
    // Peak Beta-Amylase (63-65°C)
    const mod = Number(((66.5 - temp) * 1.5).toFixed(1));
    return {
      profile: 'high',
      title: 'Alta Fermentabilidade (Beta-Amilase Ativa)',
      description: 'Atividade máxima de beta-amilase. Mosto rico em maltose simples, excelente digestibilidade pela levedura, final seco e limpo.',
      attenuationModifier: mod,
    };
  } else if (temp <= 67.5) {
    // Balanced Infusion (65.5 - 67.5°C)
    const mod = Number(((66.5 - temp) * 1.2).toFixed(1));
    return {
      profile: 'balanced',
      title: 'Equilíbrio Nobre (Beta + Alfa-Amilase)',
      description: 'Ponto ideal de infusão clássica. Combina boa formação de álcool com dextrinas suficientes para um corpo aveludado e sustentação de espuma.',
      attenuationModifier: mod,
    };
  } else if (temp <= 71) {
    // Peak Alpha-Amylase (68 - 71°C)
    const mod = Number(((66.5 - temp) * 1.6).toFixed(1));
    return {
      profile: 'dextrinous',
      title: 'Encorpado & Dextrínico (Alfa-Amilase Dominante)',
      description: 'Predomínio de alfa-amilase. Quebra aleatória do amido formando dextrinas não-fermentáveis. Resulta em FG mais alta, sensação licorosa e dulçor residual.',
      attenuationModifier: mod,
    };
  } else {
    // Mash out / Extreme (71.5°C+)
    const mod = -8.0;
    return {
      profile: 'low',
      title: 'Inativação Enzimática / Dextrinas Máximas',
      description: 'Temperatura próxima de inativação enzimática. Reduz sensivelmente a atenuação gerando corpo denso e residual doce proeminente.',
      attenuationModifier: mod,
    };
  }
}

/**
 * Calculates Final Gravity (FG) based on OG, Yeast Attenuation, and Saccharification Temperature / Mash Schedule
 */
export function calculateFG(
  og: number,
  yeast: YeastProfile,
  mashScheduleOrTemp?: MashStep[] | number
): number {
  if (og <= 1.0) return 1.000;
  const ogPoints = (og - 1.0) * 1000;
  const baseAttenuation = yeast?.attenuationAvg || 75;

  const effectiveTemp = getEffectiveSaccharificationTemp(mashScheduleOrTemp);
  const { attenuationModifier } = getMashFermentabilityProfile(effectiveTemp);

  // Effective apparent attenuation percentage
  const effectiveAttenuationPercent = Math.min(
    Math.max(baseAttenuation + attenuationModifier, 52),
    98
  );

  const attenuationFraction = effectiveAttenuationPercent / 100;
  const fgPoints = ogPoints * (1 - attenuationFraction);
  const fg = 1 + fgPoints / 1000;
  return Number(fg.toFixed(3));
}

/**
 * Calculates Alcohol By Volume (ABV) using high-precision formula
 */
export function calculateABV(og: number, fg: number): number {
  if (og <= fg) return 0;
  // Standard formula with gravity adjustment for big beers
  const abv = (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794);
  return Number(Math.max(abv, 0).toFixed(1));
}

/**
 * Calculates SRM and EBC beer color using Morey formula
 */
export function calculateColor(
  grains: GrainBillItem[],
  batchSizeLiters: number
): { srm: number; ebc: number; hex: string } {
  if (batchSizeLiters <= 0 || grains.length === 0) {
    return { srm: 5, ebc: 10, hex: srmToHex(5) };
  }

  const batchSizeGallons = batchSizeLiters * 0.264172;
  let totalMCU = 0;

  for (const grain of grains) {
    const weightLbs = grain.amountKg * 2.20462;
    // Convert EBC to Lovibond: Lovibond = (EBC * 0.375) + 0.46 or EBC / 1.97
    const lovibond = grain.ebc / 1.97;
    totalMCU += (weightLbs * lovibond) / batchSizeGallons;
  }

  // Morey Equation: SRM = 1.4922 * (MCU ^ 0.6859)
  const srm = totalMCU > 0 ? 1.4922 * Math.pow(totalMCU, 0.6859) : 2;
  const roundedSrm = Number(srm.toFixed(1));
  const ebc = Number((roundedSrm * 1.97).toFixed(1));

  return {
    srm: roundedSrm,
    ebc,
    hex: srmToHex(roundedSrm),
  };
}

/**
 * Calculates Bitterness in IBUs using Tinseth Equation
 */
export function calculateIBU(
  hops: HopAddition[],
  og: number,
  batchSizeLiters: number,
  boilTimeMinutes: number = 60
): number {
  if (batchSizeLiters <= 0 || hops.length === 0) return 0;

  // Tinseth Bigness Factor: 1.65 * 0.000125^(OG - 1)
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  let totalIbu = 0;

  for (const hop of hops) {
    if (hop.amountGrams <= 0 || hop.alphaAcids <= 0) continue;

    let time = hop.timeMinutes;
    let utilizationFactor = 1.0;

    if (hop.use === 'Dry Hop') {
      // Dry hop does not isomerize alpha acids
      continue;
    } else if (hop.use === 'First Wort') {
      // First wort hops give smooth bitterness (~10% more extraction)
      time = boilTimeMinutes + 20;
      utilizationFactor = 1.1;
    } else if (hop.use === 'Whirlpool') {
      // Whirlpool utilization based on temp (e.g., 80C gives ~50% isomerization)
      const temp = hop.tempCelsius || 80;
      const tempFactor = temp >= 90 ? 0.8 : temp >= 80 ? 0.5 : 0.2;
      time = Math.max(hop.timeMinutes, 15);
      utilizationFactor = tempFactor;
    } else if (hop.use === 'Mash') {
      utilizationFactor = 0.2;
      time = 15;
    }

    // Form multiplier: Pellets give ~10% more utilization than whole cone; Cryo ~15%
    const formFactor = hop.form === 'Cryo' ? 1.15 : hop.form === 'Pellet' ? 1.05 : 0.95;

    // Tinseth Boil Time Factor: (1 - e^(-0.04 * t)) / 4.15
    const boilTimeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
    const utilization = bignessFactor * boilTimeFactor * utilizationFactor * formFactor;

    // IBU = (Grams * AA% * Utilization * 10) / Volume_Liters
    // AA% in whole percent (e.g. 12.5) -> (Grams * (AA / 100) * Util * 1000) / Vol
    const hopIbu = (hop.amountGrams * (hop.alphaAcids / 100) * utilization * 1000) / batchSizeLiters;
    totalIbu += hopIbu;
  }

  return Number(Math.max(totalIbu, 0).toFixed(1));
}

/**
 * Calculates Strike Water temperature and volumes
 */
export function calculateWaterVolumes(
  totalGrainKg: number,
  batchSizeLiters: number,
  boilTimeMinutes: number = 60,
  targetMashTempCelsius: number = 66,
  grainTempCelsius: number = 20,
  waterToGrainRatio: number = 3.0 // L/kg
) {
  const safeRatio = Math.max(waterToGrainRatio, 1.5);
  const safeGrainKg = Math.max(totalGrainKg, 0.1);
  const safeTargetTemp = Number(targetMashTempCelsius) || 66;
  const safeGrainTemp = Number(grainTempCelsius) || 20;

  // Mash water (Strike water)
  const strikeWaterVolumeLiters = Number((safeGrainKg * safeRatio).toFixed(1));

  // Strike Water Temp formula: Tw = (0.41 / r) * (Ttarget - Tgrain) + Ttarget
  // Standard thermodynamic equation for grain & water heat capacity
  const strikeWaterTempCelsius = Number(
    ((0.41 / safeRatio) * (safeTargetTemp - safeGrainTemp) + safeTargetTemp).toFixed(1)
  );

  // Grain absorption rate: ~0.96 L per kg of grain
  const grainAbsorptionLiters = safeGrainKg * 0.96;

  // Boil-off rate: ~3.5 L per hour
  const boilOffLiters = (Math.max(boilTimeMinutes, 15) / 60) * 3.5;

  // Trub & chiller dead space: ~1.5 L
  const lossLiters = 1.5;

  // Pre-boil kettle volume needed
  const preBoilVolumeLiters = Number((batchSizeLiters + boilOffLiters + lossLiters).toFixed(1));

  // Sparge water = Pre-boil Volume - (Strike Water - Grain Absorption)
  const spargeWaterVolumeLiters = Number(
    Math.max(preBoilVolumeLiters - (strikeWaterVolumeLiters - grainAbsorptionLiters), 0).toFixed(1)
  );

  return {
    strikeWaterVolumeLiters,
    strikeWaterTempCelsius,
    spargeWaterVolumeLiters,
    preBoilVolumeLiters,
    totalWaterNeededLiters: Number((strikeWaterVolumeLiters + spargeWaterVolumeLiters).toFixed(1)),
  };
}

/**
 * Calculates water mineral ion levels after salt additions
 */
export function calculateWaterProfileResult(
  baseWater: WaterProfile,
  salts: WaterSalts,
  totalWaterLiters: number
) {
  if (totalWaterLiters <= 0) totalWaterLiters = 30;

  // Conversion factors for grams in volume (mg/L = ppm)
  // Gypsum (CaSO4.2H2O): Ca 23.3%, SO4 55.8% -> 1g in 10L = 23.3 ppm Ca, 55.8 ppm SO4
  const caFromGypsum = (salts.gypsumGrams * 233) / totalWaterLiters;
  const so4FromGypsum = (salts.gypsumGrams * 558) / totalWaterLiters;

  // Calcium Chloride (CaCl2.2H2O): Ca 27.2%, Cl 48.3%
  const caFromCaCl2 = (salts.calciumChlorideGrams * 272) / totalWaterLiters;
  const clFromCaCl2 = (salts.calciumChlorideGrams * 483) / totalWaterLiters;

  // Epsom Salt (MgSO4.7H2O): Mg 9.9%, SO4 39.0%
  const mgFromEpsom = (salts.epsomSaltGrams * 99) / totalWaterLiters;
  const so4FromEpsom = (salts.epsomSaltGrams * 390) / totalWaterLiters;

  // Table Salt (NaCl): Na 39.3%, Cl 60.7%
  const naFromNaCl = (salts.tableSaltGrams * 393) / totalWaterLiters;
  const clFromNaCl = (salts.tableSaltGrams * 607) / totalWaterLiters;

  // Baking Soda (NaHCO3): Na 27.4%, HCO3 72.6%
  const naFromBaking = (salts.bakingSodaGrams * 274) / totalWaterLiters;
  const hco3FromBaking = (salts.bakingSodaGrams * 726) / totalWaterLiters;

  const ca = Number((baseWater.calcium + caFromGypsum + caFromCaCl2).toFixed(1));
  const mg = Number((baseWater.magnesium + mgFromEpsom).toFixed(1));
  const na = Number((baseWater.sodium + naFromNaCl + naFromBaking).toFixed(1));
  const cl = Number((baseWater.chloride + clFromCaCl2 + clFromNaCl).toFixed(1));
  const so4 = Number((baseWater.sulfate + so4FromGypsum + so4FromEpsom).toFixed(1));
  const hco3 = Number((baseWater.bicarbonate + hco3FromBaking).toFixed(1));

  const sulfateToChlorideRatio = cl > 0 ? Number((so4 / cl).toFixed(2)) : 1.0;

  // Kolbach's Residual Alkalinity in ppm as CaCO3: (HCO3 * 0.82) - (Ca / 1.4 + Mg / 1.7)
  const residualAlkalinity = Number(
    ((hco3 * 0.82) - (ca / 1.4 + mg / 1.7)).toFixed(1)
  );

  return {
    ca,
    mg,
    na,
    cl,
    so4,
    hco3,
    sulfateToChlorideRatio,
    residualAlkalinity,
  };
}

/**
 * Calculates Kolbach's Residual Alkalinity (RA) in ppm as CaCO3
 */
export function calculateResidualAlkalinity(hco3: number, ca: number, mg: number): number {
  return Number(((hco3 * 0.82) - (ca / 1.4 + mg / 1.7)).toFixed(1));
}

/**
 * Calculates Campden / Potassium Metabisulfite requirements for Sanepar water dechlorination
 * (1 tablet = ~0.44g treats up to 75L)
 */
export function calculateCampdenDosage(waterLiters: number) {
  const tabletsNeeded = Number((waterLiters / 75).toFixed(2));
  const gramsNeeded = Number((waterLiters * 0.00586).toFixed(2));
  
  let tabletFraction = '1/4 de pastilha';
  if (tabletsNeeded > 0.65) tabletFraction = '1 pastilha inteira';
  else if (tabletsNeeded > 0.35) tabletFraction = '1/2 pastilha';
  else if (tabletsNeeded > 0.2) tabletFraction = '1/3 de pastilha';

  return {
    tabletsNeeded,
    tabletFraction,
    gramsNeeded,
  };
}

/**
 * Estimates Mash pH based on Grist color (EBC), Residual Alkalinity, and Lactic Acid
 */
export function estimateMashPH(
  grains: GrainBillItem[],
  residualAlkalinity: number,
  lacticAcid88Ml: number,
  totalWaterLiters: number
): {
  estimatedPh: number;
  status: 'optimal' | 'acidic' | 'alkaline';
  notes: string;
} {
  const totalGrainKg = grains.reduce((sum, g) => sum + g.amountKg, 0);
  if (totalGrainKg <= 0) {
    return { estimatedPh: 5.4, status: 'optimal', notes: 'Grist vazio' };
  }

  // Calculate weighted average grain EBC
  let totalEbcWeight = 0;
  for (const grain of grains) {
    totalEbcWeight += grain.amountKg * grain.ebc;
  }
  const avgEbc = totalEbcWeight / totalGrainKg;

  // Base DI water mash pH for grains: ~5.75 for pale (3.5 EBC) down to ~5.2 for dark/roasted
  // Approximation: pH_DI = 5.75 - (0.007 * avgEbc) - (roastedRatio * 0.3)
  const baseDiPh = Math.max(5.75 - (avgEbc * 0.0055), 5.15);

  // Residual alkalinity shift: each 50 ppm of RA shifts pH up by ~ +0.10
  const raShift = (residualAlkalinity / 50) * 0.10;

  // Lactic acid 88% neutralization: 1 mL per kg of malt reduces pH by ~0.15 - 0.20
  const acidShift = (lacticAcid88Ml / totalGrainKg) * 0.18;

  const estimatedPh = Number((baseDiPh + raShift - acidShift).toFixed(2));

  let status: 'optimal' | 'acidic' | 'alkaline' = 'optimal';
  let notes = 'pH excelente para amilases (5.2 - 5.4). Conversão e rendimento máximos.';

  if (estimatedPh < 5.15) {
    status = 'acidic';
    notes = 'pH muito baixo (< 5.2). Risco de inibição enzimática, mosto azedo ou adstringente. Reduza o ácido ou adicione bicarbonato.';
  } else if (estimatedPh > 5.55) {
    status = 'alkaline';
    notes = 'pH elevado (> 5.5). Risco de extração de taninos da casca e amargor áspero. Adicione ácido lático 88%.';
  }

  return {
    estimatedPh,
    status,
    notes,
  };
}

/**
 * Automatically calculates optimal salt additions to match a target water profile
 * from a given base water (such as Curitiba Sanepar)
 */
export function autoCalculateSaltsFromBase(
  baseWater: WaterProfile,
  targetWater: WaterProfile,
  totalWaterLiters: number
): WaterSalts {
  if (totalWaterLiters <= 0) totalWaterLiters = 25;

  // Ion Deficits (Target - Base) in ppm
  const deficitCa = Math.max(targetWater.calcium - baseWater.calcium, 0);
  const deficitMg = Math.max(targetWater.magnesium - baseWater.magnesium, 0);
  const deficitCl = Math.max(targetWater.chloride - baseWater.chloride, 0);
  const deficitSo4 = Math.max(targetWater.sulfate - baseWater.sulfate, 0);
  const deficitNa = Math.max(targetWater.sodium - baseWater.sodium, 0);
  const deficitHco3 = Math.max(targetWater.bicarbonate - baseWater.bicarbonate, 0);

  // 1. Epsom Salt (MgSO4.7H2O) to satisfy Mg deficit (99 mg Mg / g in 1L)
  // Mg needed = deficitMg * totalWaterLiters
  const epsomGrams = deficitMg > 0 ? Number(((deficitMg * totalWaterLiters) / 99).toFixed(1)) : 0;
  // SO4 provided by Epsom: 390 mg SO4 / g in 1L
  const so4FromEpsomPpm = (epsomGrams * 390) / totalWaterLiters;
  const remainingDeficitSo4 = Math.max(deficitSo4 - so4FromEpsomPpm, 0);

  // 2. Gypsum (CaSO4.2H2O) to satisfy remaining SO4 deficit (558 mg SO4 / g in 1L)
  const gypsumGrams = remainingDeficitSo4 > 0 ? Number(((remainingDeficitSo4 * totalWaterLiters) / 558).toFixed(1)) : 0;
  const caFromGypsumPpm = (gypsumGrams * 233) / totalWaterLiters;
  const remainingDeficitCa = Math.max(deficitCa - caFromGypsumPpm, 0);

  // 3. Calcium Chloride (CaCl2.2H2O) to satisfy remaining Cl deficit (483 mg Cl / g in 1L)
  // Also provides 272 mg Ca / g
  let calciumChlorideGrams = 0;
  if (deficitCl > 0) {
    calciumChlorideGrams = Number(((deficitCl * totalWaterLiters) / 483).toFixed(1));
  } else if (remainingDeficitCa > 0) {
    calciumChlorideGrams = Number(((remainingDeficitCa * totalWaterLiters) / 272).toFixed(1));
  }

  // 4. Baking Soda (NaHCO3) if HCO3 deficit is high (for dark beers / stouts)
  const bakingSodaGrams = deficitHco3 > 30 ? Number(((deficitHco3 * totalWaterLiters) / 726).toFixed(1)) : 0;

  // 5. Table Salt (NaCl) if Na deficit is still significant
  const naFromBakingPpm = (bakingSodaGrams * 274) / totalWaterLiters;
  const remainingDeficitNa = Math.max(deficitNa - naFromBakingPpm, 0);
  const tableSaltGrams = remainingDeficitNa > 10 ? Number(((remainingDeficitNa * totalWaterLiters) / 393).toFixed(1)) : 0;

  // 6. Lactic Acid 88% estimation: in Curitiba soft water, light beers need ~1.0-2.5 mL for 20L
  let lacticAcid88Ml = 0;
  if (targetWater.bicarbonate <= 50) {
    lacticAcid88Ml = Number((totalWaterLiters * 0.08).toFixed(1)); // ~2.0 mL for 25L
  }

  return {
    gypsumGrams: Math.min(gypsumGrams, 30),
    calciumChlorideGrams: Math.min(calciumChlorideGrams, 30),
    epsomSaltGrams: Math.min(epsomGrams, 15),
    tableSaltGrams: Math.min(tableSaltGrams, 10),
    bakingSodaGrams: Math.min(bakingSodaGrams, 10),
    lacticAcid88Ml: Math.min(lacticAcid88Ml, 10),
  };
}

/**
 * Validates compliance with BJCP 2021 Style range
 */
export function checkBJCPCompliance(
  style: BJCPStyle,
  og: number,
  fg: number,
  abv: number,
  ibu: number,
  srm: number
) {
  const getStatus = (val: number, min: number, max: number): 'low' | 'ok' | 'high' => {
    if (val < min) return 'low';
    if (val > max) return 'high';
    return 'ok';
  };

  const ogStatus = getStatus(og, style.ogMin, style.ogMax);
  const fgStatus = getStatus(fg, style.fgMin, style.fgMax);
  const abvStatus = getStatus(abv, style.abvMin, style.abvMax);
  const ibuStatus = getStatus(ibu, style.ibuMin, style.ibuMax);
  const srmStatus = getStatus(srm, style.srmMin, style.srmMax);

  const checks = [ogStatus, fgStatus, abvStatus, ibuStatus, srmStatus];
  const passed = checks.filter(s => s === 'ok').length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    ogStatus,
    fgStatus,
    abvStatus,
    ibuStatus,
    srmStatus,
    score,
  };
}

/**
 * Calculates complete recipe metrics in one shot
 */
export function computeRecipeCalculations(recipe: BeerRecipe): RecipeCalculations {
  const totalGrainKg = Number(
    recipe.grains.reduce((acc, g) => acc + (Number(g.amountKg) || 0), 0).toFixed(2)
  );
  const totalHopsGrams = Number(
    recipe.hops.reduce((acc, h) => acc + (Number(h.amountGrams) || 0), 0).toFixed(0)
  );

  const effectiveMashTempCelsius = getEffectiveSaccharificationTemp(recipe.mashSchedule);
  const mashFermentability = getMashFermentabilityProfile(effectiveMashTempCelsius);

  const og = calculateOG(recipe.grains, recipe.batchSizeLiters, recipe.efficiencyPercent);
  const fg = calculateFG(og, recipe.yeast, recipe.mashSchedule);
  const abv = calculateABV(og, fg);
  const color = calculateColor(recipe.grains, recipe.batchSizeLiters);
  const ibu = calculateIBU(recipe.hops, og, recipe.batchSizeLiters, recipe.boilTimeMinutes);

  const ogPoints = (og - 1.0) * 1000;
  const fgPoints = (fg - 1.0) * 1000;
  const apparentAttenuationPercent = ogPoints > 0
    ? Number((((ogPoints - fgPoints) / ogPoints) * 100).toFixed(1))
    : (recipe.yeast?.attenuationAvg || 75);

  const gravityPoints = (og - 1.0) * 1000;
  const buGu = gravityPoints > 0 ? Number((ibu / gravityPoints).toFixed(2)) : 0;

  const waterCalc = calculateWaterVolumes(
    totalGrainKg,
    recipe.batchSizeLiters,
    recipe.boilTimeMinutes,
    effectiveMashTempCelsius
  );

  const preBoilGravity = Number(
    (1 + ((og - 1) * (recipe.batchSizeLiters / Math.max(waterCalc.preBoilVolumeLiters, 1)))).toFixed(3)
  );

  const baseWater = recipe.baseWaterSource || recipe.waterTarget;
  const waterResults = calculateWaterProfileResult(
    baseWater,
    recipe.waterSalts,
    waterCalc.totalWaterNeededLiters
  );

  const estimatedMashPh = estimateMashPH(
    recipe.grains,
    waterResults.residualAlkalinity,
    recipe.waterSalts.lacticAcid88Ml || 0,
    waterCalc.totalWaterNeededLiters
  );

  const campdenDosage = calculateCampdenDosage(waterCalc.totalWaterNeededLiters);

  const bjcpCompliance = checkBJCPCompliance(
    recipe.style,
    og,
    fg,
    abv,
    ibu,
    color.srm
  );

  return {
    og,
    fg,
    abv,
    ibu,
    srm: color.srm,
    ebc: color.ebc,
    buGu,
    colorHex: color.hex,
    totalGrainKg,
    totalHopsGrams,
    strikeWaterVolumeLiters: waterCalc.strikeWaterVolumeLiters,
    strikeWaterTempCelsius: waterCalc.strikeWaterTempCelsius,
    spargeWaterVolumeLiters: waterCalc.spargeWaterVolumeLiters,
    preBoilVolumeLiters: waterCalc.preBoilVolumeLiters,
    totalWaterNeededLiters: waterCalc.totalWaterNeededLiters,
    preBoilGravity,
    apparentAttenuationPercent,
    effectiveMashTempCelsius,
    fermentabilityProfile: mashFermentability.profile,
    fermentabilityDescription: mashFermentability.description,
    sulfateToChlorideRatio: waterResults.sulfateToChlorideRatio,
    residualAlkalinity: waterResults.residualAlkalinity,
    waterProfileResult: {
      ca: waterResults.ca,
      mg: waterResults.mg,
      na: waterResults.na,
      cl: waterResults.cl,
      so4: waterResults.so4,
      hco3: waterResults.hco3,
      residualAlkalinity: waterResults.residualAlkalinity,
    },
    estimatedMashPh,
    campdenDosage,
    bjcpCompliance,
  };
}

/**
 * Refractometer alcohol correction formula (Wort Refractometer Brix to Real SG in fermented beer)
 */
export function brixToFinalGravity(originalBrix: number, finalBrix: number, wortCorrectionFactor: number = 1.04): number {
  const correctedOG = 1.000019 + (0.003865613 * (originalBrix / wortCorrectionFactor)) + (0.00001296425 * Math.pow(originalBrix / wortCorrectionFactor, 2)) + (0.00000005701128 * Math.pow(originalBrix / wortCorrectionFactor, 3));
  
  const fg = 1.001843 - (0.002318474 * (originalBrix / wortCorrectionFactor)) - (0.000007775 * Math.pow(originalBrix / wortCorrectionFactor, 2)) - (0.000000034 * Math.pow(originalBrix / wortCorrectionFactor, 3)) + (0.00574 * (finalBrix / wortCorrectionFactor)) + (0.00003344 * Math.pow(finalBrix / wortCorrectionFactor, 2)) + (0.000000086 * Math.pow(finalBrix / wortCorrectionFactor, 3));

  return Number(fg.toFixed(3));
}

/**
 * Priming Sugar Calculator
 */
export function calculatePrimingSugar(
  beerVolumeLiters: number,
  targetVolumesCO2: number,
  beerTempCelsius: number,
  sugarType: 'cane' | 'corn' | 'dme' = 'cane'
): number {
  // Dissolved CO2 in beer at temperature (approx)
  // Vol_dis = 3.0378 - (0.050062 * T_f) + (0.00026555 * T_f^2)
  const tempF = (beerTempCelsius * 9/5) + 32;
  const dissolvedCO2 = 3.0378 - (0.050062 * tempF) + (0.00026555 * Math.pow(tempF, 2));

  const neededCO2 = Math.max(targetVolumesCO2 - dissolvedCO2, 0);
  // 4g table sugar produces ~1L CO2 per liter (~2.0 g/L for 1 vol CO2)
  let sugarFactor = 4.0; // Cane sugar (Sucrose)
  if (sugarType === 'corn') sugarFactor = 4.4; // Dextrose Monohydrate
  if (sugarType === 'dme') sugarFactor = 6.0; // Dry Malt Extract

  const totalGrams = neededCO2 * beerVolumeLiters * (sugarFactor / 2);
  return Number(Math.max(totalGrams, 0).toFixed(1));
}

export interface YeastPitchResult {
  plato: number;
  totalCellsBillion: number;
  packetsNeeded: number;
  dryYeastGramsNeeded: number;
  recommendation: string;
}

export interface SlurryCalcResult {
  slurryMlNeeded: number;
  slurryGramsNeeded: number;
  slurryCupsNeeded: number;
  effectiveCellsPerMl: number;
  viabilityPercent: number;
  slurryQualityNote: string;
}

/**
 * Calculates required volume of harvested yeast slurry (lama) in mL/grams
 */
export function calculateYeastSlurry(
  totalCellsBillionNeeded: number,
  concentrationBillionPerMl: number = 1.5, // 1.0 (raw/liquid), 1.5 (settled), 2.5 (compact/washed)
  slurryAgeWeeks: number = 1, // age in weeks
  customViabilityPercent?: number, // optional override
  trubPercent: number = 15 // % of non-yeast debris/trub in slurry
): SlurryCalcResult {
  // Estimate viability based on age in weeks if custom percentage not provided
  let viability = customViabilityPercent ?? 90;
  if (customViabilityPercent === undefined) {
    if (slurryAgeWeeks <= 1) viability = 90;
    else if (slurryAgeWeeks <= 2) viability = 80;
    else if (slurryAgeWeeks <= 3) viability = 65;
    else if (slurryAgeWeeks <= 4) viability = 50;
    else viability = Math.max(50 - (slurryAgeWeeks - 4) * 10, 15);
  }

  const safeConcentration = Math.max(concentrationBillionPerMl, 0.2);
  const safeTrub = Math.min(Math.max(trubPercent, 0), 50) / 100;
  const safeViability = Math.min(Math.max(viability, 5), 100) / 100;

  // Viable yeast cells per mL of slurry
  const effectiveCellsPerMl = safeConcentration * safeViability * (1 - safeTrub);

  // Total mL of slurry required = total cells needed / effective cells per mL
  const slurryMlNeeded = effectiveCellsPerMl > 0
    ? Math.round(totalCellsBillionNeeded / effectiveCellsPerMl)
    : 0;

  // Approx weight in grams (slurry density ~1.1 g/mL)
  const slurryGramsNeeded = Math.round(slurryMlNeeded * 1.1);

  // Approx in cups (1 cup = 240 mL)
  const slurryCupsNeeded = Number((slurryMlNeeded / 240).toFixed(1));

  let slurryQualityNote = 'Lama fresca e viável. Pode inocular diretamente.';
  if (viability < 50) {
    slurryQualityNote = 'Atenção: Lama antiga com baixa viabilidade (<50%). Recomendado fazer um Starter de reativação antes de usar.';
  } else if (viability < 75) {
    slurryQualityNote = 'Lama moderadamente armazenada. Certifique-se de descartar o sobrenadante antigo antes de inocular.';
  } else if (trubPercent > 25) {
    slurryQualityNote = 'Lama com bastante trub (restos de lúpulo/mosto). Considere fazer lavagem de lama (Yeast Washing) para purificar.';
  }

  return {
    slurryMlNeeded,
    slurryGramsNeeded,
    slurryCupsNeeded,
    effectiveCellsPerMl: Number(effectiveCellsPerMl.toFixed(2)),
    viabilityPercent: Math.round(viability),
    slurryQualityNote,
  };
}

/**
 * Calculates required yeast cell count (pitch rate) for a batch
 */
export function calculateYeastPitch(
  batchSizeLiters: number,
  og: number,
  pitchRate: number = 0.75, // M cells/mL/°P
  cellsPerPacketBillion: number = 115 // default 11.5g dry yeast packet (~115B cells)
): YeastPitchResult {
  const safeOg = Math.max(og, 1.000);
  const safeVol = Math.max(batchSizeLiters, 0);

  // °Plato approximation: Plato = (OG - 1.0) * 250
  const plato = Number(((safeOg - 1.0) * 250).toFixed(1));
  const volumeMl = safeVol * 1000;

  // Total cells needed in billions: (pitchRate * mL * °P) / 1,000 (M to B)
  const totalCellsBillion = Number(((pitchRate * volumeMl * plato) / 1000).toFixed(1));

  // Packets/sachês needed
  const safePacketCount = cellsPerPacketBillion > 0 ? cellsPerPacketBillion : 115;
  const packetsNeeded = Number((totalCellsBillion / safePacketCount).toFixed(2));

  // Dry yeast grams (assuming ~10 billion cells per gram for dry yeast)
  const dryYeastGramsNeeded = Number((totalCellsBillion / 10).toFixed(1));

  let recommendation = 'Inoculação padrão adequada para fermentação saudável.';
  if (pitchRate >= 1.25) {
    recommendation = 'Lager ou baixa temperatura: Exige alta taxa de inoculação para evitar sulfeto, diacetil e atenuação lenta.';
  } else if (pitchRate <= 0.4) {
    recommendation = 'Kveik ou perfil esterificado: Sub-inoculação proposital para intensificar ésteres aromáticos e perfil frutado.';
  } else if (safeOg >= 1.070) {
    recommendation = 'Alta Gravidade (High Gravity): Faça um Starter robusto ou adicione sachês extras para evitar estresse térmico/osmótico da levedura.';
  } else {
    recommendation = 'Ale Padrão: Taxa de 0.75 M cel/mL/°P garante atenuação completa e perfil sensorial limpo.';
  }

  return {
    plato,
    totalCellsBillion,
    packetsNeeded,
    dryYeastGramsNeeded,
    recommendation,
  };
}

/**
 * Scales all recipe grain weights, hop additions, and salt additions proportionally to new batch size
 */
export function scaleRecipeBatchSize(recipe: BeerRecipe, newBatchSizeLiters: number): BeerRecipe {
  if (!recipe.batchSizeLiters || recipe.batchSizeLiters <= 0) return recipe;
  const factor = newBatchSizeLiters / recipe.batchSizeLiters;

  return {
    ...recipe,
    batchSizeLiters: newBatchSizeLiters,
    grains: recipe.grains.map((g) => ({
      ...g,
      amountKg: Number((g.amountKg * factor).toFixed(2)),
    })),
    hops: recipe.hops.map((h) => ({
      ...h,
      amountGrams: Number((h.amountGrams * factor).toFixed(0)),
    })),
    waterSalts: {
      gypsumGrams: Number((recipe.waterSalts.gypsumGrams * factor).toFixed(1)),
      calciumChlorideGrams: Number((recipe.waterSalts.calciumChlorideGrams * factor).toFixed(1)),
      epsomSaltGrams: Number((recipe.waterSalts.epsomSaltGrams * factor).toFixed(1)),
      tableSaltGrams: Number((recipe.waterSalts.tableSaltGrams * factor).toFixed(1)),
      bakingSodaGrams: Number((recipe.waterSalts.bakingSodaGrams * factor).toFixed(1)),
      lacticAcid88Ml: Number((recipe.waterSalts.lacticAcid88Ml * factor).toFixed(1)),
    },
  };
}

export const calculateAllMetrics = computeRecipeCalculations;

