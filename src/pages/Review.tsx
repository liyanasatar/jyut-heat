import { useMemo, useState } from 'react'
import type { Progress } from '../game/progress'
import { getPhraseById, buildOptions, phrasesForLevels } from '../game/runEngine'
import { LEVEL_ORDER } from '../data/content'
import { EmojiBurst } from '../components/EmojiBurst'
import styles from './Review.module.css'

type Props = {
  progress: Progress
  onCorrect: (phraseId: string) => void
  onMiss: (phraseId: string) => void
  onBack: () => void
}

export function Review({ progress, onCorrect, onMiss, onBack }: Props) {
  const queue = progress.review
  const current = queue[0]
  const phrase = current ? getPhraseById(current.phraseId) : undefined
  const pool = useMemo(() => phrasesForLevels([...LEVEL_ORDER]), [])
  const options = useMemo(
    () => (phrase ? buildOptions(phrase, pool) : []),
    [phrase, pool],
  )
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'miss'>('idle')
  const [burstKey, setBurstKey] = useState(0)

  if (!current || !phrase) {
    return (
      <div className={`${styles.page} anim-snap`}>
        <h1 className={styles.title}>Need to Learn</h1>
        <p className={styles.empty}>
          Queue clear. Your weak family phrases are caught up — start another Heat.
        </p>
        <button type="button" className={styles.primary} onClick={onBack}>
          Back home
        </button>
      </div>
    )
  }

  function choose(id: string) {
    if (feedback !== 'idle' || !phrase) return
    const ok = id === phrase.id
    setFeedback(ok ? 'correct' : 'miss')
    setBurstKey((k) => k + 1)
    window.setTimeout(() => {
      if (ok) onCorrect(phrase.id)
      else onMiss(phrase.id)
      setFeedback('idle')
    }, ok ? 1200 : 4200)
  }

  return (
    <div className={`${styles.page} anim-snap`}>
      <EmojiBurst
        kind={feedback === 'idle' ? null : feedback === 'correct' ? 'good' : 'miss'}
        burstKey={`${phrase.id}-${burstKey}`}
      />
      <button type="button" className={styles.back} onClick={onBack}>
        ← Home
      </button>
      <p className={styles.eyebrow}>
        Need to Learn · {queue.length} left · clear with 2 correct in a row
      </p>
      <h1 className={styles.title}>Reclaim it</h1>
      <p className={styles.prompt}>{phrase.en}</p>
      <p className={styles.progress}>
        Streak on this one: {current.correctStreak}/2
      </p>

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
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.option} ${
              feedback === 'correct' && opt.id === phrase.id ? styles.good : ''
            } ${feedback === 'miss' && opt.id === phrase.id ? styles.reveal : ''}`}
            onClick={() => choose(opt.id)}
            disabled={feedback !== 'idle'}
          >
            <span className={styles.zh}>{opt.zh}</span>
            <span className={styles.roman}>{opt.jyutping}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
