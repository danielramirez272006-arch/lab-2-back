import { useEffect, useRef } from 'react';

export default function HeroParticlesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 650 : 2000;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 380);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    // Target geometry: Blueprint outlines of a modern TechStore & Studio layout
    // Normalize coordinates between 0 and 1
    const targetPoints = [];
    // Outer walls
    // Blueprint target points: Forma arquitectónica de un estuche de teléfono con MagSafe
    // 1. Perímetro exterior con esquinas redondeadas (chasis del estuche)
    for (let x = 0.34; x <= 0.66; x += 0.008) {
      targetPoints.push({ x, y: 0.16, type: 'wall' }); // Borde superior
      targetPoints.push({ x, y: 0.84, type: 'wall' }); // Borde inferior
    }
    for (let y = 0.16; y <= 0.84; y += 0.01) {
      targetPoints.push({ x: 0.34, y, type: 'wall' }); // Borde izquierdo
      targetPoints.push({ x: 0.66, y, type: 'wall' }); // Borde derecho
    }

    // 2. Módulo de cámara (isla de cámaras en esquina superior izquierda)
    for (let x = 0.37; x <= 0.47; x += 0.01) {
      targetPoints.push({ x, y: 0.20, type: 'furniture' });
      targetPoints.push({ x, y: 0.32, type: 'furniture' });
    }
    for (let y = 0.20; y <= 0.32; y += 0.01) {
      targetPoints.push({ x: 0.37, y, type: 'furniture' });
      targetPoints.push({ x: 0.47, y, type: 'furniture' });
    }
    // Lentes de cámara individuales
    for (let a = 0; a <= Math.PI * 2; a += 0.4) {
      targetPoints.push({ x: 0.40 + Math.cos(a) * 0.018, y: 0.23 + Math.sin(a) * 0.018, type: 'swing' });
      targetPoints.push({ x: 0.40 + Math.cos(a) * 0.018, y: 0.29 + Math.sin(a) * 0.018, type: 'swing' });
      targetPoints.push({ x: 0.44 + Math.cos(a) * 0.018, y: 0.26 + Math.sin(a) * 0.018, type: 'swing' });
    }

    // 3. Anillo magnético MagSafe central
    for (let a = 0; a <= Math.PI * 2; a += 0.08) {
      targetPoints.push({
        x: 0.50 + Math.cos(a) * 0.075,
        y: 0.53 + Math.sin(a) * 0.075,
        type: 'swing'
      });
    }
    // Guía vertical inferior de alineación MagSafe
    for (let y = 0.62; y <= 0.66; y += 0.008) {
      targetPoints.push({ x: 0.50, y, type: 'wall' });
    }

    // Initialize particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const target = targetPoints[i % targetPoints.length];
      particles.push({
        // Cloud random position
        cloudX: Math.random() * width,
        cloudY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        // Target blueprint position
        targetNormX: target.x,
        targetNormY: target.y,
        type: target.type,
        size: Math.random() * 1.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.3
      });
    }

    let scrollProgress = 0;

    const updateScroll = () => {
      const maxScroll = window.innerHeight * 0.9;
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    let lastTime = performance.now();

    const render = (time) => {
      if (document.body.classList.contains('motion-paused')) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Interpolate particles between loose floating cloud and structured blueprint
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Float cloud slowly
        p.cloudX += p.vx;
        p.cloudY += p.vy;
        if (p.cloudX < 0) p.cloudX = width;
        if (p.cloudX > width) p.cloudX = 0;
        if (p.cloudY < 0) p.cloudY = height;
        if (p.cloudY > height) p.cloudY = 0;

        const targetX = p.targetNormX * width;
        const targetY = p.targetNormY * height;

        // Current position interpolated by scroll
        const curX = p.cloudX * (1 - scrollProgress) + targetX * scrollProgress;
        const curY = p.cloudY * (1 - scrollProgress) + targetY * scrollProgress;

        // Color: Cobalt #3A4BFF with varying alpha
        ctx.beginPath();
        ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        if (p.type === 'furniture' && scrollProgress > 0.5) {
          ctx.fillStyle = `rgba(58, 75, 255, ${p.alpha * 0.9})`;
        } else if (p.type === 'swing' && scrollProgress > 0.5) {
          ctx.fillStyle = `rgba(2, 132, 199, ${p.alpha * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(58, 75, 255, ${p.alpha * (0.35 + scrollProgress * 0.55)})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', updateScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
