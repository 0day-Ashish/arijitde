'use client';

import { useEffect, useRef, useState } from 'react';

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Position references for interpolation
  const cursor = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    // Only enable cursor on devices with a mouse/trackpad (pointer: fine)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Align directly with the cursor tip
      cursor.current.x = e.clientX;
      cursor.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const updatePosition = () => {
      // Smooth interpolation (lerp)
      const ease = 0.15; // Lower values = smoother/slower, higher = faster
      position.current.x += (cursor.current.x - position.current.x) * ease;
      position.current.y += (cursor.current.y - position.current.y) * ease;

      if (dotRef.current) {
        // Translate by -50% in X and Y to center the dot exactly on the cursor tip
        dotRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      ref={dotRef}
      className={`fixed top-0 left-0 w-3 h-3 bg-black rounded-full pointer-events-none z-[9999] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        willChange: 'transform',
      }}
    />
  );
}
