import { useEffect, useState } from 'react'
import styles from './EmojiBurst.module.css'

type Kind = 'good' | 'miss'

type Props = {
  kind: Kind | null
  burstKey: string | number
}

/* Reds / pinks / fire read on yellow; skip gold sparkles + yellow faces */
const GOOD = ['❤️', '🌈', '🎯', '💗', '🔥', '💯', '🎉']
const MISS = ['💔', '❌', '🤡', '⛔', '👻', '🤦🏻\u200d♂️', '🤦🏻\u200d♀️']

const SPOTS = [
  { left: '14%', top: '20%', delay: '0ms', fall: '1.35s', sway: '1.5s', phase: '0ms', drift: '-26px' },
  { left: '28%', top: '16%', delay: '80ms', fall: '1.5s', sway: '1.65s', phase: '-180ms', drift: '30px' },
  { left: '42%', top: '22%', delay: '35ms', fall: '1.28s', sway: '1.4s', phase: '-90ms', drift: '-20px' },
  { left: '55%', top: '14%', delay: '110ms', fall: '1.55s', sway: '1.7s', phase: '-220ms', drift: '24px' },
  { left: '68%', top: '18%', delay: '50ms', fall: '1.32s', sway: '1.45s', phase: '-40ms', drift: '-32px' },
  { left: '82%', top: '24%', delay: '130ms', fall: '1.42s', sway: '1.55s', phase: '-150ms', drift: '18px' },
  { left: '36%', top: '12%', delay: '95ms', fall: '1.48s', sway: '1.6s', phase: '-260ms', drift: '16px' },
  { left: '72%', top: '13%', delay: '145ms', fall: '1.38s', sway: '1.52s', phase: '-70ms', drift: '-22px' },
]

export function EmojiBurst({ kind, burstKey }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!kind) {
      setVisible(false)
      return
    }
    setVisible(true)
    const t = window.setTimeout(() => setVisible(false), 1750)
    return () => window.clearTimeout(t)
  }, [kind, burstKey])

  if (!kind || !visible) return null

  const icons = kind === 'good' ? GOOD : MISS

  return (
    <div className={styles.layer} aria-hidden>
      {SPOTS.map((spot, i) => (
        <span
          key={`${burstKey}-${i}`}
          className={styles.flake}
          style={{
            left: spot.left,
            top: spot.top,
            ['--delay' as string]: spot.delay,
            ['--fall-dur' as string]: spot.fall,
            ['--sway-dur' as string]: spot.sway,
            ['--sway-phase' as string]: spot.phase,
            ['--steam-drift' as string]: spot.drift,
          }}
        >
          <span className={`${styles.emoji} ${kind === 'good' ? styles.good : styles.miss}`}>
            {icons[i % icons.length]}
          </span>
        </span>
      ))}
    </div>
  )
}
