import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function PauseMotionPill() {
  const [isPaused, setIsPaused] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (isPaused) {
      document.body.classList.add('motion-paused');
    } else {
      document.body.classList.remove('motion-paused');
    }
  }, [isPaused]);

  return (
    <button
      type="button"
      className="pause-motion-pill"
      onClick={() => setIsPaused(prev => !prev)}
      title="Alternar animaciones y movimiento en la página"
      aria-label="Pausar animaciones"
    >
      {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
      <span>{isPaused ? 'Motion: Paused' : 'Motion: Active'}</span>
    </button>
  );
}
