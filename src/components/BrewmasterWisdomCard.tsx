import React, { useState } from 'react';
import { Sparkles, Quote, Award, Volume2, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { DemocrataLogo } from './DemocrataLogo';
import brewmasterImg from '../assets/images/democrata_brewmaster_real_1787840969369.jpg';

interface BrewmasterWisdomCardProps {
  onOpenAIForge: () => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  recipeName: string;
  styleName: string;
}

const BREWMASTER_PROVERBS = [
  {
    quote: "Cerveja boa nasce da paciência no fogo, respeito à levedura e do amor pelo lúpulo fresco.",
    tip: "Dica de Ouro: Nunca ferva com a panela tampada! Deixe os compostos sulfurosos (DMS) evaporarem livremente.",
    author: "Mestre Democrata (38 anos de brassagens)",
  },
  {
    quote: "O densímetro não mente e o teste do iodo não perdoa. Faça tudo sem pressa, que a cerveja agradece.",
    tip: "Dica de Ouro: Controle a temperatura nos primeiros 3 dias de fermentação — é onde 80% do perfil de ésteres é selado.",
    author: "Mestre Democrata (Velha Guarda)",
  },
  {
    quote: "A água é a alma da panela. Acerte os sais e o lúpulo vai brilhar no copo com elegância pura.",
    tip: "Dica de Ouro: Para IPAs resinosas, privilegie o Sulfato; para New Englands aveludadas, dobre o Cloreto de Cálcio.",
    author: "Mestre Democrata",
  },
  {
    quote: "Quem tem pressa bebe cerveja verde com gosto de maçã verde e diacetil. Dê 3 dias de descanso a 20°C antes do cold crash.",
    tip: "Dica de Ouro: Suba 2°C a 3°C a temperatura perto do fim da fermentação para a levedura reabsorver o diacetil.",
    author: "Mestre Democrata",
  },
];

export const BrewmasterWisdomCard: React.FC<BrewmasterWisdomCardProps> = ({
  onOpenAIForge,
  seniorMode,
  onToggleSeniorMode,
  recipeName,
  styleName,
}) => {
  const [proverbIndex, setProverbIndex] = useState(0);

  const currentProverb = BREWMASTER_PROVERBS[proverbIndex];

  const handleNextProverb = () => {
    setProverbIndex((prev) => (prev + 1) % BREWMASTER_PROVERBS.length);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-600/40 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 p-5 md:p-7 shadow-2xl">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Portrait & Official Logo Emblem */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center gap-4 text-center sm:text-left lg:text-center">
          {/* Master Brewer Portrait with Official Democrata Badge overlay */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] relative">
              <img
                src="/brewmaster.jpg"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('brewmaster.jpg')) {
                    target.src = '/brewmaster.png';
                  } else if (target.src.includes('brewmaster.png')) {
                    target.src = brewmasterImg;
                  }
                }}
                alt="Mestre Cervejeiro Democrata"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            </div>

            {/* Official Badge Pin */}
            <div className="absolute -bottom-3 -right-3 w-16 h-16 transform rotate-6 hover:rotate-0 transition-transform">
              <DemocrataLogo size="custom" customSizePx={64} variant="circular" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-2">
              <span className="text-amber-400 font-serif font-black tracking-widest text-sm uppercase">
                DEMOCRATA BIER
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-white font-black text-lg md:text-xl tracking-tight">
              O Velho Mestre Cervejeiro
            </h3>
            <p className="text-stone-400 text-xs mt-0.5">
              Engenharia, Tradição & Fogo na Panela
            </p>
          </div>
        </div>

        {/* Middle Column: Wisdom, Proverbs & Quick Advice */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400/90 font-bold flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-amber-500" />
              Sabedoria de Bancada
            </span>
            <button
              onClick={handleNextProverb}
              className="text-[11px] text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1 bg-stone-900/80 px-2 py-0.5 rounded-lg border border-stone-800"
            >
              Outro conselho <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-stone-950/80 border border-amber-900/30 rounded-2xl p-4 relative shadow-inner">
            <p className="text-amber-100 font-serif text-sm md:text-base italic leading-relaxed">
              "{currentProverb.quote}"
            </p>
            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-start gap-2 text-xs text-amber-300 font-medium">
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                PRO TIP
              </span>
              <span>{currentProverb.tip}</span>
            </div>
          </div>

          {/* Quick Recipe Info Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-400">Trabalhando agora em:</span>
            <span className="bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold">
              {recipeName} ({styleName})
            </span>
          </div>
        </div>

        {/* Right Column: Senior Friendly Mode Toggle & AI Forge Action */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Senior Accessibility Toggle */}
          <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-stone-200">
                Modo Velha Guarda (60+)
              </span>
              <button
                type="button"
                onClick={onToggleSeniorMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  seniorMode ? 'bg-amber-500' : 'bg-stone-800'
                }`}
                title="Ativar letras maiores e alto contraste para visualização fácil na cervejaria"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    seniorMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              Letras grandes, alto contraste e botões ampliados para enxergar sem óculos durante a brassagem.
            </p>
          </div>

          {/* AI Forge Button */}
          <button
            type="button"
            onClick={onOpenAIForge}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black p-3 rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-stone-950" />
            <span>Pedir ajuda à IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
