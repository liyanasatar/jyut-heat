import { LEVEL_LABELS, LEVEL_ORDER, phrases, type Level } from '../data/content'
import { unlockedLevel, RUNS_UNLOCK } from '../game/scoring'
import styles from './Levels.module.css'

type Props = {
  runsCompleted: number
  onBack: () => void
}

const BLURBS: Record<Level, string> = {
  beginner: 'Core everyday lines — greetings, food, home basics.',
  intermediate:
    'Longer phrases and sentence-building scenes for real conversations.',
  advanced:
    'Natural colloquial lines, trickier choices, fuller everyday speech.',
}

export function Levels({ runsCompleted, onBack }: Props) {
  const current = unlockedLevel(runsCompleted)

  return (
    <div className={`${styles.page} anim-snap`}>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Home
      </button>
      <h1 className={styles.title}>Levels</h1>
      <p className={styles.lead}>
        Finish Heat runs to unlock more. You’ve completed {runsCompleted} run
        {runsCompleted === 1 ? '' : 's'}.
      </p>

      <div className={styles.list}>
        {LEVEL_ORDER.map((level) => {
          const unlocked =
            level === 'beginner' ||
            (level === 'intermediate' &&
              runsCompleted >= RUNS_UNLOCK.intermediate) ||
            (level === 'advanced' && runsCompleted >= RUNS_UNLOCK.advanced)
          const count = phrases.filter((p) => p.level === level).length
          const sample = phrases.find((p) => p.level === level)
          const need =
            level === 'intermediate'
              ? RUNS_UNLOCK.intermediate
              : level === 'advanced'
                ? RUNS_UNLOCK.advanced
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
                <span>{unlocked ? 'Open' : `${need} runs`}</span>
              </div>
              <p>{BLURBS[level]}</p>
              <p className={styles.meta}>{count} phrases</p>
              {sample && (
                <p className={styles.sample}>
                  <span className={styles.zh}>{sample.zh}</span>
                  <span className={styles.roman}> {sample.jyutping}</span>
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
