import React, { useState } from 'react';
import brandLogoPng from '../assets/images/democrata_logo.png';
import brandExactJpg from '../assets/images/democrata_bier_exact_logo_1787682627196.jpg';

interface DemocrataLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showText?: boolean;
  variant?: 'badge' | 'circular' | 'horizontal' | 'stamp';
  customSizePx?: number;
}

export const DemocrataLogo: React.FC<DemocrataLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  variant = 'badge',
  customSizePx,
}) => {
  const [imgSourceIndex, setImgSourceIndex] = useState(0);

  const imageSources = [
    brandLogoPng,
    brandExactJpg,
    '/democrata-logo-512.png',
    '/democrata-logo.svg',
  ];

  const handleImgError = () => {
    if (imgSourceIndex < imageSources.length - 1) {
      setImgSourceIndex((prev) => prev + 1);
    }
  };

  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    '2xl': 'w-64 h-64',
    custom: '',
  };

  const currentSizeClass = sizeMap[size] || 'w-20 h-20';
  const inlineStyle = customSizePx ? { width: `${customSizePx}px`, height: `${customSizePx}px` } : {};

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Hop Emblem Icon */}
        <div className="relative w-11 h-11 rounded-full bg-stone-950 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={imageSources[imgSourceIndex]}
            alt="Democrata Bier"
            className="w-full h-full object-cover rounded-full"
            onError={handleImgError}
            loading="eager"
          />
        </div>

        {/* Typography */}
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-serif font-black tracking-[0.22em] text-amber-400 text-lg md:text-xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              DEMOCRATA
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-mono tracking-[0.45em] text-amber-200/90 font-bold uppercase">
              B I E R
            </span>
            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40 font-mono">
              EST. ARTESANAL
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full Circular Badge Replica of Democrata Bier
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none rounded-full overflow-hidden shrink-0 ${currentSizeClass} ${className}`}
      style={inlineStyle}
    >
      <img
        src={imageSources[imgSourceIndex]}
        alt="Democrata Bier Logo"
        className="w-full h-full object-cover rounded-full drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
        onError={handleImgError}
        loading="eager"
      />
    </div>
  );
};
