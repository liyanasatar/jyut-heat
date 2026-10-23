import type { Progress } from '../game/progress'
import { unlockedLevel } from '../game/scoring'
import { LEVEL_LABELS } from '../data/content'
import styles from './Home.module.css'

type Props = {
  progress: Progress
  onStart: () => void
  onReview: () => void
  onLevels: () => void
}

export function Home({ progress, onStart, onReview, onLevels }: Props) {
  const level = unlockedLevel(progress.runsCompleted)
  const reviewCount = progress.review.length

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="Jyut Heat">
        <img
          className={styles.heroImage}
          src="/hk-hero.png"
          alt="Cartoon Hong Kong street with Cantonese cafe signs"
        />
        <div className={styles.heroScrim} aria-hidden />

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
        <div className={styles.statChip}>
          <p className={styles.statLabel}>Streak</p>
          <p className={styles.statValue}>{progress.streakDays}d</p>
        </div>
        <div className={styles.statChip}>
          <p className={styles.statLabel}>Best</p>
          <p className={styles.statValue}>{progress.bestScore}</p>
        </div>
        <div className={styles.statChip}>
          <p className={styles.statLabel}>Heats</p>
          <p className={styles.statValue}>{progress.runsCompleted}</p>
        </div>
        <div className={styles.statChip}>
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
    </div>
  )
}
