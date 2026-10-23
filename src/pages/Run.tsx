import { useCallback, useMemo, useState } from 'react'
import type { Phrase, Scene } from '../data/content'
import {
  MATCHES_PER_RUN,
  SCENE_EVERY_N,
  levelsAvailable,
  scoreForAnswer,
} from '../game/scoring'
import {
  buildOptions,
  pickRunPhrases,
  pickScene,
  phrasesForLevels,
} from '../game/runEngine'
import { HeatMeter } from '../components/HeatMeter'
import { PulseMatch } from '../components/PulseMatch'
import { SceneBuilder } from '../components/SceneBuilder'
import styles from './Run.module.css'

type Props = {
  runsCompleted: number
  onFinish: (partial: {
    score: number
    comboPeak: number
    correct: number
    total: number
    missedIds: string[]
  }) => void
  onQuit: () => void
}

type Mode = 'match' | 'scene'

export function Run({ runsCompleted, onFinish, onQuit }: Props) {
  const deck = useMemo(
    () => pickRunPhrases(runsCompleted, MATCHES_PER_RUN),
    [runsCompleted],
  )
  const pool = useMemo(
    () => phrasesForLevels(levelsAvailable(runsCompleted)),
    [runsCompleted],
  )

  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<Mode>('match')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [comboPeak, setComboPeak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [missedIds, setMissedIds] = useState<string[]>([])
  const [scene, setScene] = useState<Scene | null>(null)
  const [usedScenes, setUsedScenes] = useState<Set<string>>(() => new Set())
  const [matchesDone, setMatchesDone] = useState(0)

  const phrase: Phrase | undefined = deck[index]
  const options = useMemo(
    () => (phrase ? buildOptions(phrase, pool) : []),
    [phrase, pool],
  )

  const finish = useCallback(
    (finalScore: number, finalComboPeak: number, correct: number, missed: string[]) => {
      onFinish({
        score: finalScore,
        comboPeak: finalComboPeak,
        correct,
        total: deck.length,
        missedIds: missed,
      })
    },
    [deck.length, onFinish],
  )

  const advanceAfterMatch = useCallback(
    (
      nextScore: number,
      nextComboPeak: number,
      nextCorrect: number,
      nextMissed: string[],
      nextMatchesDone: number,
      nextIndex: number,
    ) => {
      if (nextMatchesDone >= deck.length) {
        finish(nextScore, nextComboPeak, nextCorrect, nextMissed)
        return
      }
      if (nextMatchesDone > 0 && nextMatchesDone % SCENE_EVERY_N === 0) {
        const s = pickScene(runsCompleted, usedScenes)
        if (s) {
          setUsedScenes((prev) => new Set(prev).add(s.id))
          setScene(s)
          setMode('scene')
          setIndex(nextIndex)
          return
        }
      }
      setIndex(nextIndex)
      setMode('match')
    },
    [deck.length, finish, runsCompleted, usedScenes],
  )

  const onAnswer = useCallback(
    (ok: boolean, elapsedMs: number) => {
      if (!phrase) return
      const { points, nextCombo } = scoreForAnswer({
        correct: ok,
        combo,
        elapsedMs,
      })
      const nextScore = score + points
      const nextComboPeak = Math.max(comboPeak, nextCombo)
      const nextCorrect = correctCount + (ok ? 1 : 0)
      const nextMissed = ok ? missedIds : [...new Set([...missedIds, phrase.id])]
      const nextMatchesDone = matchesDone + 1
      const nextIndex = index + 1

      setScore(nextScore)
      setCombo(nextCombo)
      setComboPeak(nextComboPeak)
      setCorrectCount(nextCorrect)
      setMissedIds(nextMissed)
      setMatchesDone(nextMatchesDone)

      advanceAfterMatch(
        nextScore,
        nextComboPeak,
        nextCorrect,
        nextMissed,
        nextMatchesDone,
        nextIndex,
      )
    },
    [
      phrase,
      combo,
      score,
      comboPeak,
      correctCount,
      missedIds,
      matchesDone,
      index,
      advanceAfterMatch,
    ],
  )

  function onSceneSolved(ok: boolean) {
    const bonus = ok ? 150 * Math.max(1, Math.min(5, combo || 1)) : 0
    const nextScore = score + bonus
    const nextCombo = ok ? combo : 0
    const nextComboPeak = Math.max(comboPeak, nextCombo)
    setScore(nextScore)
    setCombo(nextCombo)
    setComboPeak(nextComboPeak)
    setMode('match')
    setScene(null)

    if (matchesDone >= deck.length) {
      finish(nextScore, nextComboPeak, correctCount, missedIds)
    }
  }

  if (!phrase && mode === 'match') {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <button type="button" className={styles.quit} onClick={onQuit}>
          Exit
        </button>
        <HeatMeter
          score={score}
          combo={combo}
          wave={Math.min(matchesDone + (mode === 'match' ? 1 : 0), deck.length)}
          totalWaves={deck.length}
        />
      </div>

      {mode === 'match' && phrase && (
        <PulseMatch
          key={phrase.id}
          phrase={phrase}
          options={options}
          combo={combo}
          onAnswer={onAnswer}
        />
      )}

      {mode === 'scene' && scene && (
        <SceneBuilder
          key={scene.id}
          scene={scene}
          onSolved={onSceneSolved}
        />
      )}
    </div>
  )
}
