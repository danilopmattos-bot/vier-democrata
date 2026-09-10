import React, { useState } from 'react';
import { Beer, BookOpen, Flame, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { DemocrataLogo } from './DemocrataLogo';
import breweryScene from '../assets/images/brewmaster_cinematic_1787487688648.jpg';

interface PrivateGateProps {
  onUnlock: () => void;
}

const PIN_STORAGE_KEY = 'democrata_lab_private_pin';

export const PrivateGate: React.FC<PrivateGateProps> = ({ onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    const validPin = savedPin || '1984';

    if (pinInput.trim() === validPin) {
      localStorage.setItem('democrata_lab_unlocked_session', 'true');
      onUnlock();
      return;
    }

    setErrorMsg('PIN incorreto. Confira e tente de novo.');
    setPinInput('');
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#080604] text-stone-100 selection:bg-amber-300 selection:text-stone-950">
      <img src={breweryScene} alt="Cervejaria artesanal" className="absolute inset-0 h-full w-full object-cover object-[60%_50%] opacity-[0.6] saturate-[0.9]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#080604_0%,rgba(8,6,4,.98)_38%,rgba(8,6,4,.80)_62%,rgba(8,6,4,.28)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#080604_0%,transparent_42%,rgba(0,0,0,.42)_100%)]" />
      <div className="brew-noise absolute inset-0 opacity-[0.16]" />
      <div className="pointer-events-none absolute -left-36 top-[-10rem] h-[40rem] w-[40rem] rounded-full bg-amber-500/[0.12] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-12rem] right-[8%] h-[30rem] w-[30rem] rounded-full bg-orange-700/[0.10] blur-[130px]" />

      <section className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1560px] items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-14 xl:px-20">
        <div className="max-w-[690px] py-4 lg:py-12">
          <div className="mb-9 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-2xl" />
              <DemocrataLogo size="custom" customSizePx={72} variant="circular" className="relative" />
            </div>
            <div>
              <p className="font-serif text-[22px] font-black tracking-[0.15em] text-[#f5d995] sm:text-[25px]">DEMOCRATA</p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.42em] text-stone-500">Bier · Cerveja artesanal da casa</p>
            </div>
          </div>

          <div className="max-w-[650px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/[0.16] bg-amber-300/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> Seu caderno particular de cerveja
            </span>

            <h1 className="mt-5 font-serif text-[3rem] font-black leading-[0.92] tracking-[-0.055em] text-[#fff8eb] sm:text-[4.35rem] lg:text-[4.8rem]">
              Da primeira água<br />
              <span className="brew-gold-text">ao primeiro gole.</span>
            </h1>

            <p className="mt-6 max-w-[540px] text-sm leading-7 text-stone-400 sm:text-[15px]">
              As receitas da Democrata, os números do lote e o roteiro da brassagem. Sem transformar a cerveja em laboratório complicado.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3 py-2 text-[9px] font-bold text-stone-400 backdrop-blur-md"><BookOpen className="h-3.5 w-3.5 text-amber-300" /> Receitas</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3 py-2 text-[9px] font-bold text-stone-400 backdrop-blur-md"><Flame className="h-3.5 w-3.5 text-orange-300" /> Modo brassagem</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3 py-2 text-[9px] font-bold text-stone-400 backdrop-blur-md"><Beer className="h-3.5 w-3.5 text-amber-300" /> Histórico da casa</span>
            </div>
          </div>

          <form onSubmit={handleVerify} className="mt-9 max-w-[470px] rounded-[28px] border border-white/[0.11] bg-[#0b0806]/70 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-5">
            <div className="flex items-center justify-between gap-3 px-1">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold text-stone-300"><LockKeyhole className="h-4 w-4 text-amber-300" /> Acesso à bancada</span>
              <span className="text-[9px] font-semibold text-stone-700">PIN padrão 1984</span>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2.5">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="••••"
                className="min-w-0 rounded-2xl border border-white/[0.1] bg-black/45 px-4 py-3.5 text-center font-mono text-xl font-black tracking-[0.42em] text-amber-100 outline-none transition-all placeholder:text-stone-800 focus:border-amber-300/40 focus:bg-black/60"
                autoFocus
                aria-label="PIN de acesso"
              />
              <button type="submit" className="brew-primary-button inline-flex min-w-[118px] items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-black">
                <KeyRound className="h-4 w-4" /> Entrar
              </button>
            </div>

            {errorMsg && <p className="mt-3 rounded-xl border border-red-400/[0.14] bg-red-950/30 px-3 py-2 text-[10px] font-semibold text-red-300">{errorMsg}</p>}

            <div className="mt-3 flex items-center gap-2 px-1 text-[9px] leading-relaxed text-stone-700">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-stone-600" />
              As receitas continuam salvas neste navegador.
            </div>
          </form>
        </div>

        <div className="relative hidden min-h-[650px] items-end justify-end lg:flex">
          <div className="absolute bottom-[9%] right-[3%] h-[72%] w-[78%] rounded-[44px] border border-white/[0.09] bg-white/[0.02] shadow-[0_38px_100px_rgba(0,0,0,.5)] backdrop-blur-[2px]" />
          <div className="relative z-10 mb-[9%] mr-[5%] w-[310px] rotate-[1.6deg] overflow-hidden rounded-[32px] border border-white/[0.14] bg-[#120e0a] p-2.5 shadow-[0_34px_90px_rgba(0,0,0,.58)] transition-transform duration-700 hover:rotate-0 hover:scale-[1.02]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-black">
              <img src="/brewmaster.jpg" alt="Foto da casa com uma cerveja" className="h-full w-full object-cover object-center saturate-[0.88]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/10" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[8px] font-black uppercase tracking-[0.24em] text-amber-200/80">Da casa</p>
                <p className="mt-1 font-serif text-lg font-black text-white">Feita por quem bebe.</p>
                <p className="mt-1 text-[9px] text-stone-300/75">A receita pode mudar. O ritual fica.</p>
              </div>
            </div>
          </div>

          <div className="absolute right-[39%] top-[15%] z-20 rounded-full border border-amber-300/15 bg-black/45 p-2 shadow-2xl backdrop-blur-xl">
            <DemocrataLogo size="custom" customSizePx={76} variant="circular" />
          </div>
        </div>
      </section>
    </main>
  );
};
