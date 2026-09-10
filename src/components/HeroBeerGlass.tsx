import React, { useId } from 'react';
import { DemocrataLogo } from './DemocrataLogo';

interface HeroBeerGlassProps {
  colorHex: string;
  name: string;
  styleName: string;
  abv: number;
  ibu: number;
}

export const HeroBeerGlass: React.FC<HeroBeerGlassProps> = ({
  colorHex,
  name,
  styleName,
  abv,
  ibu,
}) => {
  const uid = useId().replace(/:/g, '');
  const glassClip = `glass-${uid}`;
  const beerGradient = `beer-${uid}`;
  const foamGradient = `foam-${uid}`;
  const glassGradient = `shell-${uid}`;
  const glow = `glow-${uid}`;

  return (
    <div className="relative mx-auto flex w-full max-w-[430px] flex-col items-center justify-center select-none">
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] opacity-35"
        style={{ backgroundColor: colorHex }}
      />
      <div className="pointer-events-none absolute bottom-5 left-1/2 h-8 w-56 -translate-x-1/2 rounded-full bg-black/80 blur-xl" />

      <svg
        viewBox="0 0 360 500"
        role="img"
        aria-label={`Copo de ${name}`}
        className="relative z-10 h-[390px] w-[280px] sm:h-[440px] sm:w-[315px] drop-shadow-[0_35px_28px_rgba(0,0,0,0.72)]"
      >
        <defs>
          <clipPath id={glassClip}>
            <path d="M68 55 Q180 36 292 55 L267 390 Q260 449 180 454 Q100 449 93 390 Z" />
          </clipPath>
          <linearGradient id={beerGradient} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff2a8" stopOpacity="0.7" />
            <stop offset="18%" stopColor={colorHex} stopOpacity="0.94" />
            <stop offset="58%" stopColor={colorHex} />
            <stop offset="100%" stopColor="#2b0d00" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id={foamGradient} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffef7" />
            <stop offset="55%" stopColor="#f6ead2" />
            <stop offset="100%" stopColor="#d8c5a1" />
          </linearGradient>
          <linearGradient id={glassGradient} x1="0" x2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.58" />
            <stop offset="12%" stopColor="white" stopOpacity="0.05" />
            <stop offset="52%" stopColor="white" stopOpacity="0" />
            <stop offset="88%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0.48" />
          </linearGradient>
          <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath={`url(#${glassClip})`}>
          <rect x="55" y="118" width="250" height="350" fill={`url(#${beerGradient})`} />
          <ellipse cx="180" cy="123" rx="116" ry="16" fill="#fff7e7" opacity="0.95" />

          <g fill={`url(#${foamGradient})`}>
            <circle cx="89" cy="114" r="22" />
            <circle cx="116" cy="106" r="29" />
            <circle cx="148" cy="110" r="27" />
            <circle cx="176" cy="101" r="34" />
            <circle cx="210" cy="108" r="30" />
            <circle cx="241" cy="102" r="27" />
            <circle cx="270" cy="115" r="24" />
            <rect x="72" y="108" width="218" height="35" rx="16" />
          </g>

          <g fill="white" opacity="0.68">
            <circle cx="113" cy="101" r="2.2" />
            <circle cx="134" cy="116" r="1.8" />
            <circle cx="158" cy="95" r="2.6" />
            <circle cx="191" cy="112" r="1.7" />
            <circle cx="220" cy="99" r="2.4" />
            <circle cx="249" cy="116" r="1.9" />
          </g>

          <g fill="#fffbe8" opacity="0.72">
            {[
              [112, 370, 3], [132, 326, 2.4], [151, 282, 2.1], [176, 342, 2.7],
              [198, 302, 2.2], [220, 359, 2.5], [242, 274, 2], [98, 245, 1.8],
              [165, 223, 1.7], [207, 244, 1.8], [258, 326, 2.2], [184, 188, 1.9],
            ].map(([cx, cy, r], index) => (
              <circle key={index} cx={cx} cy={cy} r={r}>
                <animate attributeName="cy" values={`${cy};${Number(cy) - 95};${cy}`} dur={`${2.8 + index * 0.12}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.85;0.15" dur={`${2.8 + index * 0.12}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          <path d="M95 128 C120 170 106 258 123 418" stroke="white" strokeOpacity="0.24" strokeWidth="13" fill="none" />
          <path d="M256 135 C236 190 247 300 236 411" stroke="#fffbd9" strokeOpacity="0.12" strokeWidth="8" fill="none" />
          <ellipse cx="180" cy="403" rx="75" ry="28" fill="#ffb42a" opacity="0.16" filter={`url(#${glow})`} />
        </g>

        <path
          d="M68 55 Q180 36 292 55 L267 390 Q260 449 180 454 Q100 449 93 390 Z"
          fill={`url(#${glassGradient})`}
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="4"
        />
        <ellipse cx="180" cy="55" rx="112" ry="17" fill="none" stroke="white" strokeOpacity="0.78" strokeWidth="4" />
        <ellipse cx="180" cy="452" rx="76" ry="12" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.5" strokeWidth="3" />

        <g fill="white" opacity="0.78">
          <ellipse cx="82" cy="183" rx="4" ry="7" />
          <ellipse cx="95" cy="232" rx="3" ry="5" />
          <ellipse cx="276" cy="202" rx="3.5" ry="6" />
          <ellipse cx="261" cy="286" rx="2.8" ry="5" />
          <ellipse cx="107" cy="304" rx="2.5" ry="4" />
        </g>

        <foreignObject x="132" y="227" width="96" height="96" opacity="0.45">
          <div className="flex h-full w-full items-center justify-center">
            <DemocrataLogo size="custom" customSizePx={86} variant="circular" />
          </div>
        </foreignObject>
      </svg>

      <div className="relative z-20 -mt-8 w-full max-w-[330px] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-center backdrop-blur-xl shadow-2xl">
        <p className="truncate font-serif text-base font-black text-[#fff5dc]">{name}</p>
        <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/75">{styleName}</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-300">
          <span>{abv.toFixed(1)}% álcool</span>
          <span className="text-stone-600">•</span>
          <span>{Math.round(ibu)} IBU</span>
        </div>
      </div>
    </div>
  );
};
