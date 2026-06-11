'use client';

import React, { useState, useEffect } from 'react';

interface FooterProps {
  footerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function Footer({ footerRef }: FooterProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      };
      setCurrentTime(now.toLocaleTimeString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer ref={footerRef as any} className="w-full bg-transparent border-t border-border relative z-10 pt-24 pb-0 overflow-hidden text-foreground">
      {/* Top Columns Grid */}
      <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 text-sm font-sans mb-20 text-muted-foreground text-left">
        {/* Location & Time */}
        <div className="flex flex-col gap-2.5">
          <span className="text-primary font-semibold text-xs tracking-wider uppercase font-mono">India</span>
          <span className="text-primary font-normal text-sm font-mono">{currentTime || "22:55:56"}</span>
          <span className="text-slate-500 text-xs font-mono">(GMT+5:30)</span>
        </div>

        {/* About */}
        <div className="flex flex-col gap-2.5">
          <span className="text-primary font-semibold text-xs tracking-wider uppercase font-mono">About</span>
          <a href="/#about" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">About Us</a>
          <a href="/#services" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Services</a>
          <a href="/#faq" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">FAQ</a>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2.5">
          <span className="text-primary font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-1">
            Quick Links<span className="text-[9px] text-primary font-mono leading-none align-super">(4)</span>
          </span>
          <a href="/sip-calculator" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">SIP Calculator</a>
          <a href="/onboarding" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Onboarding</a>
          <a href="/onboarding" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Get Started</a>
        </div>
        {/* Contact / Subscribe */}
        <div className="flex flex-col gap-3">
          <span className="text-primary font-semibold text-xs tracking-wider uppercase font-mono">Subscribe</span>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#F2F0EF] border border-border rounded-lg p-2 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans"
            />
            <button className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] rounded-lg uppercase tracking-wider transition duration-200 cursor-pointer font-sans">
              Subscribe Now
            </button>
          </form>
        </div>

        {/* Preloader Animation Showcase Column */}
        <div className="col-span-2 md:col-span-1">
          <div className="w-64 md:w-68 h-auto rounded-xl overflow-hidden border border-border bg-[#F2F0EF] lg:ml-20 shadow-sm animate-fade-in">
            <img
              src="/assets/video.gif"
              alt="FinAnalysis Flow"
              className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>

      {/* Middle Divider Row */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-border max-w-5xl mx-auto px-6 py-6 text-xs text-slate-500 font-sans gap-4">
        <span>©2026 FinAnalysis</span>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-primary transition duration-200">Privacy</a>
          <a href="/terms" className="hover:text-primary transition duration-200">Terms</a>
          <a href="/cookies" className="hover:text-primary transition duration-200">Cookies</a>
        </div>
        <span>Website by <a href="https://arddev.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-bold transition duration-200 font-sans">ard.dev</a></span>
      </div>

      {/* Big Brand Logo Text */}
      <div className="w-full overflow-hidden flex justify-center items-end relative h-[14vw] min-h-[100px] mt-10">
        <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none select-none" />
        <h1 className="font-chillax text-[18vw] font-bold text-black tracking-tighter leading-none select-none translate-y-[20%] text-center uppercase">
          FinAnalysis
        </h1>
      </div>
    </footer>
  );
}
