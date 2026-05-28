'use client';

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollBlurRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollBlurReveal({ children, className }: ScrollBlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -80px 0px", // Trigger slightly before it enters the viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-fallback-hidden",
        isIntersecting && "reveal-fallback-visible",
        className
      )}
    >
      {children}
    </div>
  );
}
