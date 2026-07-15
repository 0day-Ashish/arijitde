'use client';

import React, { useState, useEffect } from 'react';
import { GoArrowUp } from 'react-icons/go';
import { cn } from '@/lib/utils';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed z-40 w-11 h-11 rounded-full bg-white/40 backdrop-blur-md border border-border text-primary flex items-center justify-center shadow-md hover:bg-white/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer bottom-7 right-24",
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <GoArrowUp className="w-5 h-5 stroke-[1.5]" />
    </button>
  );
}
