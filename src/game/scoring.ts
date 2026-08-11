import type { Level } from '../data/content'

export const BASE_POINTS = 100
export const MAX_COMBO = 5
export const PULSE_MS = 6500
export const MATCHES_PER_RUN = 12
export const SCENE_EVERY_N = 4

export const XP_UNLOCK: Record<Exclude<Level, 'beginner'>, number> = {
  intermediate: 400,
  advanced: 1200,
}

export function comboMultiplier(combo: number): number {
  return Math.min(MAX_COMBO, Math.max(1, combo))
}

export function scoreForAnswer(opts: {
  correct: boolean
  combo: number
  elapsedMs: number
  pulseMs?: number
}): { points: number; nextCombo: number; speedBonus: boolean } {
  if (!opts.correct) {
    return { points: 0, nextCombo: 0, speedBonus: false }
  }
  const nextCombo = opts.combo + 1
  const mult = comboMultiplier(nextCombo)
  const pulse = opts.pulseMs ?? PULSE_MS
  const speedBonus = opts.elapsedMs <= pulse / 2
  const points = BASE_POINTS * mult + (speedBonus ? 50 : 0)
  return { points, nextCombo, speedBonus }
}

export function xpFromScore(score: number): number {
  return Math.floor(score / 10)
}

export function unlockedLevel(totalXp: number): Level {
  if (totalXp >= XP_UNLOCK.advanced) return 'advanced'
  if (totalXp >= XP_UNLOCK.intermediate) return 'intermediate'
  return 'beginner'
}

export function levelsAvailable(totalXp: number): Level[] {
  const max = unlockedLevel(totalXp)
  if (max === 'advanced') return ['beginner', 'intermediate', 'advanced']
  if (max === 'intermediate') return ['beginner', 'intermediate']
  return ['beginner']
}
