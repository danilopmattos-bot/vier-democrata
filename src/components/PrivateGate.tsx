import React, { useState } from 'react';
import { Beer, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { DemocrataLogo } from './DemocrataLogo';

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
    <main className="relative min-h-screen overflow-hidden bg-[#090806] text-stone-100 selection:bg-amber-400 selection:text-stone-950">
      {/* Brewery photograph becomes the atmosphere on mobile and the visual half on desktop. */}
      <div className="absolute inset-0 lg:left-[48%]">
        <img
          src="/brewmaster.jpg"
          alt="Cervejeiro da Democrata Bier com uma cerveja artesanal"
          className="h-full w-full object-cover object-center scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090806] via-[#090806]/90 to-[#090806]/28 lg:from-[#090806] lg:via-[#090806]/65 lg:to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090806] via-transparent to-black/35" />
      </div>

      <div className="pointer-events-none absolute -left-28 top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-amber-500/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[35%] h-[32rem] w-[32rem] rounded-full bg-orange-900/[0.10] blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] items-center px-5 py-10 sm:px-8 lg:px-14 xl:px-20">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center gap-4">
            <DemocrataLogo size="custom" customSizePx={68} variant="circular" />
            <div>
              <p className="font-serif text-xl font-black tracking-[0.16em] text-[#f3d38d] sm:text-2xl">DEMOCRATA</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.38em] text-stone-500">Bier · Cerveja feita em casa</p>
            </div>
          </div>

          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
              <Beer className="h-3.5 w-3.5" /> Caderno de brassagens
            </span>

            <h1 className="mt-5 font-serif text-4xl font-black leading-[1.02] tracking-[-0.035em] text-[#fff8ec] sm:text-5xl lg:text-[3.55rem]">
              Suas receitas.<br />Sua panela.<br /><span className="text-amber-300">Sua cerveja.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
              Receitas, ingredientes, medidas e o passo a passo da brassagem reunidos em um lugar simples de usar.
            </p>
          </div>

          <form onSubmit={handleVerify} className="mt-8 max-w-md rounded-[28px] border border-white/10 bg-black/[0.35] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-5">
            <label className="block">
              <span className="flex items-center justify-between gap-3 text-xs font-bold text-stone-300">
                <span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-amber-300" /> PIN de acesso</span>
                <span className="text-[10px] font-medium text-stone-600">Padrão: 1984</span>
              </span>
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
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0d0b08]/90 px-4 py-3.5 text-center font-mono text-2xl font-black tracking-[0.38em] text-amber-200 outline-none transition-colors placeholder:text-stone-700 focus:border-amber-400/45"
                autoFocus
                aria-label="PIN de acesso"
              />
            </label>

            {errorMsg && (
              <p className="mt-3 rounded-xl border border-red-400/15 bg-red-950/30 px-3 py-2 text-xs text-red-300">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-stone-950 shadow-[0_12px_35px_rgba(245,158,11,0.18)] transition-colors hover:bg-amber-300"
            >
              <KeyRound className="h-4 w-4" /> Entrar
            </button>
          </form>

          <div className="mt-5 flex max-w-md items-center gap-2 text-[10px] leading-relaxed text-stone-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-stone-500" />
            As receitas continuam salvas neste navegador, como no projeto original.
          </div>
        </div>
      </section>
    </main>
  );
};
