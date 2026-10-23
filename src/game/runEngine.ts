import {
  FAMILY_TAGS,
  phrases,
  scenes,
  type Level,
  type Phrase,
  type Scene,
} from '../data/content'
import { levelsAvailable, unlockedLevel } from './scoring'

const RECENT_KEY = 'jyut-heat-recent-phrases-v1'
const RECENT_LIMIT = 40

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRecentIds(ids: string[]): void {
  const prev = loadRecentIds()
  const next = [...ids, ...prev.filter((id) => !ids.includes(id))].slice(
    0,
    RECENT_LIMIT,
  )
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function familyBiasScore(p: Phrase | Scene): number {
  const hits = p.tags.filter((t) => FAMILY_TAGS.includes(t)).length
  const trendyBonus = p.tags.includes('trendy') ? 0.35 : 0
  return hits + trendyBonus + Math.random() * 0.5
}

export function phrasesForLevels(levels: Level[]): Phrase[] {
  return phrases.filter((p) => levels.includes(p.level))
}

/** Prefer current level + less-recently-seen phrases so runs feel fresher */
export function pickRunPhrases(runsCompleted: number, count: number): Phrase[] {
  const levels = levelsAvailable(runsCompleted)
  const maxLevel = unlockedLevel(runsCompleted)
  const pool = phrasesForLevels(levels)
  const recent = new Set(loadRecentIds())

  const currentLevel = pool.filter((p) => p.level === maxLevel)
  const lowerLevel = pool.filter((p) => p.level !== maxLevel)

  const rank = (list: Phrase[]) =>
    [...list].sort((a, b) => {
      const aRecent = recent.has(a.id) ? 1 : 0
      const bRecent = recent.has(b.id) ? 1 : 0
      if (aRecent !== bRecent) return aRecent - bRecent
      return familyBiasScore(b) - familyBiasScore(a)
    })

  const wantCurrent = Math.ceil(count * 0.7)
  const wantLower = count - wantCurrent

  const pickedCurrent = rank(currentLevel).slice(
    0,
    Math.min(wantCurrent, currentLevel.length),
  )
  const pickedLower = rank(lowerLevel).slice(
    0,
    Math.min(wantLower, lowerLevel.length),
  )

  let picked = [...pickedCurrent, ...pickedLower]

  if (picked.length < count) {
    const remaining = rank(pool.filter((p) => !picked.some((x) => x.id === p.id)))
    picked = [...picked, ...remaining.slice(0, count - picked.length)]
  }

  picked = shuffle(picked).slice(0, Math.min(count, picked.length))
  saveRecentIds(picked.map((p) => p.id))
  return picked
}

export function pickDistractors(correct: Phrase, pool: Phrase[], n = 3): Phrase[] {
  const sameTag = pool.filter(
    (p) =>
      p.id !== correct.id &&
      p.tags.some((t) => correct.tags.includes(t)),
  )
  const sameLevel = pool.filter((p) => p.id !== correct.id && p.level === correct.level)
  const candidates = shuffle([
    ...sameTag,
    ...sameLevel.filter((p) => !sameTag.includes(p)),
    ...pool.filter((p) => p.id !== correct.id),
  ])
  const unique: Phrase[] = []
  for (const c of candidates) {
    if (unique.every((u) => u.id !== c.id)) unique.push(c)
    if (unique.length >= n) break
  }
  return unique
}

export function buildOptions(correct: Phrase, pool: Phrase[]): Phrase[] {
  return shuffle([correct, ...pickDistractors(correct, pool, 3)])
}

export function pickScene(runsCompleted: number, usedIds: Set<string>): Scene | null {
  const levels = levelsAvailable(runsCompleted)
  const pool = scenes
    .filter((s) => levels.includes(s.level) && !usedIds.has(s.id))
    .sort((a, b) => familyBiasScore(b) - familyBiasScore(a))
  if (!pool.length) return null
  return shuffle(pool.slice(0, Math.min(8, pool.length)))[0] ?? null
}

export function shuffleChunks(chunks: string[]): string[] {
  let out = shuffle(chunks)
  if (out.length > 1 && out.every((c, i) => c === chunks[i])) {
    out = shuffle(chunks)
  }
  return out
}

export function getPhraseById(id: string): Phrase | undefined {
  return phrases.find((p) => p.id === id)
}
