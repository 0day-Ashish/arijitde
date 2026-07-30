'use client';

import React, { useMemo, useState, useEffect } from 'react';

export default function SoftBoxBlurBg() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Generate 480 cells that will auto-flow into a very high-density grid
  const cellCount = 480;

  const cells = useMemo(() => {
    if (isMobile) return []; // Don't compute cells if on mobile
    
    const list = [];
    const maxCols = 36;
    const maxRows = 14;

    for (let i = 0; i < cellCount; i++) {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);

      const waveOffset = parseFloat((Math.sin(col * 0.9) * 6).toFixed(2));
      const delay = parseFloat((row * 0.08 + col * 0.04).toFixed(2));

      const rawOpacity = 0.2 + 0.45 * Math.sin((row / maxRows) * Math.PI) * Math.cos((col / maxCols) * Math.PI * 0.85);
      const opacity = parseFloat(Math.max(0.08, Math.min(0.8, rawOpacity)).toFixed(4));

      const colorSeed = (row * 7 + col * 13) % 4;
      let cellBg = '';
      let cellBorder = '';
      let cellShadow = '';

      if (colorSeed === 0) {
        cellBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(147, 197, 253, 0.35) 50%, rgba(59, 130, 246, 0.25) 100%)';
        cellBorder = 'rgba(255, 255, 255, 0.35)';
        cellShadow = 'rgba(147, 197, 253, 0.2)';
      } else if (colorSeed === 1) {
        cellBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.35) 60%, rgba(219, 234, 254, 0.2) 100%)';
        cellBorder = 'rgba(255, 255, 255, 0.55)';
        cellShadow = 'rgba(219, 234, 254, 0.15)';
      } else if (colorSeed === 2) {
        cellBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(186, 230, 253, 0.35) 45%, rgba(147, 197, 253, 0.25) 100%)';
        cellBorder = 'rgba(255, 255, 255, 0.4)';
        cellShadow = 'rgba(186, 230, 253, 0.15)';
      } else {
        cellBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(219, 234, 254, 0.2) 50%, rgba(147, 197, 253, 0.15) 100%)';
        cellBorder = 'rgba(255, 255, 255, 0.35)';
        cellShadow = 'rgba(147, 197, 253, 0.1)';
      }

      list.push({
        id: i,
        waveOffset,
        delay,
        opacity,
        cellBg,
        cellBorder,
        cellShadow,
      });
    }
    return list;
  }, [cellCount, isMobile]);

  if (!mounted || isMobile) {
    return null;
  }

  return (
    <div className="backdrop-inner absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <style>{`
        .pillow-grid-container {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          gap: 2.5px;
          will-change: transform;
        }
        @media (min-width: 640px) {
          .pillow-grid-container {
            grid-template-columns: repeat(24, 1fr);
            gap: 3px;
          }
        }
        @media (min-width: 768px) {
          .pillow-grid-container {
            grid-template-columns: repeat(30, 1fr);
            gap: 3px;
          }
        }
        @media (min-width: 1024px) {
          .pillow-grid-container {
            grid-template-columns: repeat(36, 1fr);
            gap: 4px;
          }
        }
        @keyframes pillow-float {
          0%, 100% {
            transform: translateY(var(--wave-offset));
          }
          50% {
            transform: translateY(calc(var(--wave-offset) - 3px));
          }
        }
        .pillow-grid-mask {
          mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0) 100%);
          -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0) 100%);
        }
        .pillow-cell {
          will-change: transform;
        }
      `}</style>
      
      {/* Dense Grid container spanning the bottom and fading as it goes up */}
      <div className="absolute bottom-[-5%] left-[-2%] right-[-2%] h-[80%] pillow-grid-mask pillow-grid-container p-2">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="pillow-cell w-full aspect-square rounded-[4px] sm:rounded-[6px] md:rounded-[8px] border"
            style={{
              background: cell.cellBg,
              borderColor: cell.cellBorder,
              boxShadow: `
                inset 1.5px 1.5px 3.5px rgba(255, 255, 255, 0.85),
                inset -1.5px -1.5px 3.5px ${cell.cellShadow},
                inset 0 0 3.5px rgba(255, 255, 255, 0.25),
                0 4px 8px -3px ${cell.cellShadow},
                0 2px 3px -2px rgba(147, 197, 253, 0.1)
              `,
              opacity: cell.opacity,
              animation: 'pillow-float 4.5s ease-in-out infinite',
              animationDelay: `${cell.delay}s`,
              transform: `translateY(${cell.waveOffset}px)`,
              ['--wave-offset' as any]: `${cell.waveOffset}px`,
              ['--shadow-color' as any]: cell.cellShadow,
            }}
          />
        ))}
      </div>
    </div>
  );
}
