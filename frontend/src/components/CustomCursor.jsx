import React, { useEffect, useRef, useState } from 'react';
import '../styles/CustomCursor.css';

/**
 * Premium Magnetic Glass Cursor + Extra Delight Layers:
 * 1. Zero-latency precision focal point
 * 2. Frosted-glass magnetic follower ring with rotating iridescent border on hover
 * 3. Velocity-sensitive stardust micro-sparks (only on swift movements)
 * 4. Liquid click shockwave ripple emanating on mouse press
 * 5. Smart contextual hover badge ("Teach ↗", "Select ↗", "Action ↗")
 * 6. Smooth ambient spotlight illuminating surfaces
 * 7. Native caret preservation on inputs and 100% touch disabled
 */
const CustomCursor = () => {
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverLabel, setHoverLabel] = useState('');
  const [isTextInput, setIsTextInput] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [ripples, setRipples] = useState([]);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const spotlightRef = useRef(null);
  const sparksCanvasRef = useRef(null);

  // Position references
  const mouse = useRef({ x: -200, y: -200, lastX: -200, lastY: -200, speed: 0 });
  const ring = useRef({ x: -200, y: -200 });
  const spotlight = useRef({ x: -200, y: -200 });
  const sparks = useRef([]);
  const rafId = useRef(null);

  useEffect(() => {
    // Disable on touchscreens
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
      return;
    }

    const canvas = sparksCanvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    let dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    handleResize();

    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Calculate speed
      const dx = clientX - mouse.current.lastX;
      const dy = clientY - mouse.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      mouse.current.speed = speed;

      mouse.current.x = clientX;
      mouse.current.y = clientY;

      if (!visible) setVisible(true);

      // Direct placement of precision dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Check element under cursor
      const target = e.target;
      if (target) {
        const textElement = target.closest('input, textarea, [contenteditable="true"], select');
        setIsTextInput(!!textElement);

        if (!textElement) {
          const topicCard = target.closest('.topic-card');
          const btn = target.closest('.btn, button, [role="button"]');
          const navLink = target.closest('a');
          const historyCard = target.closest('.history-card');

          if (topicCard) {
            setIsHovering(true);
            setHoverLabel('Teach ↗');
          } else if (historyCard) {
            setIsHovering(true);
            setHoverLabel('Review ↗');
          } else if (btn) {
            setIsHovering(true);
            setHoverLabel('');
          } else if (navLink) {
            setIsHovering(true);
            setHoverLabel('');
          } else {
            setIsHovering(false);
            setHoverLabel('');
          }
        } else {
          setIsHovering(false);
          setHoverLabel('');
        }
      }

      // Velocity-sensitive starlight sparkles: only on fast, energetic sweeps!
      if (speed > 16 && sparks.current.length < 24 && !isTextInput) {
        sparks.current.push({
          x: clientX * dpr,
          y: clientY * dpr,
          vx: (Math.random() - 0.5) * 1.5 * dpr,
          vy: (Math.random() - 0.5) * 1.5 * dpr,
          size: (Math.random() * 2.5 + 1.5) * dpr,
          alpha: 0.9,
          decay: 0.045 + Math.random() * 0.02,
          color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8'
        });
      }

      mouse.current.lastX = clientX;
      mouse.current.lastY = clientY;
    };

    const handleMouseDown = (e) => {
      setIsActive(true);

      // Trigger click shockwave ripple
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const handleMouseUp = () => setIsActive(false);

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Spring physics render loop
    const render = () => {
      // Ring follows with spring damping
      const ringEase = isHovering ? 0.28 : 0.18;
      ring.current.x += (mouse.current.x - ring.current.x) * ringEase;
      ring.current.y += (mouse.current.y - ring.current.y) * ringEase;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      // Soft ambient spotlight
      spotlight.current.x += (mouse.current.x - spotlight.current.x) * 0.1;
      spotlight.current.y += (mouse.current.y - spotlight.current.y) * 0.1;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${spotlight.current.x}px, ${spotlight.current.y}px, 0)`;
      }

      // Render velocity sparkles on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = sparks.current.length - 1; i >= 0; i--) {
          const s = sparks.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            sparks.current.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 6 * dpr;

            // Draw micro 4-point diamond sparkle
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible, isHovering, isTextInput]);

  // Clean up old ripples after animation
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const isHidden = !visible || isTextInput;

  return (
    <>
      {/* 1. Subtle Ambient Spotlight */}
      <div
        ref={spotlightRef}
        className={`magnetic-cursor-spotlight ${!isHidden ? 'is-visible' : ''}`}
        aria-hidden="true"
      />

      {/* 2. Sparkles Canvas for velocity movement */}
      <canvas
        ref={sparksCanvasRef}
        className="magnetic-cursor-canvas"
        aria-hidden="true"
      />

      {/* 3. Click Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="cursor-click-ripple"
          style={{ left: `${r.x}px`, top: `${r.y}px` }}
          aria-hidden="true"
        />
      ))}

      {/* 4. Frosted Glass Follower Ring with Iridescent Border & Contextual Badge */}
      <div
        ref={ringRef}
        className={`magnetic-cursor-ring ${!isHidden ? 'is-visible' : ''} ${isHovering ? 'is-hover' : ''} ${isActive ? 'is-active' : ''}`}
        aria-hidden="true"
      >
        {hoverLabel && (
          <span className="cursor-hover-badge">{hoverLabel}</span>
        )}
      </div>

      {/* 5. Razor-Sharp Precision Focal Dot */}
      <div
        ref={dotRef}
        className={`magnetic-cursor-dot ${!isHidden ? 'is-visible' : ''} ${isHovering ? 'is-hover' : ''} ${isActive ? 'is-active' : ''}`}
        aria-hidden="true"
      />
    </>
  );
};

export default CustomCursor;
