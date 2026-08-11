import {
  FAMILY_TAGS,
  phrases,
  scenes,
  type Level,
  type Phrase,
  type Scene,
} from '../data/content'
import { levelsAvailable } from './scoring'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function familyBiasScore(p: Phrase | Scene): number {
  const hits = p.tags.filter((t) => FAMILY_TAGS.includes(t)).length
  return hits + (Math.random() * 0.4)
}

export function phrasesForLevels(levels: Level[]): Phrase[] {
  return phrases.filter((p) => levels.includes(p.level))
}

/** Prefer family/home/food/marriage/friends tags when building a run */
export function pickRunPhrases(totalXp: number, count: number): Phrase[] {
  const levels = levelsAvailable(totalXp)
  const pool = phrasesForLevels(levels)
  const ranked = [...pool].sort((a, b) => familyBiasScore(b) - familyBiasScore(a))
  const biased = ranked.slice(0, Math.ceil(ranked.length * 0.85))
  return shuffle(biased).slice(0, Math.min(count, biased.length))
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

export function pickScene(totalXp: number, usedIds: Set<string>): Scene | null {
  const levels = levelsAvailable(totalXp)
  const pool = scenes
    .filter((s) => levels.includes(s.level) && !usedIds.has(s.id))
    .sort((a, b) => familyBiasScore(b) - familyBiasScore(a))
  if (!pool.length) return null
  return shuffle(pool.slice(0, Math.min(6, pool.length)))[0] ?? null
}

export function shuffleChunks(chunks: string[]): string[] {
  let out = shuffle(chunks)
  // avoid starting already solved
  if (out.length > 1 && out.every((c, i) => c === chunks[i])) {
    out = shuffle(chunks)
  }
  return out
}

export function getPhraseById(id: string): Phrase | undefined {
  return phrases.find((p) => p.id === id)
}
