import styles from './HeatMeter.module.css'

type Props = {
  score: number
  combo: number
  wave: number
  totalWaves: number
}

export function HeatMeter({ score, combo, wave, totalWaves }: Props) {
  const heat = Math.min(100, Math.round((combo / 5) * 55 + (wave / totalWaves) * 45))

  return (
    <header className={styles.bar}>
      <div>
        <p className={styles.label}>Score</p>
        <p className={styles.value}>{score}</p>
      </div>
      <div className={styles.meterBlock}>
        <p className={styles.label}>Heat</p>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${heat}%` }} />
        </div>
      </div>
      <div className={styles.right}>
        <p className={styles.label}>
          {wave}/{totalWaves}
        </p>
        <p className={styles.combo}>×{Math.max(1, Math.min(5, combo || 1))}</p>
      </div>
    </header>
  )
}
