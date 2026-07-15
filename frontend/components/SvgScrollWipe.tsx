'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

interface SvgScrollWipeProps {
  screen1: React.ReactNode;
  screen2: React.ReactNode;
}

export default function SvgScrollWipe({ screen1, screen2 }: SvgScrollWipeProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const screen1Ref = useRef<HTMLDivElement>(null);
  const screen2Ref = useRef<HTMLDivElement>(null);

  // 16 paths for full coverage of the top-left corner and fanned curved sweeps
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const path4Ref = useRef<SVGPathElement>(null);
  const path5Ref = useRef<SVGPathElement>(null);
  const path6Ref = useRef<SVGPathElement>(null);
  const path7Ref = useRef<SVGPathElement>(null);
  const path8Ref = useRef<SVGPathElement>(null);
  const path9Ref = useRef<SVGPathElement>(null);
  const path10Ref = useRef<SVGPathElement>(null);
  const path11Ref = useRef<SVGPathElement>(null);
  const path12Ref = useRef<SVGPathElement>(null);
  const path13Ref = useRef<SVGPathElement>(null);
  const path14Ref = useRef<SVGPathElement>(null);
  const path15Ref = useRef<SVGPathElement>(null);
  const path16Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const screen1 = screen1Ref.current;
    const screen2 = screen2Ref.current;

    const paths = [
      path1Ref.current,
      path2Ref.current,
      path3Ref.current,
      path4Ref.current,
      path5Ref.current,
      path6Ref.current,
      path7Ref.current,
      path8Ref.current,
      path9Ref.current,
      path10Ref.current,
      path11Ref.current,
      path12Ref.current,
      path13Ref.current,
      path14Ref.current,
      path15Ref.current,
      path16Ref.current,
    ].filter(Boolean) as SVGPathElement[];

    if (!trigger || !container || !overlay || !screen1 || !screen2 || paths.length === 0) return;

    const ctx = gsap.context(() => {
      // 1. Initial State
      gsap.set(overlay, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(250, 246, 240, 0)',
        visibility: 'hidden'
      });
      gsap.set(screen1, { opacity: 1, y: 0, pointerEvents: 'auto' });
      gsap.set(screen2, { opacity: 0, y: 40, pointerEvents: 'none' });

      // Create scroll timeline mapping exactly to scroll progress (0.0 to 1.0)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: container,
          anticipatePin: 1,
        },
      });

      // 2. Timeline Animation Steps

      // Step A: Fade in backdrop blur overlay as strokes start drawing
      tl.to(overlay, {
        visibility: 'visible',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(250, 246, 240, 0.45)',
        duration: 0.35,
      }, 0);

      // Step B: Draw paths in (dashoffset: 1000 -> 0) with varied durations, eases, and larger stagger offsets
      paths.forEach((path, i) => {
        const duration = 0.32 + (i % 4) * 0.035;
        const ease = ['power1.inOut', 'power2.inOut', 'sine.inOut', 'quad.inOut'][i % 4];
        tl.to(path, {
          strokeDashoffset: 0,
          ease: ease,
          duration: duration,
        }, i * 0.024);
      });

      // Step C: Content Swap underneath the full-screen blur transition (peak coverage around 0.4 - 0.6)
      tl.to(screen1, {
        opacity: 0,
        y: -40,
        pointerEvents: 'none',
        duration: 0.15,
        ease: 'power2.in',
      }, 0.25);

      tl.to(screen2, {
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
        duration: 0.18,
        ease: 'power2.out',
      }, 0.42);

      // Step D: Draw paths out (dashoffset: 0 -> -1000) with varied durations, eases, and offsets
      paths.forEach((path, i) => {
        const duration = 0.32 + ((15 - i) % 4) * 0.035;
        const ease = ['power1.inOut', 'power2.inOut', 'sine.inOut', 'quad.inOut'][(15 - i) % 4];
        tl.to(path, {
          strokeDashoffset: -1000,
          ease: ease,
          duration: duration,
        }, 0.42 + i * 0.02);
      });

      // Step F: Fade out backdrop blur overlay
      tl.to(overlay, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(250, 246, 240, 0)',
        duration: 0.35,
      }, 0.65);

      // Set visibility hidden at the very end
      tl.set(overlay, { visibility: 'hidden' }, 1.0);
    }, triggerRef); // scope to triggerRef

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    // Explicit cleanup using gsap.context to prevent duplicate pin-spacers during React 18 double mounts or Hot Reloads
    return () => {
      ctx.revert();
      clearTimeout(refreshTimer);
    };
  }, []);

  return (
    <div ref={triggerRef} className="h-[600vh] w-full relative z-20">
      {/* Sticky view container */}
      <div ref={containerRef} className="relative h-screen h-dvh w-full overflow-hidden flex items-center justify-center bg-transparent">

        {/* Screen 1 wrapper */}
        <div
          ref={screen1Ref}
          className="absolute inset-0 w-full h-full overflow-y-auto md:overflow-hidden pt-30 pb-0 md:py-0 flex items-start md:items-center justify-center"
        >
          {screen1}
        </div>

        {/* Screen 2 wrapper */}
        <div
          ref={screen2Ref}
          className="absolute inset-0 w-full h-full overflow-y-auto md:overflow-hidden pt-20 pb-0 md:py-0 flex items-start md:items-center justify-center"
          style={{ opacity: 0 }}
        >
          {screen2}
        </div>

        {/* Glassmorphic SVG Wipe Overlay Container */}
        <div
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-30 flex items-center justify-center transition-all duration-300"
          style={{ visibility: 'hidden' }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Premium Yellow-Pink linear gradient matching landing page aesthetics */}
              <linearGradient id="wipe-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E29E2B" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#F5D061" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#93C5FD" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0B3C5D" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* 16 Staggered Bezier Curves crossing diagonally, fully covering top-left to bottom-right */}
            <path
              ref={path1Ref}
              d="M -155,130 Q -35,80 5,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path2Ref}
              d="M -139,130 Q -19,80 21,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path3Ref}
              d="M -123,130 Q -3,80 37,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path4Ref}
              d="M -107,130 Q 13,80 53,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path5Ref}
              d="M -91,130 Q 29,80 69,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path6Ref}
              d="M -75,130 Q 45,80 85,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path7Ref}
              d="M -59,130 Q 61,80 101,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path8Ref}
              d="M -43,130 Q 77,80 117,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path9Ref}
              d="M -27,130 Q 93,80 133,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path10Ref}
              d="M -11,130 Q 109,80 149,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path11Ref}
              d="M 5,130 Q 125,80 165,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path12Ref}
              d="M 21,130 Q 141,80 181,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path13Ref}
              d="M 37,130 Q 157,80 197,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path14Ref}
              d="M 53,130 Q 173,80 213,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path15Ref}
              d="M 69,130 Q 189,80 229,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              ref={path16Ref}
              d="M 85,130 Q 205,80 245,-30"
              pathLength="1000"
              strokeDasharray="1000 1000"
              strokeDashoffset="1000"
              stroke="url(#wipe-gradient)"
              strokeWidth="18"
              strokeLinecap="round"
            />
          </svg>
        </div>

      </div>
    </div>
  );
}
