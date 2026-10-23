import type { Level } from '../data/content'
import { unlockedLevel } from './scoring'

const KEY = 'jyut-heat-progress-v2'

export type ReviewItem = {
  phraseId: string
  correctStreak: number
}

export type Progress = {
  bestScore: number
  streakDays: number
  lastPlayDate: string | null
  review: ReviewItem[]
  runsCompleted: number
}

export type RunResult = {
  score: number
  comboPeak: number
  correct: number
  total: number
  newBest: boolean
  addedToReview: string[]
  unlockedLevel: Level
  previousLevel: Level
  runsCompleted: number
}

const defaultProgress = (): Progress => ({
  bestScore: 0,
  streakDays: 0,
  lastPlayDate: null,
  review: [],
  runsCompleted: 0,
})

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function loadProgress(): Progress {
  try {
    const rawV2 = localStorage.getItem(KEY)
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Progress
      return { ...defaultProgress(), ...parsed, review: parsed.review ?? [] }
    }
    // migrate from v1 (XP-based) if present
    const rawV1 = localStorage.getItem('jyut-heat-progress-v1')
    if (rawV1) {
      const old = JSON.parse(rawV1) as Progress & { totalXp?: number }
      const migrated: Progress = {
        bestScore: old.bestScore ?? 0,
        streakDays: old.streakDays ?? 0,
        lastPlayDate: old.lastPlayDate ?? null,
        review: old.review ?? [],
        runsCompleted: old.runsCompleted ?? 0,
      }
      saveProgress(migrated)
      return migrated
    }
    return defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function applyRunEnd(
  progress: Progress,
  opts: {
    score: number
    missedIds: string[]
  },
): { progress: Progress; result: Omit<RunResult, 'comboPeak' | 'correct' | 'total'> } {
  const previousLevel = unlockedLevel(progress.runsCompleted)
  const today = todayKey()
  let streakDays = progress.streakDays

  if (progress.lastPlayDate !== today) {
    if (progress.lastPlayDate === yesterdayKey()) {
      streakDays += 1
    } else {
      streakDays = 1
    }
  }

  const reviewMap = new Map(progress.review.map((r) => [r.phraseId, r]))
  const addedToReview: string[] = []
  for (const id of opts.missedIds) {
    if (!reviewMap.has(id)) {
      reviewMap.set(id, { phraseId: id, correctStreak: 0 })
      addedToReview.push(id)
    }
  }

  const newBest = opts.score > progress.bestScore
  const next: Progress = {
    bestScore: Math.max(progress.bestScore, opts.score),
    streakDays,
    lastPlayDate: today,
    review: [...reviewMap.values()],
    runsCompleted: progress.runsCompleted + 1,
  }

  saveProgress(next)

  return {
    progress: next,
    result: {
      score: opts.score,
      newBest,
      addedToReview,
      unlockedLevel: unlockedLevel(next.runsCompleted),
      previousLevel,
      runsCompleted: next.runsCompleted,
    },
  }
}

export function recordReviewCorrect(progress: Progress, phraseId: string): Progress {
  const review = progress.review
    .map((r) =>
      r.phraseId === phraseId
        ? { ...r, correctStreak: r.correctStreak + 1 }
        : r,
    )
    .filter((r) => r.correctStreak < 2)

  const next = { ...progress, review }
  saveProgress(next)
  return next
}

export function recordReviewMiss(progress: Progress, phraseId: string): Progress {
  const review = progress.review.map((r) =>
    r.phraseId === phraseId ? { ...r, correctStreak: 0 } : r,
  )
  const next = { ...progress, review }
  saveProgress(next)
  return next
}
