'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  isLoaded?: boolean;
  activePath?: string;
}

export default function Navbar({ isLoaded = true, activePath = '/' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/onboarding');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [finPoints, setFinPoints] = useState<number>(0);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const desktopWalletRef = useRef<HTMLDivElement>(null);
  const mobileWalletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time migration to clear all existing points to 0
    if (!localStorage.getItem('finPointsCleared_v1')) {
      localStorage.setItem('finPointsBalance', '0');
      localStorage.setItem('finPointsCleared_v1', 'true');
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        const role = user?.role;
        if (role === 'ADMIN') {
          setDashboardUrl('/dashboard/admin');
        } else if (role === 'CLIENT') {
          setDashboardUrl('/dashboard/client');
        } else {
          setDashboardUrl('/dashboard/user');
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
        setDashboardUrl('/dashboard/user');
      }
    } else {
      setIsLoggedIn(false);
      setDashboardUrl('/onboarding');
    }

    // Load FinPoints Balance
    const savedPoints = localStorage.getItem('finPointsBalance');
    if (savedPoints !== null) {
      setFinPoints(Number(savedPoints));
    } else {
      setFinPoints(0);
    }

    // Fetch latest finPoints from database to keep it synced
    if (token) {
      fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const fetchedPoints = data.data.finPoints ?? 0;
            setFinPoints(fetchedPoints);
            localStorage.setItem('finPointsBalance', fetchedPoints.toString());
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        })
        .catch(err => {
          console.error("Failed to sync finPoints from DB", err);
        });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        (desktopWalletRef.current && !desktopWalletRef.current.contains(target)) &&
        (mobileWalletRef.current && !mobileWalletRef.current.contains(target))
      ) {
        setIsWalletOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handlePointsUpdate = () => {
      const savedPoints = localStorage.getItem('finPointsBalance');
      if (savedPoints !== null) {
        setFinPoints(Number(savedPoints));
      }
    };
    window.addEventListener('points-updated', handlePointsUpdate);
    return () => {
      window.removeEventListener('points-updated', handlePointsUpdate);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 w-full flex flex-col items-center transition-all duration-[1000ms] cubic-bezier(0.25,1,0.5,1) ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-24"
        }`}
    >
      {/* Centered Floating Navbar */}
      <div className="w-full max-w-7xl px-4 sm:px-6 mt-4">
        <header className="w-full border border-border rounded-2xl backdrop-blur-2xl bg-white/35 shadow-md transition-all duration-350 ease-in-out">
          {/* Top Navbar Row */}
          <div className="w-full px-6 py-3.5 flex items-center justify-between">
            {/* Left: Brand Name & Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-wider text-primary font-chillax select-none hover:opacity-90">
                <img
                  src="/image.png"
                  alt="FinAnalysis Logo"
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-primary/15 shadow-sm"
                />
                <span>FinAnalysis</span>
              </a>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
              <a
                href="/#about"
                className={`hover:text-primary transition duration-200 ${activePath === '#about' ? 'text-primary font-bold' : ''}`}
              >
                About
              </a>
              <a
                href="/#contact"
                className={`hover:text-primary transition duration-200 ${activePath === '#contact' ? 'text-primary font-bold' : ''}`}
              >
                Contact
              </a>
              <a
                href="#calculators"
                className={`hover:text-primary transition duration-200 ${activePath === '#calculators' ? 'text-primary font-bold' : ''}`}
              >
                Calculators
              </a>
              <a
                href="/quiz"
                className={`hover:text-primary transition duration-200 ${activePath === '/quiz' ? 'text-primary font-bold' : ''}`}
              >
                Investor Quiz
              </a>
              <a
                href="/#faq"
                className={`hover:text-primary transition duration-200 ${activePath === '#faq' ? 'text-primary font-bold' : ''}`}
              >
                FAQ
              </a>
            </nav>

            {/* Right: Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={desktopWalletRef}>
                  <button
                    onClick={() => setIsWalletOpen(!isWalletOpen)}
                    title="My Wallet & FinPoints"
                    className="p-2.5 border border-border bg-white/50 hover:bg-white rounded-xl transition duration-200 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <svg className="w-4 h-4 text-neutral-700 hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3" />
                    </svg>
                  </button>

                  {isWalletOpen && (
                    <div className="absolute right-0 mt-2.5 w-64 p-5 rounded-2xl bg-white/75 backdrop-blur-2xl border border-border shadow-xl text-left flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">FinPoints Balance</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-3xl font-bold font-clash text-primary leading-none">{finPoints}</span>
                          <span className="text-xs font-sans font-semibold text-neutral-500">FP</span>
                          <span className="text-xs font-sans font-medium text-emerald-600 ml-1.5">(≈ ₹{(finPoints * 0.5).toFixed(2)})</span>
                        </div>
                      </div>

                      <p className="text-[10px] leading-relaxed text-muted-foreground font-sans">
                        Earn more FinPoints by submitting portfolios, answering quizzes, or booking portfolio reviews.
                      </p>

                      <a
                        href={dashboardUrl}
                        onClick={() => setIsWalletOpen(false)}
                        className="w-full text-center py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/95 transition duration-200 uppercase tracking-wider"
                      >
                        Manage Portfolio
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/onboarding"
                  title="Login to view wallet"
                  className="px-3.5 py-2 border border-border bg-white/50 hover:bg-white rounded-xl transition duration-200 cursor-pointer flex items-center gap-2 shrink-0 text-xs font-bold text-neutral-700 hover:text-primary"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3" />
                  </svg>
                  <span>Login to view wallet</span>
                </a>
              )}
              {isLoggedIn ? (
                <a href={dashboardUrl} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap">
                  Dashboard
                </a>
              ) : (
                <a href="/onboarding" className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap">
                  Book a Call
                </a>
              )}
            </div>

            {/* Right: Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={mobileWalletRef}>
                  <button
                    onClick={() => setIsWalletOpen(!isWalletOpen)}
                    title="My Wallet & FinPoints"
                    className="p-2 border border-border bg-white/50 hover:bg-white rounded-xl transition duration-200 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <svg className="w-4 h-4 text-neutral-700 hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3" />
                    </svg>
                  </button>

                  {isWalletOpen && (
                    <div className="absolute right-0 mt-2 w-56 p-4 rounded-2xl bg-white/80 backdrop-blur-2xl border border-border shadow-xl text-left flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">FinPoints Balance</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-bold font-clash text-primary leading-none">{finPoints}</span>
                          <span className="text-[10px] font-sans font-semibold text-neutral-500">FP</span>
                          <span className="text-[10px] font-sans font-medium text-emerald-600 ml-1.5">(≈ ₹{(finPoints * 0.5).toFixed(2)})</span>
                        </div>
                      </div>

                      <a
                        href={dashboardUrl}
                        onClick={() => setIsWalletOpen(false)}
                        className="w-full text-center py-2 text-[10px] font-bold text-white bg-primary rounded-lg hover:bg-primary/95 transition duration-200 uppercase tracking-wider"
                      >
                        Manage Portfolio
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/onboarding"
                  title="Login to view wallet"
                  className="px-2.5 py-1.5 border border-border bg-white/50 hover:bg-white rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-neutral-700 hover:text-primary"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v1a2 2 0 002 2h3" />
                  </svg>
                  <span className="hidden sm:inline">Login to view wallet</span>
                  <span className="sm:hidden">Login</span>
                </a>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary hover:text-primary/80 focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Mobile Nav Links */}
          <div
            className={`md:hidden transition-all duration-500 ease-in-out border-t border-border bg-card/40 ${isMobileMenuOpen ? "max-h-[400px] py-6 px-6" : "max-h-0 py-0 px-6 pointer-events-none opacity-0"
              } overflow-hidden`}
          >
            <nav className="flex flex-col gap-4 text-base font-semibold text-muted-foreground">
              <a
                href="/#about"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[100ms]`}
              >
                About
              </a>
              <a
                href="/#contact"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[200ms]`}
              >
                Contact
              </a>
              <a
                href="#calculators"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[300ms]`}
              >
                Calculators
              </a>
              <a
                href="/quiz"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[450ms]`}
              >
                Investor Quiz
              </a>
              <a
                href="/#faq"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[500ms]`}
              >
                FAQ
              </a>
              <hr className="border-border my-2" />
              <div
                className={`flex gap-4 items-center transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  } delay-[500ms]`}
              >
                {isLoggedIn ? (
                  <a href={dashboardUrl} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition duration-200">
                    Dashboard
                  </a>
                ) : (
                  <a href="/onboarding" className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition duration-200">
                    Book a Call
                  </a>
                )}
              </div>
            </nav>
          </div>
        </header>
      </div>
    </div>
  );
}
