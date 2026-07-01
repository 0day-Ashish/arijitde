'use client';

import { useEffect, useRef, useState } from 'react';

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // default to true to avoid flashing on mobile/SSR

  // Position references for interpolation
  const cursor = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    // Check if the device is a phone/tablet or small viewport
    const checkDevice = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isSmallScreen = window.innerWidth < 768;
      const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
      return isSmallScreen || isTouch || !hasFinePointer;
    };

    const isMobileDevice = checkDevice();
    setIsMobile(isMobileDevice);

    if (isMobileDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursor.current.x = e.clientX;
      cursor.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const updatePosition = () => {
      const ease = 0.15;
      position.current.x += (cursor.current.x - position.current.x) * ease;
      position.current.y += (cursor.current.y - position.current.y) * ease;

      if (dotRef.current) {
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

  if (!mounted || isMobile) return null;

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
