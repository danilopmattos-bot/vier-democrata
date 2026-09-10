import { callGeminiWithResilience, extractJsonFromResponse } from '../_gemini';

export async function POST(request: Request) {
  
  const body = await request.json() as any;
  const { problemDescription, recipeContext } = body;
  
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
    return Response.json({ success: true, diagnostic });
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
  
    return Response.json({ success: true, diagnostic: fallbackDiag });
  }
}
