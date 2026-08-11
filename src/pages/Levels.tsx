import { LEVEL_LABELS, LEVEL_ORDER, phrases, type Level } from '../data/content'
import { unlockedLevel, XP_UNLOCK } from '../game/scoring'
import styles from './Levels.module.css'

type Props = {
  totalXp: number
  onBack: () => void
}

const BLURBS: Record<Level, string> = {
  beginner:
    'Core everyday lines — greetings, food, home basics.',
  intermediate:
    'Longer phrases and sentence-building scenes for real conversations.',
  advanced:
    'Natural colloquial lines, trickier choices, fuller everyday speech.',
}

export function Levels({ totalXp, onBack }: Props) {
  const current = unlockedLevel(totalXp)

  return (
    <div className={`${styles.page} anim-snap`}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Home
      </button>
      <h1 className={styles.title}>Levels</h1>
      <p className={styles.lead}>
        Learn Cantonese for everyday use. You have {totalXp} XP.
      </p>

      <div className={styles.list}>
        {LEVEL_ORDER.map((level) => {
          const unlocked =
            level === 'beginner' ||
            (level === 'intermediate' && totalXp >= XP_UNLOCK.intermediate) ||
            (level === 'advanced' && totalXp >= XP_UNLOCK.advanced)
          const count = phrases.filter((p) => p.level === level).length
          const sample = phrases.find((p) => p.level === level)
          const need =
            level === 'intermediate'
              ? XP_UNLOCK.intermediate
              : level === 'advanced'
                ? XP_UNLOCK.advanced
                : 0

          return (
            <article
              key={level}
              className={`${styles.card} ${unlocked ? styles.open : styles.locked} ${
                current === level ? styles.active : ''
              }`}
            >
              <div className={styles.head}>
                <h2>{LEVEL_LABELS[level]}</h2>
                <span>{unlocked ? 'Open' : `${need} XP`}</span>
              </div>
              <p>{BLURBS[level]}</p>
              <p className={styles.meta}>{count} phrases</p>
              {sample && (
                <p className={styles.sample}>
                  <span className={styles.roman}>{sample.jyutping}</span>
                  <span> — {sample.en}</span>
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
