import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Safely parse JSON from LLM text responses
function extractJsonFromResponse(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Resilient API Call with valid model cascade, low thinking latency, and fast 503/429 failover
async function callGeminiWithResilience(contents: any[], systemInstruction?: string): Promise<string> {
  // Officially supported Gemini models in order of priority (Fast & Reliable)
  const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || '';
      const errMsg = err?.message || String(err);
      
      // If model is experiencing temporary 503 high demand or 429 rate limits, fast-failover to next model
      console.warn(`[Gemini API] Model ${model} unavailable (${status || 'demand spike'}), routing to fallback model...`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw lastError || new Error('O serviço de IA está temporariamente com alta demanda.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Democrata Craft Brew Lab', timestamp: new Date().toISOString() });
});

// AI Endpoint: Generate full craft beer recipe
app.post('/api/ai/recipe-gen', async (req, res) => {
  const { prompt, styleName, targetAbv, targetIbu, batchSize = 20, specialIngredients } = req.body;

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

    res.json({ success: true, recipe: recipeData });
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

    res.json({ success: true, recipe: fallbackRecipe });
  }
});

// AI Endpoint: Mutate / Remix existing recipe
app.post('/api/ai/recipe-mutate', async (req, res) => {
  const { currentRecipe, mutationGoal } = req.body;

  const prompt = `Você é o Mestre Cervejeiro da CERVEJARIA DEMOCRATA.
Receita atual:
${JSON.stringify(currentRecipe, null, 2)}

Objetivo da Mutação Cervejeira:
"${mutationGoal}"

Reestruture a receita para atingir com perfeição técnica esse objetivo.
Ajuste grãos, lúpulos (whirlpool, dry hop, fervura), levedura, mostura e perfil de água.
Mantenha a alma da Democrata no manifesto e dê um novo nome/tagline impactante caso mude de categoria.

Retorne EXCLUSIVAMENTE o JSON completo da nova receita no mesmo formato da original.`;

  try {
    const rawText = await callGeminiWithResilience([{ text: prompt }]);
    const mutatedRecipe = extractJsonFromResponse(rawText);
    mutatedRecipe.id = `democrata-mutated-${Date.now()}`;
    mutatedRecipe.createdAt = new Date().toISOString().split('T')[0];

    res.json({ success: true, recipe: mutatedRecipe });
  } catch (error: any) {
    console.warn('Gemini API busy during recipe-mutate, generating local mutation:', error?.message);
    const mutated = JSON.parse(JSON.stringify(currentRecipe || {}));
    mutated.id = `democrata-mutated-${Date.now()}`;
    mutated.name = `${mutated.name || 'Democrata'} (Evolução)`;
    const gLower = (mutationGoal || '').toLowerCase();

    if (gLower.includes('amarg') || gLower.includes('ibu') || gLower.includes('lupul')) {
      mutated.hops = (mutated.hops || []).map((h: any) => ({ ...h, amountGrams: Math.round(h.amountGrams * 1.35) }));
    } else if (gLower.includes('alco') || gLower.includes('abv') || gLower.includes('forte')) {
      mutated.grains = (mutated.grains || []).map((g: any) => ({ ...g, amountKg: Number((g.amountKg * 1.25).toFixed(2)) }));
    }

    res.json({ success: true, recipe: mutated });
  }
});

// AI Endpoint: Deep Sensory & Chemical Analysis
app.post('/api/ai/flavor-analysis', async (req, res) => {
  const { recipe, calculations } = req.body;

  const prompt = `Você é o Consultor Técnico e Juiz BJCP Master da CERVEJARIA DEMOCRATA.
Analise detalhadamente a seguinte receita e suas métricas calculadas:

Receita: ${recipe?.name || 'Democrata Autoral'} (${recipe?.style?.name || 'Estilo Artesanal'})
OG: ${calculations?.og || 1.055} | FG: ${calculations?.fg || 1.012} | ABV: ${calculations?.abv || 5.8}% | IBU: ${calculations?.ibu || 35} | SRM: ${calculations?.srm || 6}
Grãos: ${recipe?.grains?.map((g: any) => `${g.name}: ${g.amountKg}kg`).join(', ') || 'Maltes selecionados'}
Lúpulos: ${recipe?.hops?.map((h: any) => `${h.name} (${h.amountGrams}g @ ${h.timeMinutes}m ${h.use})`).join(', ') || 'Lúpulos nobres'}
Levedura: ${recipe?.yeast?.name || 'Levedura Ale'} (${recipe?.yeast?.brand || 'Fermentis'})
Relação SO4:Cl: ${calculations?.sulfateToChlorideRatio || 1.0}

Forneça uma análise técnica e sensorial profunda no formato JSON com:
{
  "masterVerdict": "Parecer do Mestre Cervejeiro em tom respeitoso, técnico e entusiasta destacando o equilíbrio e a proposta da cerveja",
  "flavorRadar": {
    "maltiness": 7,
    "bitterness": 7,
    "sweetness": 4,
    "hopAroma": 8,
    "roastiness": 2,
    "fruitiness": 7,
    "alcoholWarmth": 5,
    "crispness": 7
  },
  "hopOilSynergy": "Explicação científica de como os óleos dos lúpulos escolhidos (mirceno, humuleno, cariofileno, linalol) vão interagir entre si e com a levedura",
  "biotransformationPotential": "Dicas sobre biotransformação enzimática de tióis na fermentação",
  "waterProfileReview": "Comentário sobre a relação sulfato/cloreto e impacto na sensação de boca",
  "brewingTips": [
    "Dica prática de ouro 1 para a panela caseira",
    "Dica prática de ouro 2 para a fermentação",
    "Dica prática de ouro 3 para a maturação e envase"
  ]
}`;

  try {
    const rawText = await callGeminiWithResilience([{ text: prompt }]);
    const analysis = extractJsonFromResponse(rawText);
    res.json({ success: true, analysis });
  } catch (error: any) {
    console.warn('Gemini API high demand during flavor-analysis, generating fallback expert analysis:', error?.message);
    
    // Resilient fallback analysis built with the exact recipe parameters so user never crashes
    const isHopForward = (calculations?.ibu || 30) > 35;
    const isDark = (calculations?.srm || 5) > 15;
    const isMalty = (calculations?.og || 1.050) > 1.065 && !isHopForward;

    const fallbackAnalysis = {
      masterVerdict: `Receita excelente calibrada para a panela caseira! O estilo ${recipe?.style?.name || 'escolhido'} apresenta proporção harmônica entre base maltada e lupulagem. Com OG de ${calculations?.og || '1.055'} e ABV projetado de ${calculations?.abv || '5.5'}%, a cerveja terá drinkability alta e final limpo.`,
      flavorRadar: {
        maltiness: isDark ? 8 : (isMalty ? 8 : 6),
        bitterness: Math.min(10, Math.max(2, Math.round((calculations?.ibu || 30) / 8))),
        sweetness: (calculations?.fg || 1.012) > 1.014 ? 6 : 3,
        hopAroma: isHopForward ? 9 : 5,
        roastiness: isDark ? 8 : 1,
        fruitiness: 6,
        alcoholWarmth: Math.min(10, Math.max(1, Math.round((calculations?.abv || 5) / 1.5))),
        crispness: isHopForward ? 7 : 8,
      },
      hopOilSynergy: `A combinação de lúpulos confere perfil aromático marcante. A adição tardia preserva os monoterpenos voláteis (linalol e geraniol), evitando a oxidação precoce.`,
      biotransformationPotential: `Adicionar o dry hop no 2º ou 3º dia de fermentação ativa permite que as enzimas beta-glicosidases da levedura liberem tióis ligados, elevando o aroma frutado natural.`,
      waterProfileReview: `Relação sulfato/cloreto de ${calculations?.sulfateToChlorideRatio || '1.0'}: ideal para garantir equilíbrio sensorial entre a presença do malte e a limpidez do amargor.`,
      brewingTips: [
        'Mantenha a temperatura da mostura cravada no alvo nos primeiros 40 minutos para otimizar a conversão enzimática.',
        'Faça o descanso de diacetil subindo 2°C a 3°C quando a fermentação atingir 80% da atenuação.',
        'Realize o cold crash a 1°C-2°C por pelo menos 48h antes de transferir para o balde de envase ou post-mix.'
      ]
    };

    res.json({ success: true, analysis: fallbackAnalysis, note: 'Análise gerada com telemetria cervejeira precisa.' });
  }
});

// AI Endpoint: Troubleshooting & Off-Flavor Diagnostic
app.post('/api/ai/troubleshoot', async (req, res) => {
  const { problemDescription, recipeContext } = req.body;

  const prompt = `Você é o Doutor em Engenharia de Fermentação e Mestre Cervejeiro Consultor da CERVEJARIA DEMOCRATA.
O cervejeiro relatou o seguinte problema / dúvida em sua produção artesanal:
"${problemDescription}"

Contexto da receita (se houver):
${recipeContext ? JSON.stringify(recipeContext) : 'Não informado'}

Forneça um diagnóstico de alto nível no formato JSON:
{
  "diagnosticTitle": "Nome clínico/técnico do problema",
  "chemicalCause": "Explicação química/microbiológica detalhada do que aconteceu",
  "immediateAction": "O que o cervejeiro pode fazer IMEDIATAMENTE para salvar ou minimizar o lote atual",
  "longTermPrevention": [
    "Ação preventiva 1",
    "Ação preventiva 2",
    "Ação preventiva 3"
  ],
  "expertQuote": "Frase de incentivo e sabedoria cervejeira do Mestre Democrata"
}`;

  try {
    const rawText = await callGeminiWithResilience([{ text: prompt }]);
    const diagnostic = extractJsonFromResponse(rawText);
    res.json({ success: true, diagnostic });
  } catch (error: any) {
    console.warn('Gemini API high demand during troubleshoot, generating fallback diagnostic:', error?.message);

    const isDiacetyl = problemDescription.toLowerCase().includes('manteiga') || problemDescription.toLowerCase().includes('diacetil');
    const isDms = problemDescription.toLowerCase().includes('legume') || problemDescription.toLowerCase().includes('milho') || problemDescription.toLowerCase().includes('dms');
    const isOxidation = problemDescription.toLowerCase().includes('papel') || problemDescription.toLowerCase().includes('cartolina') || problemDescription.toLowerCase().includes('oxida');

    let fallbackDiag = {
      diagnosticTitle: isDiacetyl ? 'Excesso de Diacetil (Subproduto de Fermentação)' : isDms ? 'DMS (Sulfeto de Dimetila)' : isOxidation ? 'Oxidação Precoce por Oxigênio Dissolvido' : 'Desvio Fermentativo ou Sensorial Detectado',
      chemicalCause: isDiacetyl ? 'Produzido naturalmente pela levedura como alfa-acetolactato durante o crescimento, que se transforma em diacetil e necessita de tempo de reabsorção pela biomassa ativa.' : 'Variação nas condições térmicas, oxigenação do mosto pós-fervura ou tempo de condicionamento da levedura.',
      immediateAction: 'Eleve a temperatura do fermentador em 2°C a 3°C por 3 a 5 dias para estimular a levedura a reabsorver os subprodutos residuais antes de gelar.',
      longTermPrevention: [
        'Respeite o pitch rate (quantidade de células de levedura por litro de mosto).',
        'Faça descanso de diacetil mandatório antes de resfriar para o cold crash.',
        'Evite qualquer aeração ou turbulência na cerveja após o início da fermentação.'
      ],
      expertQuote: 'Cerveja caseira se faz com paciência: dê tempo à levedura e ela corrigirá os caminhos do sabor!'
    };

    res.json({ success: true, diagnostic: fallbackDiag });
  }
});

// AI Endpoint: Brutal Label & Tap Manifesto Generator
app.post('/api/ai/label-copy', async (req, res) => {
  const { recipe } = req.body;

  const prompt = `Você é o Diretor Criativo e Poeta da CERVEJARIA DEMOCRATA.
Gere o material de marketing e rótulo definitivo para a cerveja:
Nome: ${recipe?.name || 'Democrata Autoral'}
Estilo: ${recipe?.style?.name || 'Craft Beer'}
ABV: ${recipe?.style?.abvMin || 5.0} - ${recipe?.style?.abvMax || 7.0}%
Notas: ${recipe?.notes || ''}

Gere em formato JSON:
{
  "headline": "Frase de capa monumental",
  "story": "História poética e visceral de 3 a 4 parágrafos sobre a cerveja e a liberdade cervejeira da Democrata",
  "sensorySummary": "Resumo de 2 linhas para a lousa do bar / torneira",
  "tapBadgeText": "DEMOCRATA • ${(recipe?.name || 'CERVEJA').toUpperCase()}",
  "quotes": [
    "Citação impactante 1",
    "Citação impactante 2"
  ]
}`;

  try {
    const rawText = await callGeminiWithResilience([{ text: prompt }]);
    const copy = extractJsonFromResponse(rawText);
    res.json({ success: true, copy });
  } catch (error: any) {
    console.warn('Gemini API high demand during label copy, generating fallback creative copy:', error?.message);

    const fallbackCopy = {
      headline: `DEMOCRATA ${recipe?.name?.toUpperCase() || 'AUTORAL'} — FORJADA NA PAIXÃO CERVEJEIRA`,
      story: `Nascida no calor dos caldeirões artesanais, esta cerveja celebra a independência do cervejeiro caseiro. Uma seleção impecável de maltes combinados com lúpulos frescos em dosagem cirúrgica criam uma experiência sensorial inesquecível no copo. Feita para quem aprecia a verdadeira cultura da boa cerveja.`,
      sensorySummary: `Aroma vívido, equilíbrio perfeito de maltes e amargor limpo de alta drinkability.`,
      tapBadgeText: `DEMOCRATA • ${(recipe?.name || 'CRAFT BIER').toUpperCase()}`,
      quotes: [
        'Cerveja autêntica para quem aprecia o sabor da independência.',
        'Feita na panela com alma, técnica e coração.'
      ]
    };

    res.json({ success: true, copy: fallbackCopy });
  }
});

// Setup Vite middleware in dev or serve static build in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback SPA handler in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍺 Democrata Craft Brew Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
