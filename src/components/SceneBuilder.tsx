import { useEffect, useState } from 'react'
import type { Scene } from '../data/content'
import { shuffleChunks } from '../game/runEngine'
import styles from './SceneBuilder.module.css'

type Props = {
  scene: Scene
  onSolved: (correct: boolean) => void
}

export function SceneBuilder({ scene, onSolved }: Props) {
  const [bank, setBank] = useState(() => shuffleChunks(scene.chunks))
  const [built, setBuilt] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'miss'>('idle')

  useEffect(() => {
    setBank(shuffleChunks(scene.chunks))
    setBuilt([])
    setFeedback('idle')
  }, [scene.id])

  function addChunk(chunk: string, index: number) {
    if (feedback !== 'idle') return
    setBank((b) => b.filter((_, i) => i !== index))
    setBuilt((b) => [...b, chunk])
  }

  function removeChunk(index: number) {
    if (feedback !== 'idle') return
    const chunk = built[index]
    setBuilt((b) => b.filter((_, i) => i !== index))
    setBank((b) => [...b, chunk])
  }

  function check() {
    if (built.length !== scene.chunks.length || feedback !== 'idle') return
    const ok = built.every((c, i) => c === scene.chunks[i])
    setFeedback(ok ? 'correct' : 'miss')
    window.setTimeout(() => onSolved(ok), ok ? 500 : 2200)
  }

  return (
    <div
      className={`${styles.wrap} anim-snap ${feedback === 'miss' ? 'anim-shake' : ''}`}
    >
      <p className={styles.eyebrow}>Scene · Build the line</p>
      <h2 className={styles.prompt}>{scene.en}</h2>

      <div className={styles.built}>
        {built.length === 0 && (
          <span className={styles.placeholder}>
            Tap chunks to build the sentence
          </span>
        )}
        {built.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            className={styles.chip}
            onClick={() => removeChunk(i)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.bank}>
        {bank.map((c, i) => (
          <button
            key={`${c}-bank-${i}`}
            type="button"
            className={styles.chipBank}
            onClick={() => addChunk(c, i)}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.check}
        onClick={check}
        disabled={built.length !== scene.chunks.length || feedback !== 'idle'}
      >
        Check sentence
      </button>

      {feedback === 'correct' && (
        <p className={styles.ok}>Nice — {scene.jyutping}</p>
      )}
      {feedback === 'miss' && (
        <p className={styles.bad}>Almost — {scene.jyutping}</p>
      )}
    </div>
  )
}
