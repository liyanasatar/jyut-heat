import type { Level } from '../data/content'
import { unlockedLevel } from './scoring'

const KEY = 'jyut-heat-progress-v1'

export type ReviewItem = {
  phraseId: string
  correctStreak: number
}

export type Progress = {
  totalXp: number
  bestScore: number
  streakDays: number
  lastPlayDate: string | null
  review: ReviewItem[]
  runsCompleted: number
}

export type RunResult = {
  score: number
  xpGained: number
  comboPeak: number
  correct: number
  total: number
  newBest: boolean
  addedToReview: string[]
  unlockedLevel: Level
  previousLevel: Level
}

const defaultProgress = (): Progress => ({
  totalXp: 0,
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
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Progress
    return { ...defaultProgress(), ...parsed, review: parsed.review ?? [] }
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
    xpGained: number
    missedIds: string[]
  },
): { progress: Progress; result: Omit<RunResult, 'comboPeak' | 'correct' | 'total'> } {
  const previousLevel = unlockedLevel(progress.totalXp)
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
    totalXp: progress.totalXp + opts.xpGained,
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
      xpGained: opts.xpGained,
      newBest,
      addedToReview,
      unlockedLevel: unlockedLevel(next.totalXp),
      previousLevel,
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
