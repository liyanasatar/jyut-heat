import type { Level } from '../data/content'

export const BASE_POINTS = 100
export const MAX_COMBO = 5
export const PULSE_MS = 6500
export const MATCHES_PER_RUN = 12
export const SCENE_EVERY_N = 4

/** Unlock levels by finishing Heat runs (not XP) */
export const RUNS_UNLOCK: Record<Exclude<Level, 'beginner'>, number> = {
  intermediate: 5,
  advanced: 15,
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

export function unlockedLevel(runsCompleted: number): Level {
  if (runsCompleted >= RUNS_UNLOCK.advanced) return 'advanced'
  if (runsCompleted >= RUNS_UNLOCK.intermediate) return 'intermediate'
  return 'beginner'
}

export function levelsAvailable(runsCompleted: number): Level[] {
  const max = unlockedLevel(runsCompleted)
  if (max === 'advanced') return ['beginner', 'intermediate', 'advanced']
  if (max === 'intermediate') return ['beginner', 'intermediate']
  return ['beginner']
}

export type UnlockProgress = {
  currentLabel: string
  nextLabel: string | null
  have: number
  need: number
  remaining: number
  ratio: number
  done: boolean
}

export function unlockProgress(runsCompleted: number): UnlockProgress {
  const current = unlockedLevel(runsCompleted)
  if (current === 'beginner') {
    const need = RUNS_UNLOCK.intermediate
    return {
      currentLabel: 'Beginner',
      nextLabel: 'Intermediate',
      have: runsCompleted,
      need,
      remaining: Math.max(0, need - runsCompleted),
      ratio: Math.min(1, runsCompleted / need),
      done: false,
    }
  }
  if (current === 'intermediate') {
    const need = RUNS_UNLOCK.advanced
    return {
      currentLabel: 'Intermediate',
      nextLabel: 'Advanced',
      have: runsCompleted,
      need,
      remaining: Math.max(0, need - runsCompleted),
      ratio: Math.min(1, runsCompleted / need),
      done: false,
    }
  }
  return {
    currentLabel: 'Advanced',
    nextLabel: null,
    have: runsCompleted,
    need: RUNS_UNLOCK.advanced,
    remaining: 0,
    ratio: 1,
    done: true,
  }
}
