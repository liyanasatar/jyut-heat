import { LEVEL_LABELS } from '../data/content'
import type { RunResult } from '../game/progress'
import styles from './Results.module.css'

type Props = {
  result: RunResult
  onHome: () => void
  onReview: () => void
  onAgain: () => void
}

export function Results({ result, onHome, onReview, onAgain }: Props) {
  const leveledUp = result.unlockedLevel !== result.previousLevel

  return (
    <div className={`${styles.page} anim-snap`}>
      <p className={styles.eyebrow}>Heat complete</p>
      <h1 className={styles.title}>Nice run.</h1>

      <div className={styles.scoreBlock}>
        <p className={styles.scoreLabel}>Score</p>
        <p className={styles.score}>{result.score}</p>
        {result.newBest && <p className={styles.best}>Personal best</p>}
      </div>

      <ul className={styles.meta}>
        <li>
          <span>XP gained</span>
          <strong>+{result.xpGained}</strong>
        </li>
        <li>
          <span>Accuracy</span>
          <strong>
            {result.correct}/{result.total}
          </strong>
        </li>
        <li>
          <span>Peak combo</span>
          <strong>×{Math.max(1, result.comboPeak)}</strong>
        </li>
        <li>
          <span>Level</span>
          <strong>{LEVEL_LABELS[result.unlockedLevel]}</strong>
        </li>
      </ul>

      {leveledUp && (
        <p className={styles.unlock}>
          Unlocked {LEVEL_LABELS[result.unlockedLevel]}
        </p>
      )}

      {result.addedToReview.length > 0 && (
        <p className={styles.reviewNote}>
          {result.addedToReview.length} phrase
          {result.addedToReview.length === 1 ? '' : 's'} added to Need to Learn
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onAgain}>
          Another Heat
        </button>
        {result.addedToReview.length > 0 && (
          <button type="button" className={styles.secondary} onClick={onReview}>
            Clear Need to Learn
          </button>
        )}
        <button type="button" className={styles.ghost} onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  )
}
