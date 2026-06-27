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
    <footer ref={footerRef as any} className="w-full bg-transparent relative z-10 pt-24 pb-0 overflow-hidden text-foreground">
      {/* Top Columns Grid */}
      <div className="w-full max-w-5xl mx-auto px-6 mb-20 flex flex-col items-center gap-12 text-center">
        {/* Big "Good buy." title */}
        <h2 className="font-clash text-7xl sm:text-7xl md:text-[8rem] lg:text-[12rem] font-normal text-primary tracking-tight leading-none drop-shadow-sm select-none">
          Good buy.
        </h2>
        
        {/* Paragraph description */}
        <p className="font-clash text-sm md:text-lg text-muted-foreground max-w-xl leading-relaxed text-center mx-auto whitespace-pre-line">
          Contact us about your portfolio health report
          or wealth targets. Let's
          collaborate, call us today!
        </p>

        {/* 3 Columns details */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-12 text-sm font-clash mt-6 text-center">
          {/* General Enquiries */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-primary font-bold text-base md:text-lg">General Enquiries</span>
            <a href="mailto:contact@finanalysis.in" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              contact@finanalysis.in
            </a>
            <a href="/onboarding" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              Book a call
            </a>
          </div>

          {/* Visit us */}
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-primary font-bold text-base md:text-lg mb-0.5">Visit us</span>
            <span className="font-normal">Salt Lake Sector V</span>
            <span className="font-normal">Kolkata, West Bengal</span>
            <span className="font-normal">India</span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-primary font-bold text-base md:text-lg">Quick Links</span>
            <a href="/#about" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              About
            </a>
            <a href="/#calculators" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              Calculators
            </a>
            <a href="/quiz" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              Investor Quiz
            </a>
            <a href="/#faq" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              FAQ
            </a>
          </div>
        </div>

        {/* New business profile card */}
        <div className="w-full max-w-xl mx-auto mt-12 p-6 md:p-8 rounded-3xl border-2 border-dashed border-primary/25 bg-white/20 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left select-none">
          <img
            src="/assets/me.jpeg"
            alt="Arijit De"
            className="w-24 h-24 md:w-36 md:h-36 rounded-2xl object-cover shrink-0 border border-border shadow-md animate-fade-in"
          />
          <div className="flex-1 flex flex-col gap-2.5">
            <h3 className="font-clash text-xl sm:text-3xl font-semibold text-primary">New investment?</h3>
            <p className="font-chillax text-base sm:text-xl text-black leading-relaxed">
              Reach out today to our CEO for new financial enquiries at{" "}
              <a href="mailto:contact@finanalysis.in" className="text-primary hover:underline font-semibold font-chillax">
                contact@finanalysis.in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* SEBI Compliance Disclaimer Block */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-8 pb-4 text-center text-xs md:text-sm text-slate-500 font-sans leading-relaxed select-text space-y-1">
        <p className="font-semibold text-neutral-700">
          Arijit De | AMFI-registered Mutual Fund Distributor | ARN-273396
        </p>
        <p>
          Portfolio reports on this platform are automated technology outputs and do not constitute investment advice under SEBI regulations.
        </p>
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
      <div className="w-full overflow-hidden flex justify-center items-end relative h-[15vw] min-h-[110px] mt-10">
        <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none select-none" />

        {/* Thank You Note */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[12px] sm:text-[14px] font-mono uppercase tracking-widest text-black select-none z-10 text-center animate-pulse">
          Thank you for choosing us!
        </div>

        <h1 className="font-chillax text-[18vw] font-bold text-black tracking-tighter leading-none select-none translate-y-[20%] text-center uppercase transition-all duration-700 ease-out hover:text-primary hover:tracking-normal hover:translate-y-[10%] cursor-pointer">
          FinAnalysis
        </h1>
      </div>
    </footer>
  );
  
}
