import { callGeminiWithResilience, extractJsonFromResponse } from '../_gemini';

export async function POST(request: Request) {
  
  const body = await request.json() as any;
  const { recipe } = body;
  
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
    return Response.json({ success: true, copy });
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
  
    return Response.json({ success: true, copy: fallbackCopy });
  }
}
