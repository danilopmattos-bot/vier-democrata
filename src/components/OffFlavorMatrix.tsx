import React, { useState } from 'react';
import { OFF_FLAVORS_GUIDE } from '../data/ingredients';
import { OffFlavorGuide, BeerRecipe } from '../types/brewing';
import {
  AlertTriangle,
  Search,
  CheckCircle,
  HelpCircle,
  Loader2,
  Stethoscope,
  ShieldCheck,
  Flame,
  Lightbulb,
  Sparkles,
  RefreshCw,
  FlaskConical,
  Zap,
  X,
} from 'lucide-react';

interface OffFlavorMatrixProps {
  currentRecipe?: BeerRecipe;
}

// Local smart diagnostic engine fallback for instant and zero-failure diagnostic response
function generateLocalDiagnostic(query: string, currentRecipe?: BeerRecipe) {
  const q = query.toLowerCase();

  if (q.includes('manteiga') || q.includes('diacetil') || q.includes('pipoca') || q.includes('gordura')) {
    return {
      diagnosticTitle: 'Excesso de Diacetil (2,3-butanodiona) • Subproduto de Fermentação',
      chemicalCause:
        'O diacetil é produzido naturalmente pela levedura durante a fase exponencial como alfa-acetolactato. Se a cerveja for resfriada precocemente ou se a levedura for removida antes do tempo, o alfa-acetolactato oxida espontaneamente em diacetil, que não é reabsorvido pela biomassa ativa.',
      immediateAction:
        'Eleve imediatamente a temperatura do fermentador para 21°C - 23°C (Descanso de Diacetil) por 3 a 5 dias. Mantenha a levedura em contato com o mosto para que as células reabsorvam e reduzam o diacetil a acetoína e 2,3-butanodiol (compostos inodoros).',
      longTermPrevention: [
        'Respeite o tempo mínimo de fermentação primária antes de baixar a temperatura.',
        'Faça descanso de diacetil subindo 2°C a 3°C quando a atenuação atingir 75%-80% da meta.',
        'Garanta pitch rate adequado (mínimo de 0.75M a 1.0M células/mL/°P) e aeração correta no início.',
        'Evite contaminações por bactérias lácticas (Pediococcus / Lactobacillus).',
      ],
      expertQuote:
        'Cerveja caseira exige respeito ao metabolismo da levedura. Dê tempo e calor moderado no final da fermentação e ela faxinará o seu mosto!',
    };
  }

  if (q.includes('milho') || q.includes('dms') || q.includes('legume') || q.includes('vegetal') || q.includes('repolho')) {
    return {
      diagnosticTitle: 'DMS (Sulfeto de Dimetila) • Volatilização Insuficiente na Fervura',
      chemicalCause:
        'Originado do precursor S-metilmetionina (SMM), abundante em maltes claros (Pilsen). Durante a mostura e fervura o SMM converte-se em DMS livre. Se a fervura não for vigorosa ou ocorrer com a panela tampada, o gás condensado retorna ao mosto.',
      immediateAction:
        'Se o lote ainda estiver na panela, mantenha a fervura aberta e vigorosa por mais 15 a 20 minutos. Se já fermentou, você pode purgar suavemente CO₂ estéril pelo fundo do fermentador para arrastar parte dos compostos voláteis.',
      longTermPrevention: [
        'Ferver SEMPRE com a panela 100% destampada para permitir a evaporação livre dos voláteis.',
        'Manter taxa de evaporação vigorosa de 8% a 10% do volume por hora de fervura.',
        'Resfriar o mosto o mais rápido possível após o whirlpool (abaixo de 60°C em menos de 25 min).',
      ],
      expertQuote:
        'Panela tampada na fervura é armadilha para o DMS: deixe o vapor escapar livremente para o ar!',
    };
  }

  if (q.includes('papel') || q.includes('cartao') || q.includes('cartolina') || q.includes('oxida') || q.includes('velh') || q.includes('melado')) {
    return {
      diagnosticTitle: 'Oxidação Precoce (trans-2-nonenal) • Contato Excessivo com Oxigênio',
      chemicalCause:
        'Oxigênio dissolvido pós-fermentação reage com lipídios, alcoóis e ácidos graxos, formando aldeídos de cadeia longa (trans-2-nonenal) que conferem aroma de papelão molhado, cartolina e escurecimento do líquido.',
      immediateAction:
        'Mantenha as garrafas ou barril estritamente sob refrigeração próxima a 0°C - 2°C para desacelerar reações cinéticas de oxidação e consuma o lote o mais rápido possível.',
      longTermPrevention: [
        'Elimine qualquer respingo, aeração ou transferência aberta após o início da fermentação.',
        'Faça transferências fechadas com purga prévia de CO₂ em mangueiras e baldes de envase.',
        'No envase em garrafas com priming, use tampinhas com vedante scavengers (absorvedoras de O₂).',
      ],
      expertQuote:
        'Oxigênio antes da fermentação é vida para a levedura; após a fermentação, é o maior vilão da cerveja fresca.',
    };
  }

  if (q.includes('maca verde') || q.includes('acetaldeido') || q.includes('tinta') || q.includes('solvente')) {
    return {
      diagnosticTitle: 'Acetaldeído Excessivo • Fermentação Verde ou Interrompida Precocemente',
      chemicalCause:
        'O acetaldeído é o precursor químico direto do etanol na via metabólica da levedura. Quando a fermentação é cortada antes do término ou a levedura sofre estresse tóxico, o acetaldeído não é convertido em álcool.',
      immediateAction:
        'Não resfrie a cerveja. Mantenha o fermentador a 20°C - 22°C por mais 4 a 7 dias para que a levedura complete a via glicolítica.',
      longTermPrevention: [
        'Evite retirar a cerveja da levedura antes da densidade estabilizar por 3 dias consecutivos.',
        'Forneça nutrientes de levedura (Zinco e Aminoácidos) em mostos de alta gravidade.',
        'Controle a temperatura da fermentação para evitar choques térmicos.',
      ],
      expertQuote:
        'Paciência na maturação: o que parece cerveja verde hoje se transforma em ouro com mais alguns dias de tanque.',
    };
  }

  if (q.includes('travou') || q.includes('parou') || q.includes('densidade') || q.includes('emperr') || q.includes('sg alta') || q.includes('nao baixa')) {
    return {
      diagnosticTitle: 'Fermentação Emperrada / Densidade Travada (Stuck Fermentation)',
      chemicalCause:
        'Pode decorrer de: mostura em temperatura muito alta gerando muitas dextrinas não fermentáveis (>69°C), taxa de inoculação baixa, choque térmico brusco ou falta de nutrientes.',
      immediateAction:
        'Gire suavemente o fermentador (sem abrir nem aerar) para ressuspender a levedura decantada e eleve a temperatura para 22°C. Se após 48h não houver atenuação, adicione um novo sachê hidratado de levedura ativa (ex: SafAle US-05).',
      longTermPrevention: [
        'Calibre o termômetro da mostura: 65°C-66°C para corpo equilibrado e alta fermentabilidade.',
        'Sempre hidrate leveduras secas ou calcule starter para OG acima de 1.060.',
        'Mantenha a câmara de fermentação com histerese térmica curta (±0.5°C).',
      ],
      expertQuote:
        'Ressuspender a levedura no fundo e subir 2°C no termostato costuma salvar 90% das fermentações preguiçosas!',
    };
  }

  if (q.includes('amargo') || q.includes('adstring') || q.includes('casca') || q.includes('boca amarrando') || q.includes('banana verde') || q.includes('aspero')) {
    return {
      diagnosticTitle: 'Adstringência / Polifenóis Extraídos em Excesso (Taninos Ásperos)',
      chemicalCause:
        'Extração excessiva de taninos das cascas dos grãos provocada por água de lavagem acima de 78°C, pH da mostura/lavagem alcalino (>5.8) ou moagem com cascas excessivamente esmagadas/pulverizadas.',
      immediateAction:
        'Realize maturação a frio prolongada (Cold Crash a 0°C-2°C por 7 a 14 dias) com uso de clarificantes como gelatina sem sabor ou Biofine para precipitar polifenóis e proteínas pesadas.',
      longTermPrevention: [
        'Nunca deixe a temperatura da água de lavagem (sparge) ultrapassar 76°C-78°C.',
        'Acidifique a água de lavagem para pH 5.5 a 5.8 com ácido lático.',
        'Regule o moinho de rolos para abrir os grãos sem esfarelar as cascas.',
      ],
      expertQuote:
        'Casca de malte deve ser preservada: moagem correta e água de lavagem a 76°C garantem um amargor limpo e macio.',
    };
  }

  // Generic expert diagnostic
  return {
    diagnosticTitle: `Diagnóstico Técnico Cervejeiro: ${query.slice(0, 45)}...`,
    chemicalCause: `Com base nos sintomas relatados para a receita ${currentRecipe?.name || 'artesanal'}, o desvio sensorial costuma estar associado a variações na cinética de fermentação, controle térmico nas rampas de mostura ou estresse de levedura na inoculação.`,
    immediateAction:
      'Eleve a temperatura do fermentador em 2°C a 3°C por 3 a 5 dias para reativação enzimática da levedura, evitando qualquer exposição ao oxigênio atmosférico.',
    longTermPrevention: [
      'Monitore o pH da mostura entre 5.2 e 5.4 nos primeiros 15 minutos.',
      'Respeite o descanso de diacetil antes do resfriamento brusco (cold crash).',
      'Mantenha a sanitização rigorosa em todos os equipamentos que tocam o mosto frio.',
    ],
    expertQuote:
      'No laboratório cervejeiro da Democrata, cada detalhe de temperatura e tempo é o segredo para a cerveja perfeita!',
  };
}

export const OffFlavorMatrix: React.FC<OffFlavorMatrixProps> = ({ currentRecipe }) => {
  const [selectedFlavor, setSelectedFlavor] = useState<OffFlavorGuide>(OFF_FLAVORS_GUIDE[0]);
  const [searchFilter, setSearchFilter] = useState('');

  // Diagnostic state
  const [brewerQuery, setBrewerQuery] = useState('');
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const filteredFlavors = OFF_FLAVORS_GUIDE.filter(
    (f) =>
      f.namePt.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.chemical.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.sensory.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDiagnose = async (overrideQuery?: string) => {
    const q = (overrideQuery || brewerQuery).trim();
    if (!q) return;

    if (overrideQuery) {
      setBrewerQuery(overrideQuery);
    }

    setIsDiagnosing(true);
    setDiagnosticData(null);

    try {
      let resultData: any = null;

      // Try server endpoint
      try {
        const response = await fetch('/api/ai/troubleshoot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemDescription: q,
            recipeContext: currentRecipe
              ? { name: currentRecipe.name, style: currentRecipe.style?.name }
              : null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.diagnostic) {
            resultData = data.diagnostic;
          }
        }
      } catch (networkErr) {
        // Fallback gracefully without blocking user
      }

      // If server failed or offline, use robust local diagnostic engine
      if (!resultData) {
        resultData = generateLocalDiagnostic(q, currentRecipe);
      }

      setDiagnosticData(resultData);
    } catch (err) {
      console.error(err);
      setDiagnosticData(generateLocalDiagnostic(q, currentRecipe));
    } finally {
      setIsDiagnosing(false);
    }
  };

  const PRESET_SYMPTOMS = [
    { label: '🧈 Gosto/Cheiro de Manteiga ou Pipoca', query: 'Minha cerveja ficou com gosto e aroma de manteiga e pipoca de microondas' },
    { label: '🌽 Milho Verde ou Legumes Cozidos', query: 'Sinto cheiro e sabor de milho verde cozido e repolho na cerveja' },
    { label: '📦 Papelão / Gosto de Cerveja Velha', query: 'A cerveja escureceu e está com gosto de papelão molhado e melado oxidado' },
    { label: '🍏 Maçã Verde / Tinta Fresca', query: 'Aroma de maçã verde cortada, solvente e cerveja verde' },
    { label: '⛔ Fermentação Travada / Densidade Alta', query: 'A densidade travou em 1.025 e a fermentação parou antes da meta' },
    { label: '👅 Adstringência / Boca Amarrando', query: 'Sensação de boca amarrando, amargor áspero parecido com mastigar casca ou chá preto forte' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border border-amber-900/40 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Matriz de Controle Sensorial & Química
            </div>
            <h2 className="text-xl font-black text-white">
              Guia Completo de Off-Flavors & Diagnóstico Cervejeiro
            </h2>
          </div>
        </div>
        <p className="text-xs text-stone-300 max-w-2xl mt-1">
          Identifique causas químicas, reações microbiológicas e técnicas de prevenção para defeitos sensoriais (diacetil, DMS, acetaldeído, oxidação e adstringência).
        </p>
      </div>

      {/* Brewer Diagnostic Box */}
      <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Consultor Técnico em Fermentação & Desvios
          </div>
          <span className="text-[10px] font-mono text-amber-300/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
            Diagnóstico Instantâneo
          </span>
        </div>

        {/* Search input & Diagnostic Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={brewerQuery}
            onChange={(e) => setBrewerQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleDiagnose();
              }
            }}
            placeholder="Descreva o sintoma: Ex: Sabor de manteiga, milho cozido, papelão ou a densidade travou..."
            className="flex-1 bg-stone-950 border border-stone-700 text-stone-100 text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
          />
          <button
            type="button"
            onClick={() => handleDiagnose()}
            disabled={isDiagnosing || !brewerQuery.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-stone-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
          >
            {isDiagnosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Diagnosticar Desvio
          </button>
        </div>

        {/* Quick Symptom Chips */}
        <div>
          <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1.5 font-bold">
            Sintomas Frequentes (Clique para Diagnóstico Rápido):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SYMPTOMS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDiagnose(preset.query)}
                className="bg-stone-950 hover:bg-amber-950/60 text-stone-300 hover:text-amber-300 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-stone-800 hover:border-amber-500/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic Output Card */}
        {diagnosticData && (
          <div className="mt-4 bg-stone-950 border border-amber-500/40 rounded-2xl p-5 space-y-3.5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-amber-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{diagnosticData.diagnosticTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosticData(null)}
                className="text-stone-500 hover:text-stone-300 text-xs font-mono"
              >
                Fechar
              </button>
            </div>

            <div className="text-xs text-stone-300 leading-relaxed">
              <strong className="text-amber-400 block mb-0.5">🔬 Causa Química / Microbiológica:</strong>
              {diagnosticData.chemicalCause}
            </div>

            <div className="text-xs text-amber-100 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 shadow-inner">
              <strong className="text-amber-400 block mb-0.5">⚡ Ação Imediata de Socorro na Panela / Fermentador:</strong>
              {diagnosticData.immediateAction}
            </div>

            {diagnosticData.longTermPrevention && (
              <div>
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Prevenção para as Próximas Brassagens:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-stone-300">
                  {diagnosticData.longTermPrevention.map((prev: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {diagnosticData.expertQuote && (
              <div className="text-xs text-amber-300/90 italic border-t border-stone-800/80 pt-2.5 font-serif">
                "{diagnosticData.expertQuote}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Off-Flavor Matrix Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / List of Off-Flavors */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar defeito sensorial ou aroma..."
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner placeholder:text-stone-400 min-h-[40px]"
              style={{ WebkitAppearance: 'none' }}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredFlavors.map((flavor) => {
              const isSelected = selectedFlavor.id === flavor.id;
              return (
                <button
                  key={flavor.id}
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-stone-900/60 border-stone-800/80 text-stone-300 hover:bg-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{flavor.namePt}</div>
                    <div className="text-[10px] text-stone-400">{flavor.chemical}</div>
                  </div>
                  <div className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold bg-stone-800 text-stone-400">
                    {flavor.nameEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right / Detailed Off-Flavor Sheet */}
        <div className="lg:col-span-2 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold block mb-0.5">
                COMPOSTO QUÍMICO & PERCEPÇÃO SENSORIAL
              </span>
              <h3 className="text-2xl font-black text-white font-serif">{selectedFlavor.namePt}</h3>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">{selectedFlavor.chemical}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDiagnose(`Estou com suspeita de ${selectedFlavor.namePt} (${selectedFlavor.nameEn}) na minha cerveja`)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                <span>Diagnosticar este Desvio</span>
              </button>

              <div className="bg-stone-950 px-3 py-2 rounded-xl border border-stone-800 text-right">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Termo Internacional:</span>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedFlavor.nameEn}</span>
              </div>
            </div>
          </div>

          {/* Sensory Description */}
          <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
              Como Identificar no Copo (Aroma e Sabor):
            </span>
            <p className="text-stone-200 text-xs sm:text-sm font-medium">{selectedFlavor.sensory}</p>
          </div>

          {/* Causes */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4" /> Causas Principais no Processo Caseiro:
            </span>
            <ul className="space-y-1.5 text-xs text-stone-300 bg-stone-950/40 p-4 rounded-2xl border border-stone-800/80">
              {selectedFlavor.causes.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention & Fixes */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4" /> Como Prevenir e Corrigir na Panela:
            </span>
            <ul className="space-y-1.5 text-xs text-stone-300 bg-stone-950/40 p-4 rounded-2xl border border-stone-800/80">
              {selectedFlavor.prevention.map((prev, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{prev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffFlavorMatrix;
