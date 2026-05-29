'use client';

import { useState, useEffect } from "react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import Lenis from "lenis";
import GradualBlur from "@/components/GradualBlur";
import { Coins, Calendar, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FDCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculator inputs state
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.1); // typical FD rate
  const [years, setYears] = useState(5);

  // Calculated outputs state
  const [investedAmount, setInvestedAmount] = useState(0);
  const [estReturns, setEstReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Mount animation
  useEffect(() => {
    setMounted(true);
    document.title = "Fixed Deposit (FD) Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculations whenever inputs change
  useEffect(() => {
    const P = principal;
    const r = interestRate;
    const t = years;

    // FD Quarterly Compounding Formula: A = P * (1 + r / 400)^(4 * t)
    const futureValue = P * Math.pow(1 + r / 400, 4 * t);

    setInvestedAmount(Math.round(P));
    setEstReturns(Math.round(Math.max(0, futureValue - P)));
    setTotalValue(Math.round(futureValue));
  }, [principal, interestRate, years]);

  // Format currency helper (Indian style)
  const formatCurrency = (val: number) => {
    if (!mounted) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Donut Calculations
  const returnsPercent = totalValue > 0 ? (estReturns / totalValue) * 100 : 0;
  const investedPercent = totalValue > 0 ? (investedAmount / totalValue) * 100 : 100;

  // Donut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (circumference * returnsPercent) / 100;

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#F2F0EF] bg-[radial-gradient(circle_at_bottom,rgba(147,197,253,0.95)_0%,rgba(186,230,253,0.65)_45%,rgba(242,240,239,0)_85%)]">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/sip-calculator" />

      {/* Header Title Section */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-44 pb-6 text-center max-w-5xl mx-auto">
        <h1
          className={`text-4xl md:text-7xl font-normal tracking-tight mt-12 mb-4 leading-none text-primary font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-lg scale-95"
          } delay-[200ms]`}
        >
          Fixed Deposit Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          Calculate Fixed Deposit (FD) returns compounding quarterly. Perfect for stable, low-risk capital preservation planning.
        </p>
      </div>

      {/* Calculator Columns Layout */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } delay-[500ms]`}
      >
        {/* Left Column: Sliders and Range Inputs */}
        <div className="lg:col-span-7 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl space-y-8 flex flex-col justify-center text-left">
          
          {/* Total FD Principal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                FD Principal Investment
              </span>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-mono font-bold text-base bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl">
                  {formatCurrency(principal)}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={5000}
              max={10000000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹5K</span>
              <span>₹50 Lakhs</span>
              <span>₹1 Cr</span>
            </div>
          </div>

          {/* Rate of Interest */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" />
                Rate of Interest (p.a)
              </span>
              <span className="text-foreground font-mono font-bold text-base bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl">
                {interestRate}%
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>2%</span>
              <span>8.5%</span>
              <span>15%</span>
            </div>
          </div>

          {/* FD Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Tenure Period (Years)
              </span>
              <span className="text-foreground font-mono font-bold text-base bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl">
                {years} {years === 1 ? 'Year' : 'Years'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1 Yr</span>
              <span>13 Yrs</span>
              <span>25 Yrs</span>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Invested Capital</span>
              <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(investedAmount)}</span>
            </div>
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-primary/75">Est. FD Interest</span>
              <span className="text-xl font-bold text-primary mt-1">{formatCurrency(estReturns)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: SVG Donut Chart and Legend */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {/* Donut container */}
          <div className="relative w-64 h-64 flex justify-center items-center">
            
            {/* SVG circle */}
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Backing Circle (Invested Amount) */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="rgba(147, 197, 253, 0.15)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#d4d4d8"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset="0"
                className="transition-all duration-500 ease-out"
              />
              
              {/* Foreground Circle (Est. Returns) */}
              {returnsPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#3A8293"
                  strokeWidth="10.2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Maturity Amount</span>
              <span className="text-xl md:text-2xl font-bold text-foreground mt-1 select-text">{formatCurrency(totalValue)}</span>
            </div>

          </div>

          {/* Donut Legend */}
          <div className="w-full mt-6 space-y-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-zinc-400 border border-border shrink-0" />
                <span className="text-muted-foreground">Invested Principal</span>
              </div>
              <span className="text-foreground font-mono font-medium">
                {investedPercent.toFixed(1)}% ({formatCurrency(investedAmount)})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#3A8293] shrink-0" />
                <span className="text-muted-foreground">Interest Earned</span>
              </div>
              <span className="text-foreground font-mono font-bold">
                {returnsPercent.toFixed(1)}% ({formatCurrency(estReturns)})
              </span>
            </div>
          </div>

        </div>

      </div>

      <Footer />

      {isLoaded && (
        <GradualBlur preset="page-footer" height="3rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}
