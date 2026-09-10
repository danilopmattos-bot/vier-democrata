export type HopUse = 'Mash' | 'First Wort' | 'Boil' | 'Whirlpool' | 'Dry Hop';
export type HopForm = 'Pellet' | 'Leaf' | 'Cryo';
export type GrainType = 'Base' | 'Caramel/Crystal' | 'Roasted' | 'Adjunct' | 'Acid/Special';

export interface GrainBillItem {
  id: string;
  name: string;
  amountKg: number;
  potentialSg: number;
  ebc: number;
  type: GrainType;
  percentage?: number;
}

export interface HopAddition {
  id: string;
  name: string;
  amountGrams: number;
  alphaAcids: number;
  timeMinutes: number;
  use: HopUse;
  form: HopForm;
  tempCelsius?: number;
}

export interface YeastProfile {
  id: string;
  name: string;
  brand: string;
  strain: string;
  type: 'Ale' | 'Lager' | 'Kveik' | 'Wheat' | 'Belgian' | 'Sour/Wild';
  attenuationAvg: number;
  optimalTempMin: number;
  optimalTempMax: number;
  flocculation: 'Low' | 'Medium' | 'High' | 'Very High';
  alcoholTolerance: number;
  notes: string;
}

export interface WaterProfile {
  id?: string;
  name: string;
  description?: string;
  calcium: number;
  magnesium: number;
  sodium: number;
  chloride: number;
  sulfate: number;
  bicarbonate: number;
  ph?: number;
  residualAlkalinity?: number;
  sourceType?: 'Sanepar Curitiba' | 'Manancial' | 'Osmose Reversa' | 'Histórico Mundial' | 'Perfil Alvo';
  dechlorinationRequired?: boolean;
}

export interface WaterSalts {
  gypsumGrams: number;
  calciumChlorideGrams: number;
  epsomSaltGrams: number;
  tableSaltGrams: number;
  bakingSodaGrams: number;
  lacticAcid88Ml: number;
}

export interface MashStep {
  id: string;
  name: string;
  tempCelsius: number;
  durationMinutes: number;
  type: 'Infusion' | 'Temperature' | 'Decoction' | 'Mash Out';
  description?: string;
}

export interface FermentationStage {
  name: string;
  tempCelsius: number;
  durationDays: number;
  description: string;
}

export interface BJCPStyle {
  id: string;
  code: string;
  name: string;
  category: string;
  ogMin: number;
  ogMax: number;
  fgMin: number;
  fgMax: number;
  ibuMin: number;
  ibuMax: number;
  srmMin: number;
  srmMax: number;
  abvMin: number;
  abvMax: number;
  carbMin?: number;
  carbMax?: number;
  flavorProfile: string;
  aromaProfile: string;
  appearance: string;
  history: string;
  targetBuGu: number;
}

export interface BeerRecipe {
  id: string;
  name: string;
  tagline: string;
  brewer: string;
  style: BJCPStyle;
  batchSizeLiters: number;
  boilTimeMinutes: number;
  efficiencyPercent: number;
  grains: GrainBillItem[];
  hops: HopAddition[];
  yeast: YeastProfile;
  waterTarget: WaterProfile;
  baseWaterSource?: WaterProfile;
  waterSalts: WaterSalts;
  mashSchedule: MashStep[];
  fermentationStages: FermentationStage[];
  notes: string;
  manifesto?: string;
  foodPairing?: string[];
  glassware?: string;
  servingTemp?: string;
  labelsDesign?: {
    accentColor: string;
    badgeStyle: 'cyber' | 'artisan' | 'brutal' | 'vintage';
    iconName?: string;
  };
  createdAt: string;
}

export type BrewSessionStatus = 'planned' | 'brewing' | 'fermenting' | 'packaged' | 'completed';
export type BrewStepStatus = 'pending' | 'active' | 'done';

export interface BrewStepRecord {
  id: string;
  name: string;
  status: BrewStepStatus;
  targetTempCelsius?: number;
  durationMinutes?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface BrewReading {
  id: string;
  recordedAt: string;
  kind: 'preBoilGravity' | 'preBoilVolume' | 'postBoilVolume' | 'originalGravity' | 'finalGravity' | 'pitchTemperature' | 'mashPh' | 'temperature' | 'note';
  label: string;
  value: number | string;
  unit?: string;
}

export interface FermentationReading {
  id: string;
  recordedAt: string;
  gravity?: number;
  tempCelsius?: number;
  note?: string;
}

/**
 * A BrewSession is a real batch. The recipe remains the plan; this record stores
 * what actually happened. New fields are optional so V3/V4 browser data remains
 * readable without migration.
 */
export interface BrewSession {
  id: string;
  recipeId: string;
  recipeName: string;
  brewedAt: string;
  updatedAt?: string;
  status: BrewSessionStatus;
  currentStepIndex?: number;
  steps?: BrewStepRecord[];
  readings?: BrewReading[];
  fermentationReadings?: FermentationReading[];
  planned?: {
    originalGravity?: number;
    finalGravity?: number;
    abv?: number;
    ibu?: number;
    srm?: number;
    efficiencyPercent?: number;
    batchSizeLiters?: number;
    styleCode?: string;
    styleName?: string;
  };
  actuals?: {
    preBoilGravity?: number;
    preBoilVolumeLiters?: number;
    postBoilVolumeLiters?: number;
    originalGravity?: number;
    finalGravity?: number;
    abv?: number;
    efficiencyPercent?: number;
    pitchTempCelsius?: number;
    mashPh?: number;
  };
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  wouldBrewAgain?: boolean;
  packagedAt?: string;
}

export interface RecipeCalculations {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  ebc: number;
  buGu: number;
  colorHex: string;
  totalGrainKg: number;
  totalHopsGrams: number;
  strikeWaterVolumeLiters: number;
  strikeWaterTempCelsius: number;
  spargeWaterVolumeLiters: number;
  preBoilVolumeLiters: number;
  totalWaterNeededLiters: number;
  preBoilGravity: number;
  apparentAttenuationPercent: number;
  effectiveMashTempCelsius: number;
  fermentabilityProfile: 'very_high' | 'high' | 'balanced' | 'dextrinous' | 'low';
  fermentabilityDescription: string;
  sulfateToChlorideRatio: number;
  waterProfileResult: {
    ca: number;
    mg: number;
    na: number;
    cl: number;
    so4: number;
    hco3: number;
    residualAlkalinity?: number;
  };
  residualAlkalinity?: number;
  estimatedMashPh?: {
    estimatedPh: number;
    status: 'optimal' | 'acidic' | 'alkaline';
    notes: string;
  };
  campdenDosage?: {
    tabletsNeeded: number;
    tabletFraction: string;
    gramsNeeded: number;
  };
  bjcpCompliance: {
    ogStatus: 'low' | 'ok' | 'high';
    fgStatus: 'low' | 'ok' | 'high';
    abvStatus: 'low' | 'ok' | 'high';
    ibuStatus: 'low' | 'ok' | 'high';
    srmStatus: 'low' | 'ok' | 'high';
    score: number;
  };
}

export interface OffFlavorGuide {
  id: string;
  namePt: string;
  nameEn: string;
  chemical: string;
  sensory: string;
  causes: string[];
  prevention: string[];
  salvage: string;
}
