import type { Progress } from '../game/progress'
import { unlockedLevel, XP_UNLOCK } from '../game/scoring'
import { LEVEL_LABELS } from '../data/content'
import styles from './Home.module.css'

type Props = {
  progress: Progress
  onStart: () => void
  onReview: () => void
  onLevels: () => void
}

export function Home({ progress, onStart, onReview, onLevels }: Props) {
  const level = unlockedLevel(progress.totalXp)
  const reviewCount = progress.review.length

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="Jyut Heat">
        <div className={styles.heroWash} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.brandEn}>Cantonese · everyday</p>
          <h1 className={styles.brand}>Jyut Heat</h1>
          <p className={styles.tagline}>Heat up your Cantonese.</p>
          <button type="button" className={styles.cta} onClick={onStart}>
            Start Heat
          </button>
        </div>
      </section>

      <section className={styles.stats}>
        <div>
          <p className={styles.statLabel}>Streak</p>
          <p className={styles.statValue}>{progress.streakDays}d</p>
        </div>
        <div>
          <p className={styles.statLabel}>Best</p>
          <p className={styles.statValue}>{progress.bestScore}</p>
        </div>
        <div>
          <p className={styles.statLabel}>XP</p>
          <p className={styles.statValue}>{progress.totalXp}</p>
        </div>
        <div>
          <p className={styles.statLabel}>Level</p>
          <p className={styles.statValue}>{LEVEL_LABELS[level]}</p>
        </div>
      </section>

      <section className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onReview}>
          Need to Learn
          {reviewCount > 0 && <span className={styles.badge}>{reviewCount}</span>}
        </button>
        <button type="button" className={styles.secondary} onClick={onLevels}>
          Levels
        </button>
      </section>

      <p className={styles.hint}>
        Learn Cantonese for everyday use. Intermediate unlocks at{' '}
        {XP_UNLOCK.intermediate} XP · Advanced at {XP_UNLOCK.advanced} XP.
      </p>
    </div>
  )
}
