import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId = null;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
      setProgress(currentProgress);
    };

    const onScroll = () => {
      if (document.body.classList.contains('motion-paused')) {
        updateScrollProgress();
        return;
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: 'transparent',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#3A4BFF',
          transition: document.body.classList.contains('motion-paused') ? 'none' : 'width 0.08s linear'
        }}
      />
    </div>
  );
}
