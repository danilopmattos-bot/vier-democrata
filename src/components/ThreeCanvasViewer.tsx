import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { srmToHex } from '../utils/brewingCalculations';
import brandLogoPng from '../assets/images/democrata_logo.png';
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Eye,
  Sun,
  Droplets,
  Zap,
  Play,
  Pause,
  Layers,
  HelpCircle,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface ThreeCanvasViewerProps {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
  packagingType: 'can' | 'bottle' | 'longneck' | 'keg' | 'coaster';
  finishType: 'matte' | 'gold_foil' | 'holographic' | 'brushed_metal' | 'kraft';
  lightingPreset: 'neon' | 'studio' | 'amber_glow' | 'ice_cold';
  accentColor: string;
  showCondensation: boolean;
  customStory: string;
}

export const ThreeCanvasViewer: React.FC<ThreeCanvasViewerProps> = ({
  recipe,
  calculations,
  packagingType,
  finishType,
  lightingPreset,
  accentColor,
  showCondensation,
  customStory,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const [graphicsQuality, setGraphicsQuality] = useState<'ultra' | 'high' | 'balanced'>('ultra');

  // Generate Ultra High-Res 2048x1024 HTML5 Canvas texture for the label
  const createLabelTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background base
    if (finishType === 'kraft') {
      ctx.fillStyle = '#2d1e13';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Kraft paper texture noise
      ctx.fillStyle = '#3a2719';
      for (let i = 0; i < 4000; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          2,
          2
        );
      }
    } else if (finishType === 'brushed_metal') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.3, '#334155');
      grad.addColorStop(0.5, '#64748b');
      grad.addColorStop(0.7, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#09090b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Border Frame
    ctx.lineWidth = 12;
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner Filigree Frame Lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = `${accentColor}66`;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    // LEFT WING: Manifesto & Craft Story
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('MANIFESTO DA CERVEJA', 90, 120);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'italic 28px Georgia, serif';
    const words = customStory.split(' ');
    let line = '';
    let y = 170;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 550 && i > 0) {
        ctx.fillText(line, 90, y);
        line = words[i] + ' ';
        y += 40;
        if (y > 480) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 90, y);

    // Ingredients & Brewery Info
    y = 560;
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('INGREDIENTES: Água, Malte de Cevada, Lúpulo e Levedura.', 90, y);
    ctx.fillText(`MESTRE CERVEJEIRO: ${recipe.brewer || 'Democrata Bier'}`, 90, y + 35);
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 24px monospace';
    ctx.fillText('PURO MALTE • NÃO FILTRADA • ARTESANAL', 90, y + 75);

    // CENTER HERO (Front Label & Democrata Emblem)
    const centerX = canvas.width / 2;

    // High-res official Democrata Logo badge
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = brandLogoPng;
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, 280, 160, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, centerX - 160, 280 - 160, 320, 320);
      ctx.restore();
      
      // Outer Golden Ring Badge Frame
      ctx.beginPath();
      ctx.arc(centerX, 280, 160, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = accentColor;
      ctx.stroke();
    } else {
      // Outer Golden Ring Badge
      ctx.beginPath();
      ctx.arc(centerX, 280, 160, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = accentColor;
      ctx.stroke();

      // Inner Emblem Dark Disc
      ctx.beginPath();
      ctx.arc(centerX, 280, 150, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();

      // White Center Circle (Matches Democrata Emblem)
      ctx.beginPath();
      ctx.arc(centerX, 280, 110, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();

      // Concentric Ring
      ctx.beginPath();
      ctx.arc(centerX, 280, 142, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Draw Hop Cone inside center circle
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(centerX, 280, 45, 0, Math.PI * 2);
      ctx.fill();

      // Hop Stem & Leaf details
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.ellipse(centerX - 12, 265, 18, 12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 12, 265, 18, 12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.ellipse(centerX, 290, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Curved Text "DEMOCRATA" on Arc
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'black 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DEMOCRATA', centerX, 160);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('B I E R', centerX, 370);
      ctx.restore();
    }

    // Beer Title below Emblem
    ctx.fillStyle = finishType === 'gold_foil' ? '#f59e0b' : '#ffffff';
    ctx.font = 'black 80px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 18;
    ctx.fillText(recipe.name.toUpperCase(), centerX, 520);
    ctx.shadowBlur = 0;

    // Style Tag
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${recipe.style.code} • ${recipe.style.name.toUpperCase()}`, centerX, 580);

    // Tagline
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.fillText(`"${recipe.tagline || 'Cerveja Soberana'}"`, centerX, 640);

    // RIGHT WING: Technical Specs & Barcode
    const rightX = canvas.width - 600;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('DADOS TÉCNICOS', rightX, 120);

    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`TEOR ALCOÓLICO (ABV): ${calculations.abv}%`, rightX, 180);

    ctx.fillStyle = '#10b981';
    ctx.fillText(`AMARGOR (IBU): ${calculations.ibu}`, rightX, 235);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`COR (SRM): ${calculations.srm}`, rightX, 290);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px monospace';
    ctx.fillText(`VOLUME LOTE: ${recipe.batchSizeLiters}L`, rightX, 350);
    ctx.fillText(`DENSIDADE (OG): ${calculations.og.toFixed(3)}`, rightX, 390);

    // Barcode Simulation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rightX, 480, 480, 100);
    ctx.fillStyle = '#000000';
    for (let xPos = rightX + 20; xPos < rightX + 460; xPos += 12) {
      const w = Math.random() > 0.5 ? 6 : 3;
      ctx.fillRect(xPos, 490, w, 70);
    }
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('7 891234 567890', rightX + 240, 572);

    // Bottom Footer Banner
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'CERVEJARIA DEMOCRATA • PROIBIDO PARA MENORES DE 18 ANOS • BEBA COM MODERAÇÃO',
      canvas.width / 2,
      canvas.height - 24
    );

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const isUltra = graphicsQuality === 'ultra';
    const isHigh = graphicsQuality === 'high' || isUltra;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    // Renderer (Maximal Ultra Cinematic Quality Settings)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isUltra ? 2.0 : 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    mountRef.current.appendChild(renderer.domElement);

    // Generate Studio HDRI Environment Map for Hyper-Realistic Metallic & Glass Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext('2d');
    if (envCtx) {
      // Base Studio Gradient Background
      const bgGrad = envCtx.createLinearGradient(0, 0, 0, envCanvas.height);
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(0.5, '#0c0a09');
      bgGrad.addColorStop(1, '#030712');
      envCtx.fillStyle = bgGrad;
      envCtx.fillRect(0, 0, envCanvas.width, envCanvas.height);

      // Studio Softbox 1 (Main Right Highlight)
      const sb1 = envCtx.createRadialGradient(700, 150, 10, 700, 150, 180);
      sb1.addColorStop(0, '#ffffff');
      sb1.addColorStop(0.3, '#fef08a');
      sb1.addColorStop(1, 'rgba(0,0,0,0)');
      envCtx.fillStyle = sb1;
      envCtx.fillRect(0, 0, envCanvas.width, envCanvas.height);

      // Studio Softbox 2 (Left Fill Highlight)
      const sb2 = envCtx.createRadialGradient(250, 200, 10, 250, 200, 220);
      sb2.addColorStop(0, '#f8fafc');
      sb2.addColorStop(0.4, '#a5f3fc');
      sb2.addColorStop(1, 'rgba(0,0,0,0)');
      envCtx.fillStyle = sb2;
      envCtx.fillRect(0, 0, envCanvas.width, envCanvas.height);

      // Studio Overhead Light Bar
      const topBar = envCtx.createLinearGradient(300, 0, 700, 0);
      topBar.addColorStop(0, 'rgba(255,255,255,0)');
      topBar.addColorStop(0.5, 'rgba(255,255,255,0.9)');
      topBar.addColorStop(1, 'rgba(255,255,255,0)');
      envCtx.fillStyle = topBar;
      envCtx.fillRect(300, 20, 400, 40);
    }

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    envTexture.dispose();
    pmremGenerator.dispose();

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Key Light (Main Warm Studio Light)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = isUltra ? 2048 : 1024;
    keyLight.shadow.mapSize.height = isUltra ? 2048 : 1024;
    keyLight.shadow.bias = -0.00008;
    keyLight.shadow.radius = 2;
    scene.add(keyLight);

    // Fill Light (Cool Softbox Fill)
    const fillLight = new THREE.DirectionalLight(0xcff4fc, 1.8);
    fillLight.position.set(-5, 4, 4);
    scene.add(fillLight);

    // Back Cinematic Rim Light
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.5);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Camera Front Light for Label Clarity
    const labelLight = new THREE.DirectionalLight(0xffffff, 1.8);
    labelLight.position.set(0, 1, 6);
    scene.add(labelLight);

    // Preset Tint Modifications
    if (lightingPreset === 'amber_glow') {
      keyLight.color.setHex(0xfbbf24);
      rimLight.color.setHex(0xd97706);
    } else if (lightingPreset === 'ice_cold') {
      keyLight.color.setHex(0xe0f2fe);
      fillLight.color.setHex(0x0284c7);
      rimLight.color.setHex(0x38bdf8);
    } else if (lightingPreset === 'neon') {
      keyLight.color.setHex(0xec4899);
      fillLight.color.setHex(0xa855f7);
      rimLight.color.setHex(0x06b6d4);
    }

    // Cinematic Background Backdrop Glow Disc
    const bgGlowGeo = new THREE.PlaneGeometry(16, 10);
    const bgGlowCanvas = document.createElement('canvas');
    bgGlowCanvas.width = 512;
    bgGlowCanvas.height = 512;
    const bgCtx = bgGlowCanvas.getContext('2d');
    if (bgCtx) {
      const g = bgCtx.createRadialGradient(256, 256, 10, 256, 256, 250);
      g.addColorStop(0, lightingPreset === 'neon' ? '#831843' : '#451a03');
      g.addColorStop(0.4, '#1c1917');
      g.addColorStop(1, '#09090b');
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0, 0, 512, 512);
    }
    const bgGlowTex = new THREE.CanvasTexture(bgGlowCanvas);
    const bgGlowMat = new THREE.MeshBasicMaterial({
      map: bgGlowTex,
      depthWrite: false,
    });
    const bgGlowMesh = new THREE.Mesh(bgGlowGeo, bgGlowMat);
    bgGlowMesh.position.set(0, 1, -8);
    scene.add(bgGlowMesh);

    // Reflective Polished Pub Counter Pedestal
    const floorGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.2, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a09,
      metalness: 0.92,
      roughness: 0.12,
      envMapIntensity: 1.5,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -1.8;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Pedestal Gold Bevel Rim Ring
    const rimGeo = new THREE.TorusGeometry(2.61, 0.02, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = -1.7;
    scene.add(rimMesh);

    // Group for Packaging Model
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Create Label Texture
    const labelTexture = createLabelTexture();

    // Material finish parameters
    let metalnessVal = 0.85;
    let roughnessVal = 0.18;
    let clearcoatVal = 0.5;

    if (finishType === 'gold_foil') {
      metalnessVal = 0.95;
      roughnessVal = 0.12;
      clearcoatVal = 0.8;
    } else if (finishType === 'matte') {
      metalnessVal = 0.05;
      roughnessVal = 0.65;
      clearcoatVal = 0.0;
    } else if (finishType === 'kraft') {
      metalnessVal = 0.02;
      roughnessVal = 0.88;
      clearcoatVal = 0.0;
    } else if (finishType === 'brushed_metal') {
      metalnessVal = 0.98;
      roughnessVal = 0.25;
      clearcoatVal = 0.6;
    }

    const segs = 64; // Ultra smooth curves

    // BUILD 3D GEOMETRY BASED ON PACKAGING TYPE
    if (packagingType === 'can') {
      // 473ml Ultra Sleek Can with Physical Clearcoat Aluminum
      const aluminumMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        metalness: 0.98,
        roughness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0,
      });

      const labelMat = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        metalness: metalnessVal,
        roughness: roughnessVal,
        clearcoat: clearcoatVal,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.5,
      });

      // Can Main Body Cylinder
      const canBodyGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, segs);
      const canBodyMesh = new THREE.Mesh(canBodyGeo, [
        labelMat, // side wrapped with label
        aluminumMat, // top
        aluminumMat, // bottom
      ]);
      canBodyMesh.castShadow = true;
      canBodyMesh.receiveShadow = true;
      modelGroup.add(canBodyMesh);

      // Top Taper Rim
      const topRimGeo = new THREE.CylinderGeometry(0.72, 0.85, 0.25, segs);
      const topRimMesh = new THREE.Mesh(topRimGeo, aluminumMat);
      topRimMesh.position.y = 1.425;
      modelGroup.add(topRimMesh);

      // Top Lid Bevel
      const lidGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.05, segs);
      const lidMesh = new THREE.Mesh(lidGeo, aluminumMat);
      lidMesh.position.y = 1.57;
      modelGroup.add(lidMesh);

      // Pull Tab
      const tabGeo = new THREE.BoxGeometry(0.2, 0.02, 0.35);
      const tabMesh = new THREE.Mesh(tabGeo, aluminumMat);
      tabMesh.position.set(0, 1.6, 0.15);
      tabMesh.rotation.y = 0.3;
      modelGroup.add(tabMesh);

      // Bottom Taper Rim
      const bottomRimGeo = new THREE.CylinderGeometry(0.85, 0.75, 0.2, segs);
      const bottomRimMesh = new THREE.Mesh(bottomRimGeo, aluminumMat);
      bottomRimMesh.position.y = -1.4;
      modelGroup.add(bottomRimMesh);

    } else if (packagingType === 'bottle') {
      // 500ml Photorealistic Amber Glass Bottle
      const amberGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b1c06,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.95,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.2,
      });

      const labelMat = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        metalness: metalnessVal,
        roughness: roughnessVal,
        clearcoat: clearcoatVal,
        envMapIntensity: 1.5,
      });

      // Beer Liquid Volume Inside Bottle
      const beerLiquidMat = new THREE.MeshStandardMaterial({
        color: srmToHex(calculations.srm || 12),
        roughness: 0.2,
        metalness: 0.1,
      });
      const liquidGeo = new THREE.CylinderGeometry(0.81, 0.81, 1.7, 32);
      const liquidMesh = new THREE.Mesh(liquidGeo, beerLiquidMat);
      liquidMesh.position.y = -0.5;
      modelGroup.add(liquidMesh);

      // Bottle Body Cylinder
      const bottleBodyGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.8, segs);
      const bottleBodyMesh = new THREE.Mesh(bottleBodyGeo, [
        labelMat,
        amberGlassMat,
        amberGlassMat,
      ]);
      bottleBodyMesh.position.y = -0.5;
      bottleBodyMesh.castShadow = true;
      modelGroup.add(bottleBodyMesh);

      // Bottle Shoulder Taper
      const shoulderGeo = new THREE.CylinderGeometry(0.35, 0.85, 0.9, segs);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, amberGlassMat);
      shoulderMesh.position.y = 0.85;
      modelGroup.add(shoulderMesh);

      // Bottle Neck
      const neckGeo = new THREE.CylinderGeometry(0.22, 0.35, 1.1, segs);
      const neckMesh = new THREE.Mesh(neckGeo, amberGlassMat);
      neckMesh.position.y = 1.85;
      modelGroup.add(neckMesh);

      // Gold Crown Cap
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
        envMapIntensity: 2.0,
      });
      const capGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.12, 32);
      const capMesh = new THREE.Mesh(capGeo, crownMat);
      capMesh.position.y = 2.45;
      modelGroup.add(capMesh);

    } else if (packagingType === 'longneck') {
      // 355ml Sleek Emerald Glass Bottle
      const greenGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x064e3b,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.75,
        transparent: true,
        opacity: 0.92,
        ior: 1.5,
        clearcoat: 1.0,
        envMapIntensity: 2.2,
      });

      const labelMat = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        metalness: metalnessVal,
        roughness: roughnessVal,
        clearcoat: clearcoatVal,
      });

      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.72, 0.72, 1.6, segs);
      const bodyMesh = new THREE.Mesh(bodyGeo, [
        labelMat,
        greenGlassMat,
        greenGlassMat,
      ]);
      bodyMesh.position.y = -0.6;
      modelGroup.add(bodyMesh);

      // Long Taper Neck
      const neckGeo = new THREE.CylinderGeometry(0.2, 0.72, 1.8, segs);
      const neckMesh = new THREE.Mesh(neckGeo, greenGlassMat);
      neckMesh.position.y = 1.1;
      modelGroup.add(neckMesh);

      // Silver Cap
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
        envMapIntensity: 2.0,
      });
      const capGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.12, 32);
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 2.05;
      modelGroup.add(capMesh);

    } else if (packagingType === 'keg') {
      // 50L Stainless Steel Keg
      const steelMat = new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        metalness: 0.98,
        roughness: 0.15,
        clearcoat: 0.6,
        envMapIntensity: 2.2,
      });

      const labelMat = new THREE.MeshPhysicalMaterial({
        map: labelTexture,
        metalness: 0.85,
        roughness: 0.18,
      });

      // Keg Body
      const kegBodyGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, segs);
      const kegMesh = new THREE.Mesh(kegBodyGeo, [labelMat, steelMat, steelMat]);
      kegMesh.castShadow = true;
      modelGroup.add(kegMesh);

      // Top Chime Ring
      const chimeGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, segs);
      const chimeMesh = new THREE.Mesh(chimeGeo, steelMat);
      chimeMesh.position.y = 1.3;
      modelGroup.add(chimeMesh);

      // Spear Valve on Top
      const valveGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
      const valveMesh = new THREE.Mesh(valveGeo, steelMat);
      valveMesh.position.y = 1.5;
      modelGroup.add(valveMesh);

      // Bottom Chime Ring
      const bottomChimeGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.3, segs);
      const bottomChimeMesh = new THREE.Mesh(bottomChimeGeo, steelMat);
      bottomChimeMesh.position.y = -1.25;
      modelGroup.add(bottomChimeMesh);

    } else if (packagingType === 'coaster') {
      // Round Chopp Coaster Disc
      const coasterMat = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.8,
        metalness: 0.05,
      });

      const coasterGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.08, segs);
      const coasterMesh = new THREE.Mesh(coasterGeo, coasterMat);
      coasterMesh.rotation.x = Math.PI / 6;
      coasterMesh.castShadow = true;
      modelGroup.add(coasterMesh);
    }

    // Atmospheric Floating Bokeh Sparkles (Cinematic Particles)
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 8;
      particlePos[i + 1] = (Math.random() - 0.5) * 5;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Photorealistic Ice Condensation Droplet Particles
    if (showCondensation && packagingType !== 'coaster') {
      const dropCount = 180;
      const dropGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        roughness: 0.02,
        ior: 1.33,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 2.0,
      });

      const dropletsInstanced = new THREE.InstancedMesh(
        dropGeo,
        dropMat,
        dropCount
      );
      const dummy = new THREE.Object3D();

      const radius = packagingType === 'keg' ? 1.21 : packagingType === 'can' ? 0.86 : 0.86;
      for (let i = 0; i < dropCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const h = (Math.random() - 0.5) * 2.2;
        const scale = 0.5 + Math.random() * 1.5;

        dummy.position.set(Math.cos(angle) * radius, h, Math.sin(angle) * radius);
        dummy.scale.set(scale, scale * (1 + Math.random() * 0.8), scale);
        dummy.updateMatrix();
        dropletsInstanced.setMatrixAt(i, dummy.matrix);
      }
      modelGroup.add(dropletsInstanced);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow floating particle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(elapsedTime + i) * 0.0015;
      }
      particleGeo.attributes.position.needsUpdate = true;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    packagingType,
    finishType,
    lightingPreset,
    accentColor,
    showCondensation,
    customStory,
    recipe,
    calculations,
    graphicsQuality,
  ]);

  // Sync auto-rotation state with controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 rounded-2xl sm:rounded-3xl border border-amber-500/30 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none group touch-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Floating 3D Game Controls Overlay (HUD) */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none gap-2">
        <div className="bg-stone-900/90 border border-stone-700/80 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-2xl pointer-events-auto">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">3D ULTRA GRAPHICS HD</span>
            <span className="xs:hidden">3D ULTRA</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quality Selector */}
          <div className="bg-stone-900/90 border border-stone-700/80 backdrop-blur-md rounded-xl p-0.5 flex items-center">
            {(['ultra', 'high', 'balanced'] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setGraphicsQuality(q)}
                className={`px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  graphicsQuality === q
                    ? 'bg-amber-500 text-stone-950 font-black shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {q === 'ultra' ? 'Ultra' : q === 'high' ? 'Alta' : 'Padrão'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-lg cursor-pointer ${
              isAutoRotating
                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-stone-900 text-stone-300 border border-stone-700 hover:bg-stone-800'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            <span>{isAutoRotating ? 'Pausar' : 'Girar 360°'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900/90 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer shadow-lg"
            title="Resetar Câmera"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Interactive Helper Tooltip at Bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] bg-black/85 border border-amber-500/40 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-stone-300 text-[10px] sm:text-xs font-mono flex items-center gap-1.5 shadow-2xl pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100 text-center">
        <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Arraste para girar em 3D • Scroll/Pinche para Zoom • Qualidade Ultra</span>
      </div>
    </div>
  );
};
