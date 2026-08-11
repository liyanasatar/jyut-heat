import { useMemo, useState } from 'react'
import type { Progress } from '../game/progress'
import { getPhraseById, buildOptions, phrasesForLevels } from '../game/runEngine'
import { LEVEL_ORDER } from '../data/content'
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
    window.setTimeout(() => {
      if (ok) onCorrect(phrase.id)
      else onMiss(phrase.id)
      setFeedback('idle')
    }, ok ? 450 : 2200)
  }

  return (
    <div className={`${styles.page} anim-snap`}>
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
            <span className={styles.roman}>{opt.jyutping}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
