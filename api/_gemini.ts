import { GoogleGenAI, ThinkingLevel } from '@google/genai';

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada. Adicione a variável no Vercel para usar os recursos de IA.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'democrata-bier-vercel',
      },
    },
  });
}

export function extractJsonFromResponse(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export async function callGeminiWithResilience(contents: any[], systemInstruction?: string): Promise<string> {
  const ai = getAI();
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

      if (response?.text) return response.text;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || '';
      console.warn(`[Gemini API] Modelo ${model} indisponível (${status || 'pico de demanda'}); tentando fallback...`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw lastError || new Error('O serviço de IA está temporariamente indisponível.');
}
