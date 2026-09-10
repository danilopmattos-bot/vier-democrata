import { callGeminiWithResilience, extractJsonFromResponse } from '../_gemini';

export async function POST(request: Request) {
  
  const body = await request.json() as any;
  const { prompt, styleName, targetAbv, targetIbu, batchSize = 20, specialIngredients } = body;
  
  const systemPrompt = `Você é o Mestre Cervejeiro Chefe e Alquimista Líder da prestigiada CERVEJARIA DEMOCRATA.
  Você é um especialista de nível mundial em formulação de receitas de cerveja artesanal (BJCP 2021), química da água (relação sulfato/cloreto, pH de mostura), biotransformação de lúpulos (tióis, monoterpenos) e perfis enzimáticos de mostura.
  
  Crie uma receita cervejeira brutal, fascinante, ultra precisa e profissional para a Cervejaria Democrata.
  
  Você DEVE retornar EXCLUSIVAMENTE um objeto JSON válido com a seguinte estrutura:
  {
  "name": "Nome brutal da cerveja com 'Democrata ...'",
  "tagline": "Slogan de impacto",
  "brewer": "Mestre Democrata",
  "style": {
    "id": "código-estilo",
    "code": "21B",
    "name": "Nome do Estilo BJCP",
    "category": "Categoria",
    "ogMin": 1.050,
    "ogMax": 1.075,
    "fgMin": 1.008,
    "fgMax": 1.015,
    "ibuMin": 30,
    "ibuMax": 70,
    "srmMin": 4,
    "srmMax": 8,
    "abvMin": 5.5,
    "abvMax": 7.5,
    "flavorProfile": "Descrição de sabor",
    "aromaProfile": "Descrição aromática",
    "appearance": "Aparência",
    "history": "Histórico",
    "targetBuGu": 0.7
  },
  "batchSizeLiters": ${batchSize},
  "boilTimeMinutes": 60,
  "efficiencyPercent": 72,
  "grains": [
    { "id": "g1", "name": "Nome do Malte com fabricante", "amountKg": 4.5, "potentialSg": 1.037, "ebc": 4.0, "type": "Base" }
  ],
  "hops": [
    { "id": "h1", "name": "Nome Lúpulo", "amountGrams": 50, "alphaAcids": 13.0, "timeMinutes": 20, "use": "Whirlpool", "form": "Pellet", "tempCelsius": 80 }
  ],
  "yeast": {
    "id": "y1",
    "name": "Nome da Levedura",
    "brand": "Fermentis / Lallemand / etc",
    "strain": "Cepa",
    "type": "Ale",
    "attenuationAvg": 78,
    "optimalTempMin": 18,
    "optimalTempMax": 23,
    "flocculation": "Medium",
    "alcoholTolerance": 11,
    "notes": "Notas da levedura"
  },
  "waterTarget": {
    "name": "Nome do perfil de água",
    "description": "Explicação da relação SO4:Cl",
    "calcium": 110,
    "magnesium": 12,
    "sodium": 20,
    "chloride": 150,
    "sulfate": 80,
    "bicarbonate": 40
  },
  "waterSalts": {
    "gypsumGrams": 3.5,
    "calciumChlorideGrams": 8.0,
    "epsomSaltGrams": 2.0,
    "tableSaltGrams": 1.0,
    "bakingSodaGrams": 0.0,
    "lacticAcid88Ml": 3.0
  },
  "mashSchedule": [
    { "id": "m1", "name": "Sacarificação", "tempCelsius": 66, "durationMinutes": 60, "type": "Infusion", "description": "Passo de mostura" }
  ],
  "fermentationStages": [
    { "name": "Primária", "tempCelsius": 19, "durationDays": 5, "description": "Fermentação principal" }
  ],
  "notes": "Instruções secretas e dicas técnicas do Mestre Cervejeiro para a brassagem perfeita.",
  "manifesto": "Texto poético e potente sobre a identidade da Cerveja Democrata para o rótulo e carta de torneiras.",
  "foodPairing": ["Harmonização 1", "Harmonização 2", "Harmonização 3"],
  "glassware": "Copo recomendado",
  "servingTemp": "Temperatura ideal de serviço (ex: 6°C a 8°C)",
  "labelsDesign": {
    "accentColor": "#F59E0B",
    "badgeStyle": "brutal",
    "iconName": "Zap"
  }
  }`;
  
  const userPrompt = `Crie a receita com estes parâmetros:
  Conceito / Ideia: ${prompt || 'Cerveja icônica e inovadora da Democrata'}
  Estilo desejado: ${styleName || 'Livre escolha do Mestre'}
  ABV aproximado: ${targetAbv ? `${targetAbv}%` : 'Conforme estilo'}
  IBU aproximado: ${targetIbu ? `${targetIbu} IBU` : 'Conforme estilo'}
  Volume do lote: ${batchSize} Litros
  Ingredientes especiais ou adjuntos sugeridos: ${specialIngredients || 'Nenhum, ou escolha do Mestre'}
  
  Certifique-se de que os cálculos de grãos e lúpulos somem quantidades realistas para ${batchSize}L de cerveja acabada!`;
  
  try {
    const rawText = await callGeminiWithResilience([{ text: userPrompt }], systemPrompt);
    const recipeData = extractJsonFromResponse(rawText);
    recipeData.id = `democrata-ai-${Date.now()}`;
    recipeData.createdAt = new Date().toISOString().split('T')[0];
  
    return Response.json({ success: true, recipe: recipeData });
  } catch (error: any) {
    console.warn('Gemini API busy during recipe-gen, generating master-crafted fallback recipe:', error?.message);
    const batch = Number(batchSize) || 20;
    const targetA = parseFloat(targetAbv) || 6.5;
    const totalGrain = Number((batch * targetA * 0.042).toFixed(2));
    const isIpa = (styleName || '').toLowerCase().includes('ipa');
    const isStout = (styleName || '').toLowerCase().includes('stout') || (styleName || '').toLowerCase().includes('porter');
  
    const fallbackRecipe = {
      id: `democrata-ai-${Date.now()}`,
      name: prompt ? `Democrata ${prompt.split(' ')[0]} Autoral` : `Democrata ${styleName || 'Alquimia Especial'}`,
      tagline: `Forjada com paixão para o caldeirão de ${batch}L`,
      brewer: 'Mestre Democrata',
      style: {
        id: isIpa ? '21B' : isStout ? '20B' : '18B',
        code: isIpa ? '21B' : isStout ? '20B' : '18B',
        name: styleName || (isIpa ? 'New England IPA' : isStout ? 'American Stout' : 'American Pale Ale'),
        category: isIpa ? 'IPA' : isStout ? 'Stout' : 'Pale American Ale',
        ogMin: 1.050,
        ogMax: 1.075,
        fgMin: 1.008,
        fgMax: 1.015,
        ibuMin: 30,
        ibuMax: 70,
        srmMin: 4,
        srmMax: 8,
        abvMin: 5.5,
        abvMax: 7.5,
        flavorProfile: 'Equilíbrio primoroso entre malte fresco e amargor limpo',
        aromaProfile: 'Aromas frutados e cítricos',
        appearance: 'Coloração límpida com espuma densa e persistente',
        history: 'Tradição artesanal reinterpretada',
        targetBuGu: 0.75
      },
      batchSizeLiters: batch,
      boilTimeMinutes: 60,
      efficiencyPercent: 72,
      grains: isIpa ? [
        { id: 'g1', name: 'Malte Pilsen Agrária', amountKg: Number((totalGrain * 0.70).toFixed(2)), potentialSg: 1.037, ebc: 3.5, type: 'Base' },
        { id: 'g2', name: 'Aveia Flocada (Flaked Oats)', amountKg: Number((totalGrain * 0.20).toFixed(2)), potentialSg: 1.033, ebc: 2.0, type: 'Adjunct' },
        { id: 'g3', name: 'Malte Carapils Weyermann', amountKg: Number((totalGrain * 0.10).toFixed(2)), potentialSg: 1.035, ebc: 5.0, type: 'Caramel/Crystal' }
      ] : [
        { id: 'g1', name: 'Malte Pale Ale Crisp', amountKg: Number((totalGrain * 0.85).toFixed(2)), potentialSg: 1.037, ebc: 5.5, type: 'Base' },
        { id: 'g2', name: 'Malte Munich I Weyermann', amountKg: Number((totalGrain * 0.15).toFixed(2)), potentialSg: 1.036, ebc: 15.0, type: 'Base' }
      ],
      hops: [
        { id: 'h1', name: 'Magnum', amountGrams: Math.round(15 * (batch / 20)), alphaAcids: 14.0, timeMinutes: 60, use: 'Fervura', form: 'Pellet T90' },
        { id: 'h2', name: 'Citra', amountGrams: Math.round(45 * (batch / 20)), alphaAcids: 12.5, timeMinutes: 20, use: 'Whirlpool / Hopstand', form: 'Pellet T90', tempCelsius: 82 },
        { id: 'h3', name: 'Mosaic', amountGrams: Math.round(50 * (batch / 20)), alphaAcids: 12.0, timeMinutes: 3, use: 'Dry Hop', form: 'Pellet T90', tempCelsius: 16 }
      ],
      yeast: {
        id: 'y1',
        name: 'SafAle US-05',
        brand: 'Fermentis',
        strain: 'American Ale',
        type: 'Ale',
        attenuationAvg: 78,
        optimalTempMin: 18,
        optimalTempMax: 23,
        flocculation: 'Medium',
        alcoholTolerance: 11,
        notes: 'Levedura neutra clássica de alta drinkability'
      },
      waterTarget: {
        id: 'wp-balanced',
        name: 'Equilibrado Democrata',
        calcium: 75,
        magnesium: 12,
        sodium: 15,
        chloride: 80,
        sulfate: 90,
        bicarbonate: 35
      },
      waterSalts: {
        gypsumGrams: 4.5,
        calciumChlorideGrams: 5.0,
        epsomSaltGrams: 2.5,
        tableSaltGrams: 0.0,
        bakingSodaGrams: 0.0,
        lacticAcid88Ml: 3.5
      },
      mashSchedule: [
        { id: 'm-1', name: 'Mostura Principal (Sacarificação)', tempCelsius: 66, durationMinutes: 60, type: 'Infusion', description: 'Conversão enzimática completa' },
        { id: 'm-2', name: 'Mash Out', tempCelsius: 76, durationMinutes: 10, type: 'Mash Out', description: 'Inativação enzimática' }
      ],
      fermentationStages: [
        { name: 'Fermentação Primária', tempCelsius: 19, durationDays: 7, description: 'Atenuação e aromas' },
        { name: 'Cold Crash', tempCelsius: 2, durationDays: 3, description: 'Clarificação e decantação' }
      ],
      notes: specialIngredients ? `Ingredientes Especiais: ${specialIngredients}. ${prompt || ''}` : `Receita calibrada para ${styleName || 'estilo artesanal'}.`,
      manifesto: 'Feita com liberdade, paciência e a arte do cervejeiro caseiro.',
      createdAt: new Date().toISOString().split('T')[0]
    };
  
    return Response.json({ success: true, recipe: fallbackRecipe });
  }
}
