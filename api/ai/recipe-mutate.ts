import { callGeminiWithResilience, extractJsonFromResponse } from '../_gemini';

export async function POST(request: Request) {
  
  const body = await request.json() as any;
  const { currentRecipe, mutationGoal } = body;
  
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
  
    return Response.json({ success: true, recipe: mutatedRecipe });
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
  
    return Response.json({ success: true, recipe: mutated });
  }
}
