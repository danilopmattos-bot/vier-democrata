export type HopUse = 'Mash' | 'First Wort' | 'Boil' | 'Whirlpool' | 'Dry Hop';
export type HopForm = 'Pellet' | 'Leaf' | 'Cryo';
export type GrainType = 'Base' | 'Caramel/Crystal' | 'Roasted' | 'Adjunct' | 'Acid/Special';

export interface GrainBillItem {
  id: string;
  name: string;
  amountKg: number;
  potentialSg: number; // e.g. 1.037
  ebc: number; // Color in EBC
  type: GrainType;
  percentage?: number;
}

export interface HopAddition {
  id: string;
  name: string;
  amountGrams: number;
  alphaAcids: number; // e.g. 12.5%
  timeMinutes: number; // e.g. 60, 15, 0 (knockout), or days for dry hop
  use: HopUse;
  form: HopForm;
  tempCelsius?: number; // e.g. 80C for whirlpool
}

export interface YeastProfile {
  id: string;
  name: string;
  brand: string;
  strain: string;
  type: 'Ale' | 'Lager' | 'Kveik' | 'Wheat' | 'Belgian' | 'Sour/Wild';
  attenuationAvg: number; // e.g. 78%
  optimalTempMin: number; // e.g. 18C
  optimalTempMax: number; // e.g. 22C
  flocculation: 'Low' | 'Medium' | 'High' | 'Very High';
  alcoholTolerance: number; // e.g. 11%
  notes: string;
}

export interface WaterProfile {
  id?: string;
  name: string;
  description?: string;
  calcium: number;    // Ca (ppm)
  magnesium: number;  // Mg (ppm)
  sodium: number;     // Na (ppm)
  chloride: number;   // Cl (ppm)
  sulfate: number;    // SO4 (ppm)
  bicarbonate: number;// HCO3 (ppm)
  ph?: number;
  residualAlkalinity?: number;
  sourceType?: 'Sanepar Curitiba' | 'Manancial' | 'Osmose Reversa' | 'Histórico Mundial' | 'Perfil Alvo';
  dechlorinationRequired?: boolean;
}

export interface WaterSalts {
  gypsumGrams: number;        // CaSO4
  calciumChlorideGrams: number; // CaCl2
  epsomSaltGrams: number;     // MgSO4
  tableSaltGrams: number;     // NaCl
  bakingSodaGrams: number;    // NaHCO3
  lacticAcid88Ml: number;     // Acid for pH mash adjust
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
    score: number; // 0 - 100%
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
