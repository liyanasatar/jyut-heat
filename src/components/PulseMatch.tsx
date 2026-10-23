import { useEffect, useRef, useState } from 'react'
import type { Phrase } from '../data/content'
import { PULSE_MS } from '../game/scoring'
import { EmojiBurst } from './EmojiBurst'
import styles from './PulseMatch.module.css'

const FEEDBACK_OK_MS = 1200
const FEEDBACK_MISS_MS = 4200

type Props = {
  phrase: Phrase
  options: Phrase[]
  combo: number
  onAnswer: (correct: boolean, elapsedMs: number) => void
}

export function PulseMatch({ phrase, options, combo, onAnswer }: Props) {
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'miss'>('idle')
  const [locked, setLocked] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const startRef = useRef(Date.now())
  const answeredRef = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    answeredRef.current = false
    setFeedback('idle')
    setLocked(false)

    const t = window.setTimeout(() => {
      if (answeredRef.current) return
      answeredRef.current = true
      setFeedback('miss')
      setBurstKey((k) => k + 1)
      setLocked(true)
      window.setTimeout(() => onAnswer(false, PULSE_MS), FEEDBACK_MISS_MS)
    }, PULSE_MS)

    return () => window.clearTimeout(t)
  }, [phrase.id, onAnswer])

  function choose(opt: Phrase) {
    if (locked || answeredRef.current) return
    answeredRef.current = true
    setLocked(true)
    const elapsed = Date.now() - startRef.current
    const ok = opt.id === phrase.id
    setFeedback(ok ? 'correct' : 'miss')
    setBurstKey((k) => k + 1)
    window.setTimeout(
      () => onAnswer(ok, elapsed),
      ok ? FEEDBACK_OK_MS : FEEDBACK_MISS_MS,
    )
  }

  return (
    <div
      className={`${styles.wrap} anim-snap ${feedback === 'miss' ? 'anim-shake' : ''}`}
    >
      <EmojiBurst
        kind={feedback === 'idle' ? null : feedback === 'correct' ? 'good' : 'miss'}
        burstKey={`${phrase.id}-${burstKey}`}
      />

      <p className={styles.promptLabel}>How do you say this in Cantonese?</p>
      <h2 className={styles.prompt}>{phrase.en}</h2>

      <div className={styles.pulseTrack} aria-hidden>
        <div
          key={phrase.id}
          className={styles.pulseFill}
          style={{ animationDuration: `${PULSE_MS}ms` }}
        />
      </div>

      {combo > 1 && feedback === 'idle' && (
        <div key={combo} className={`${styles.combo} anim-combo`}>
          ×{Math.min(5, combo)} combo
        </div>
      )}

      {feedback === 'correct' && (
        <div className={styles.goodBanner} aria-live="polite">
          <p className={styles.goodLabel}>Correct</p>
          <p className={styles.goodZh}>{phrase.zh}</p>
          <p className={styles.goodRoman}>{phrase.jyutping}</p>
        </div>
      )}

      {feedback === 'miss' && (
        <div className={styles.missBanner} aria-live="polite">
          <p className={styles.missLabel}>Correct answer</p>
          <p className={styles.missZh}>{phrase.zh}</p>
          <p className={styles.missRoman}>{phrase.jyutping}</p>
        </div>
      )}

      <div className={styles.grid}>
        {options.map((opt) => {
          const isCorrect = opt.id === phrase.id
          const reveal =
            feedback !== 'idle' &&
            (isCorrect || (feedback === 'miss' && locked))
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.option} ${
                feedback === 'correct' && isCorrect ? styles.optionGood : ''
              } ${
                feedback === 'miss' && isCorrect ? styles.optionReveal : ''
              } ${
                feedback === 'miss' && !isCorrect && reveal
                  ? styles.optionDim
                  : ''
              }`}
              onClick={() => choose(opt)}
              disabled={locked}
            >
              <span className={styles.zh}>{opt.zh}</span>
              <span className={styles.roman}>{opt.jyutping}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
