import React from 'react';
import { brewAudio } from './audioAlerts';

/**
 * Safe Sensory & Feedback Engine for Democrata Craft Lab
 * Fully optimized to prevent black screen flashes, GPU glitches, or canvas crashes.
 */

// 1. Toast / Prost Clinking
export function triggerProstCelebration(event?: React.MouseEvent) {
  try {
    brewAudio.playChime();
  } catch (e) {
    // Ignore sound errors
  }
}

// 2. Victory Brewday Batch Completed
export function triggerVictoryCelebration() {
  try {
    brewAudio.playVictoryFanfare();
  } catch (e) {
    // Ignore sound errors
  }
}

// 3. Hop Alchemy / Formula Spark
export function triggerHopSpark(x: number = 0.5, y: number = 0.5) {
  try {
    brewAudio.playHopAlert();
  } catch (e) {
    // Silent
  }
}

// 4. Recipe Cloned / Created
export function triggerRecipeCreationSpark() {
  try {
    brewAudio.playChime();
  } catch (e) {
    // Silent
  }
}

// 5. Malt Addition
export function triggerMaltDrop(x: number = 0.5, y: number = 0.5) {
  try {
    brewAudio.playChime();
  } catch (e) {
    // Silent
  }
}

// 6. Yeast / Water Biotech Sparkle
export function triggerWaterWave(x: number = 0.5, y: number = 0.5) {
  try {
    brewAudio.playChime();
  } catch (e) {
    // Silent
  }
}

// 7. Adjuncts & Spices Burst
export function triggerGrainCrack(x: number = 0.5, y: number = 0.5) {
  try {
    brewAudio.playHopAlert();
  } catch (e) {
    // Silent
  }
}
