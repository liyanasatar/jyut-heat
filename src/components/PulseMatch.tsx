import { useEffect, useRef, useState } from 'react'
import type { Phrase } from '../data/content'
import { PULSE_MS } from '../game/scoring'
import styles from './PulseMatch.module.css'

const FEEDBACK_OK_MS = 450
const FEEDBACK_MISS_MS = 2200

type Props = {
  phrase: Phrase
  options: Phrase[]
  combo: number
  onAnswer: (correct: boolean, elapsedMs: number) => void
}

export function PulseMatch({ phrase, options, combo, onAnswer }: Props) {
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'miss'>('idle')
  const [locked, setLocked] = useState(false)
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
    window.setTimeout(
      () => onAnswer(ok, elapsed),
      ok ? FEEDBACK_OK_MS : FEEDBACK_MISS_MS,
    )
  }

  return (
    <div
      className={`${styles.wrap} anim-snap ${feedback === 'miss' ? 'anim-shake' : ''}`}
    >
      <p className={styles.promptLabel}>How do you say this in Cantonese?</p>
      <h2 className={styles.prompt}>{phrase.en}</h2>

      <div className={styles.pulseTrack} aria-hidden>
        <div
          key={phrase.id}
          className={styles.pulseFill}
          style={{ animationDuration: `${PULSE_MS}ms` }}
        />
      </div>

      {combo > 1 && (
        <div key={combo} className={`${styles.combo} anim-combo`}>
          ×{Math.min(5, combo)} combo
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
              <span className={styles.roman}>{opt.jyutping}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
