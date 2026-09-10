import React, { useState, useEffect, useRef } from 'react';
import { srmToHex } from '../utils/brewingCalculations';
import { DemocrataLogo } from './DemocrataLogo';
import { Volume2, Sparkles, Flame, Eye, Droplet, RefreshCw, Play, RotateCw } from 'lucide-react';
import { triggerProstCelebration } from '../utils/dopamineEffects';

interface VisualBeerGlassProps {
  srm: number;
  ebc: number;
  abv: number;
  ibu: number;
  name: string;
  styleName: string;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  opacity: number;
  nucleationPoint: number;
}

interface CondensationDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  length: number;
  opacity: number;
}

export const VisualBeerGlass: React.FC<VisualBeerGlassProps> = ({
  srm,
  ebc,
  abv,
  ibu,
  name,
  styleName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liquidColor = srmToHex(srm);

  // Style characteristics
  const isHazy = /hazy|neipa|new england|witbier|weizen|weiss|juicy/i.test(styleName || name);
  const isStout = srm >= 24 || /stout|porter|schwarzbier|black/i.test(styleName || name);
  const isLager = srm <= 7 || /pils|lager|helles|kolsch|blonde/i.test(styleName || name);
  const isRedAle = (srm >= 12 && srm <= 20) || /red|amber|irish|bock|copper/i.test(styleName || name);

  const foamColor = isStout ? '#dfceb7' : srm > 14 ? '#f6ede0' : '#ffffff';

  const [isClinking, setIsClinking] = useState(false);
  const [glassTilt, setGlassTilt] = useState({ x: 0, y: 0 });
  const [fillLevel, setFillLevel] = useState(0.86); // 0 to 1
  const [isPouring, setIsPouring] = useState(false);
  const swirlForceRef = useRef(0);

  // Sound and Toast
  const handleToastSound = (e: React.MouseEvent) => {
    setIsClinking(true);
    triggerProstCelebration(e);
    swirlForceRef.current = 8;
    setTimeout(() => setIsClinking(false), 700);
  };

  const handleSwirl = (e: React.MouseEvent) => {
    e.stopPropagation();
    swirlForceRef.current += 12;
  };

  const handleRePour = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPouring) return;
    setIsPouring(true);
    setFillLevel(0.1);
    let cur = 0.1;
    const interval = setInterval(() => {
      cur += 0.04;
      if (cur >= 0.86) {
        setFillLevel(0.86);
        setIsPouring(false);
        clearInterval(interval);
      } else {
        setFillLevel(cur);
      }
    }, 40);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setGlassTilt({ x, y });
    swirlForceRef.current = Math.min(swirlForceRef.current + Math.abs(x) * 0.1, 15);
  };

  const handleMouseLeave = () => {
    setGlassTilt({ x: 0, y: 0 });
  };

  // ==========================================
  // REAL-TIME 60FPS FLUID CANVAS PHYSICS ENGINE
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Simulation Dimensions
    const width = 240;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    // Initialize 80 physical carbonation bubbles
    const bubbles: Bubble[] = [];
    const bubbleCount = isStout ? 45 : isHazy ? 65 : 95;
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 80) + 60,
        radius: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 1.2 + 0.8,
        wobbleSpeed: Math.random() * 3 + 2,
        wobbleOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.7 + 0.3,
        nucleationPoint: (Math.floor(Math.random() * 8) / 8) * (width - 60) + 30,
      });
    }

    // Initialize water drops on outer glass surface
    const drops: CondensationDrop[] = [];
    for (let i = 0; i < 14; i++) {
      drops.push({
        x: Math.random() * (width - 30) + 15,
        y: Math.random() * (height - 60) + 20,
        radius: Math.random() * 1.6 + 0.8,
        speed: Math.random() * 0.25 + 0.05,
        length: Math.random() * 8 + 2,
        opacity: Math.random() * 0.6 + 0.4,
      });
    }

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace('#', '');
      const bigint = parseInt(cleaned, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    };

    const baseRgb = hexToRgb(liquidColor);

    const render = () => {
      time += 0.035;
      ctx.clearRect(0, 0, width, height);

      // Decay swirl force smoothly
      if (swirlForceRef.current > 0.05) {
        swirlForceRef.current *= 0.96;
      } else {
        swirlForceRef.current = 0;
      }

      const curSwirl = swirlForceRef.current;
      const liquidTopY = height * (1 - fillLevel);
      const waveAmplitude = 3 + curSwirl * 0.8 + Math.abs(glassTilt.x) * 0.4;
      const waveFreq = 0.03;

      // 1. BEER GLASS INNER CONTOUR CLIPPING
      ctx.save();
      ctx.beginPath();
      // Curved Tulip glass contour
      ctx.moveTo(25, 20);
      ctx.lineTo(width - 25, 20);
      ctx.bezierCurveTo(width - 20, 100, width - 15, 260, width - 35, height - 20);
      ctx.lineTo(35, height - 20);
      ctx.bezierCurveTo(15, 260, 20, 100, 25, 20);
      ctx.closePath();
      ctx.clip();

      // 2. LIQUID BODY WITH FLUID SINE WAVES
      ctx.beginPath();
      ctx.moveTo(0, height);

      // Start wave line
      const surfacePoints: { x: number; y: number }[] = [];
      const step = 4;
      for (let x = 0; x <= width; x += step) {
        const tiltDisplacement = ((x - width / 2) / (width / 2)) * (glassTilt.x * 1.5);
        const y =
          liquidTopY +
          Math.sin(time * 2.5 + x * waveFreq) * waveAmplitude * 0.7 +
          Math.cos(time * 1.8 + x * (waveFreq * 1.5)) * waveAmplitude * 0.3 +
          tiltDisplacement;
        surfacePoints.push({ x, y });
        if (x === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Multi-layer Photorealistic Liquid Gradient Shader
      const liquidGrad = ctx.createLinearGradient(0, liquidTopY, width, height);
      if (isStout) {
        liquidGrad.addColorStop(0, `rgba(${baseRgb.r + 20}, ${baseRgb.g + 5}, ${baseRgb.b}, 0.98)`);
        liquidGrad.addColorStop(0.5, `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 1)`);
        liquidGrad.addColorStop(1, 'rgba(5, 2, 0, 1)');
      } else if (isHazy) {
        liquidGrad.addColorStop(0, `rgba(${baseRgb.r + 30}, ${baseRgb.g + 20}, ${baseRgb.b}, 0.95)`);
        liquidGrad.addColorStop(0.5, `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 0.96)`);
        liquidGrad.addColorStop(1, `rgba(${Math.max(baseRgb.r - 30, 0)}, ${Math.max(baseRgb.g - 30, 0)}, 0, 1)`);
      } else {
        // Crystal Lager / IPA with warm core
        liquidGrad.addColorStop(0, `rgba(${baseRgb.r + 40}, ${baseRgb.g + 25}, ${baseRgb.b + 10}, 0.9)`);
        liquidGrad.addColorStop(0.4, `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 0.95)`);
        liquidGrad.addColorStop(1, `rgba(${Math.max(baseRgb.r - 45, 10)}, ${Math.max(baseRgb.g - 45, 5)}, 0, 1)`);
      }

      ctx.fillStyle = liquidGrad;
      ctx.fill();

      // 3. DYNAMIC VOLUMETRIC CAUSTICS LIGHT RAYS (Cinema Glow)
      if (!isStout) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const causticsOffset = Math.sin(time * 1.5) * 20;
        const causticGrad = ctx.createLinearGradient(
          width * 0.2 + causticsOffset,
          liquidTopY,
          width * 0.8 - causticsOffset,
          height
        );
        causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        causticGrad.addColorStop(0.45, isHazy ? 'rgba(255, 240, 180, 0.18)' : 'rgba(255, 255, 220, 0.35)');
        causticGrad.addColorStop(0.55, isHazy ? 'rgba(255, 240, 180, 0.25)' : 'rgba(255, 255, 255, 0.45)');
        causticGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = causticGrad;
        ctx.fill();
        ctx.restore();
      }

      // 4. MICRO-CARBONATION PARTICLES SIMULATION (BUBBLE FLOW)
      ctx.save();
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= b.speed + curSwirl * 0.1;
        b.x += Math.sin(time * b.wobbleSpeed + b.wobbleOffset) * 0.6;

        // Bubble bursts at liquid surface
        if (b.y < liquidTopY + 4) {
          b.y = height - 25 - Math.random() * 20;
          b.x = b.nucleationPoint + (Math.random() * 16 - 8);
        }

        // Render realistic sphere bubble with light dot
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * (isStout ? 0.6 : 0.9)})`;
        ctx.fill();

        // Bubble highlight reflection dot
        if (b.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fill();
        }
      }
      ctx.restore();

      // 5. REALISTIC 3D FOAM HEAD (COLARINHO CREMOSO VIVO)
      const foamHeight = isPouring ? 48 : 34;
      ctx.save();
      ctx.beginPath();
      // Top of foam curve
      ctx.moveTo(0, liquidTopY - foamHeight);
      for (let x = 0; x <= width; x += step) {
        const topY =
          liquidTopY -
          foamHeight +
          Math.sin(time * 2 + x * 0.04) * (waveAmplitude * 0.4) +
          ((x - width / 2) / (width / 2)) * (glassTilt.x * 0.8);
        ctx.lineTo(x, topY);
      }
      // Bottom of foam (connected to liquid wave)
      for (let x = width; x >= 0; x -= step) {
        const botY =
          liquidTopY +
          Math.sin(time * 2.5 + x * waveFreq) * waveAmplitude * 0.7 +
          Math.cos(time * 1.8 + x * (waveFreq * 1.5)) * waveAmplitude * 0.3 +
          ((x - width / 2) / (width / 2)) * (glassTilt.x * 1.5);
        ctx.lineTo(x, botY);
      }
      ctx.closePath();

      // Foam 3D Cream Shading
      const foamGrad = ctx.createLinearGradient(0, liquidTopY - foamHeight, 0, liquidTopY + 10);
      foamGrad.addColorStop(0, '#ffffff');
      foamGrad.addColorStop(0.3, foamColor);
      foamGrad.addColorStop(0.85, foamColor);
      foamGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = foamGrad;
      ctx.fill();

      // Foam Micro-Bubbles Texture Layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let f = 0; f < 30; f++) {
        const fx = (Math.sin(f * 99 + time) * 0.5 + 0.5) * (width - 50) + 25;
        const fy = liquidTopY - Math.random() * foamHeight * 0.8;
        ctx.fillRect(fx, fy, 1.5, 1.5);
      }
      ctx.restore();

      // 6. BELGIAN FOAM LACING (Anéis de espuma seca grudados no vidro)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      [30, 75, 130, 190].forEach((laceY) => {
        if (laceY > liquidTopY - foamHeight) {
          ctx.beginPath();
          ctx.ellipse(width / 2, laceY, width * 0.38, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // 7. EXTERNAL CONDENSATION WATER RUNOFF DROPS (Gotículas escorrendo)
      ctx.save();
      for (let d = 0; d < drops.length; d++) {
        const drop = drops[d];
        drop.y += drop.speed;
        if (drop.y > height - 30) {
          drop.y = 20;
          drop.x = Math.random() * (width - 40) + 20;
        }

        // Draw tear drop with glassy highlight
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, drop.radius, drop.length, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
        ctx.fill();

        // Drop specular light reflection
        ctx.beginPath();
        ctx.arc(drop.x - 0.5, drop.y - drop.length * 0.3, drop.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
      }
      ctx.restore();

      // 8. STUDIO SPECULAR REFLECTION EDGES (Glass Sheen)
      ctx.save();
      const leftSheen = ctx.createLinearGradient(0, 0, 35, 0);
      leftSheen.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      leftSheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      leftSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = leftSheen;
      ctx.fillRect(0, 0, 35, height);

      const rightSheen = ctx.createLinearGradient(width - 25, 0, width, 0);
      rightSheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rightSheen.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      rightSheen.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
      ctx.fillStyle = rightSheen;
      ctx.fillRect(width - 25, 0, 25, height);
      ctx.restore();

      ctx.restore(); // End clipping

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [liquidColor, fillLevel, isPouring, isStout, isHazy, foamColor, glassTilt]);

  return (
    <div
      className="relative flex flex-col items-center justify-between p-5 metal-steel rounded-3xl border border-stone-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden group h-full select-none transition-all duration-300"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Cinematic Volumetric Lighting & Floor Shadow */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 opacity-40 blur-3xl transition-all duration-1000 pointer-events-none rounded-full"
        style={{ backgroundColor: liquidColor }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Header Info Bar */}
      <div className="w-full flex items-center justify-between z-20 mb-1">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-extrabold flex items-center gap-1">
            FLUID ENGINE 60FPS
          </span>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSwirl}
            className="text-[10px] bg-stone-900/90 hover:bg-stone-800 text-stone-300 px-2 py-1 rounded-lg border border-stone-700 font-mono font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Agitar / Fazer Redemoinho"
          >
            <RotateCw className="w-3 h-3 text-amber-400" />
            <span>Girar</span>
          </button>

          <button
            onClick={handleRePour}
            className="text-[10px] bg-stone-900/90 hover:bg-amber-500/20 text-amber-300 px-2 py-1 rounded-lg border border-amber-500/40 font-mono font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Servir Chopp / Encher Copo"
          >
            <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Servir</span>
          </button>
        </div>
      </div>

      {/* 2. REAL CANVAS FLUID SIMULATOR IN 3D GLASS VESSEL */}
      <div
        className={`relative w-52 h-76 flex flex-col items-center justify-end my-1 cursor-pointer transition-all duration-200 ${
          isClinking ? 'scale-110 rotate-6 -translate-y-2' : ''
        }`}
        style={{
          transform: isClinking
            ? 'scale(1.1) rotate(6deg) translateY(-8px)'
            : `perspective(1000px) rotateX(${glassTilt.y}deg) rotateY(${glassTilt.x}deg)`,
        }}
        onClick={handleToastSound}
      >
        {/* Floor Contact Occlusion Shadow */}
        <div className="absolute -bottom-2 w-36 h-4 bg-black/90 rounded-full blur-[4px] z-0" />
        <div
          className="absolute -bottom-1 w-28 h-2 rounded-full blur-[2px] opacity-60 z-0 transition-colors duration-500"
          style={{ backgroundColor: liquidColor }}
        />

        {/* 3D Glass Shell Frame */}
        <div className="relative w-44 flex flex-col items-center z-10">
          {/* Glass Outer Rim */}
          <div className="w-36 h-3 bg-gradient-to-r from-white/70 via-white/90 to-white/60 rounded-full border border-white shadow-[0_2px_8px_rgba(255,255,255,0.4)] z-30 mb-[-6px]" />

          {/* HTML5 REAL-TIME FLUID SIMULATION CANVAS */}
          <div className="relative w-40 h-64 border-x-[3px] border-b-[3px] border-white/50 rounded-b-[2.5rem] overflow-hidden shadow-[inset_0_0_25px_rgba(255,255,255,0.25),_0_25px_50px_rgba(0,0,0,0.95)] flex items-center justify-center backdrop-blur-[1px]">
            {/* The Live 60FPS Video-Like Fluid Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Brand Logo Watermark centered in the live fluid */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none transform scale-80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <DemocrataLogo size="custom" customSizePx={95} variant="circular" />
            </div>
          </div>

          {/* Glass Heavy Solid Base */}
          <div className="w-28 h-5 bg-gradient-to-b from-white/70 via-white/30 to-stone-950/80 rounded-full border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.95)] -mt-2 z-30 backdrop-blur-lg flex items-center justify-center">
            <div className="w-16 h-1.5 bg-white/50 rounded-full blur-[0.5px]" />
          </div>
        </div>
      </div>

      {/* 3. Optical Specs & Controls Readout */}
      <div className="mt-2 text-center w-full z-20">
        <h4 className="text-base font-serif font-black text-amber-200 truncate max-w-[260px] mx-auto tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {name}
        </h4>
        <div className="flex items-center justify-center gap-2 my-1">
          <span className="text-[12px] text-amber-400 font-semibold truncate max-w-[210px]">
            {styleName}
          </span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold">
            Simulador de Fluidos Ativo
          </span>
        </div>

        {/* Color Specimen & Physics Meter */}
        <div className="flex items-center justify-between text-[11px] font-mono bg-stone-950/95 px-3.5 py-2 rounded-2xl border border-stone-700/80 text-stone-300 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] mt-2.5">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border-2 border-white/90 shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-colors duration-500"
              style={{ backgroundColor: liquidColor }}
            />
            <span className="font-extrabold text-amber-300">{srm} SRM</span>
          </div>
          <span className="text-stone-600 font-bold">•</span>
          <div className="flex items-center gap-1 text-stone-200">
            <span className="font-extrabold text-stone-100">{calculations_abv_safe(abv)}% ABV</span>
          </div>
          <span className="text-stone-600 font-bold">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{ibu} IBU</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculations_abv_safe(val: number) {
  return typeof val === 'number' && !isNaN(val) ? val.toFixed(1) : '5.0';
}
