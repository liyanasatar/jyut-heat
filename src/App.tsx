import { useCallback, useState } from 'react'
import { Home } from './pages/Home'
import { Run } from './pages/Run'
import { Results } from './pages/Results'
import { Review } from './pages/Review'
import { Levels } from './pages/Levels'
import {
  applyRunEnd,
  loadProgress,
  recordReviewCorrect,
  recordReviewMiss,
  type Progress,
  type RunResult,
} from './game/progress'
import './styles/tokens.css'
import styles from './App.module.css'

type Screen = 'home' | 'run' | 'results' | 'review' | 'levels'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [lastResult, setLastResult] = useState<RunResult | null>(null)
  const [runKey, setRunKey] = useState(0)

  const startRun = useCallback(() => {
    setRunKey((k) => k + 1)
    setScreen('run')
  }, [])

  const onFinish = useCallback(
    (partial: {
      score: number
      comboPeak: number
      correct: number
      total: number
      missedIds: string[]
    }) => {
      const { progress: next, result } = applyRunEnd(progress, {
        score: partial.score,
        missedIds: partial.missedIds,
      })
      setProgress(next)
      setLastResult({
        ...result,
        comboPeak: partial.comboPeak,
        correct: partial.correct,
        total: partial.total,
      })
      setScreen('results')
    },
    [progress],
  )

  return (
    <div className={styles.app}>
      {screen === 'home' && (
        <Home
          progress={progress}
          onStart={startRun}
          onReview={() => setScreen('review')}
          onLevels={() => setScreen('levels')}
        />
      )}

      {screen === 'run' && (
        <Run
          key={runKey}
          runsCompleted={progress.runsCompleted}
          onFinish={onFinish}
          onQuit={() => setScreen('home')}
        />
      )}

      {screen === 'results' && lastResult && (
        <Results
          result={lastResult}
          onHome={() => setScreen('home')}
          onReview={() => setScreen('review')}
          onAgain={startRun}
        />
      )}

      {screen === 'review' && (
        <Review
          progress={progress}
          onCorrect={(id) => setProgress((p) => recordReviewCorrect(p, id))}
          onMiss={(id) => setProgress((p) => recordReviewMiss(p, id))}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'levels' && (
        <Levels
          runsCompleted={progress.runsCompleted}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
