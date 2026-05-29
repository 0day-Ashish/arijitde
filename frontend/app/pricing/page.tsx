'use client';

import { useState, useEffect, useRef } from "react";
import ColorBends from "@/components/ColorBends";
import Lenis from "lenis";
import GradualBlur from "@/components/GradualBlur";
import { Zap, Check } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Pricing() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Chatbot & Stickman states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! Welcome to our pricing workspace. Let me know if you need help choosing between the Lite, Pro, or Max plans!" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Lenis smooth scrolling initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard expo out
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

  // Update dynamic page title on mount
  useEffect(() => {
    document.title = "Pricing | FinAnalysis - Arijit De";
    // Brief mount delay to trigger entering animations smoothly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Footer clock tracking
  const [currentTime, setCurrentTime] = useState("");
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

  // Footer visibility tracking to hide chatbot smoothly
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterIntersecting, setIsFooterIntersecting] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Mock response after delay
    setTimeout(() => {
      let replyText = "I'm here to help! Feel free to ask about our different tiers, credits usage, or custom requirements.";
      const query = inputVal.toLowerCase();
      if (query.includes("lite") || query.includes("9.90")) {
        replyText = "The Lite plan ($9.90/mo) is great for hobbyists. It includes 1,000 credits/mo, 200 songs/mo, 30 days of storage, and core features like a priority generation queue and commercial license.";
      } else if (query.includes("pro") || query.includes("17.90")) {
        replyText = "The Pro plan ($17.90/mo) is our most popular option. It offers 3,000 credits/mo, 600 songs/mo, 90 days storage, everything in Lite, plus priority email support.";
      } else if (query.includes("max") || query.includes("29.90")) {
        replyText = "The Max plan ($29.90/mo) is built for professional studios. You get 10,000 credits/mo, 2,000 songs/mo, and 365 days of storage alongside priority email support and early model access.";
      } else if (query.includes("save") || query.includes("discount") || query.includes("annual")) {
        replyText = "Yes! Billing annually saves you up to 50% depending on the tier. Lite saves 33%, Pro saves 40%, and Max saves 50%!";
      } else if (query.includes("hello") || query.includes("hi")) {
        replyText = "Hello! Hope you're having a great day. Ask me anything about our plans!";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const anchorX = window.innerWidth - 60; // Approximate position of the stickman face
      const anchorY = window.innerHeight - 60;
      
      const dx = e.clientX - anchorX;
      const dy = e.clientY - anchorY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const maxOffset = 4; 
      const offsetX = (dx / dist) * maxOffset;
      const offsetY = (dy / dist) * maxOffset;
      
      setEyeOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-background text-foreground flex flex-col font-clash">
      {/* Background container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <ColorBends
          colors={["#000000", "#4B5563", "#9CA3AF"]}
          rotation={90}
          speed={0.12}
          scale={0.9}
          frequency={0.8}
          warpStrength={0.6}
          mouseInfluence={0.5}
          noise={0.1}
          parallax={0.3}
          iterations={1}
          intensity={0.25}
          bandWidth={4}
          transparent
          autoRotate={0}
          color="#000000"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,252,218,0)_0%,rgba(253,252,218,0.85)_80%)]" />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Reusable Navbar */}
      <Navbar isLoaded={isLoaded} activePath="/pricing" />

      {/* Pricing Header Hero */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-36 pb-6 text-center max-w-5xl mx-auto">
        <h1
          className={`text-4xl md:text-7xl font-normal tracking-tight mt-12 mb-4 leading-none text-foreground font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-lg scale-95"
          } delay-[200ms]`}
        >
          Pricing Plans
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          Simple, scalable pricing options crafted for hobbyists, professionals, and full-scale studios. Billed annually to maximize value.
        </p>
      </div>

      {/* Pricing Grid */}
      <div 
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl w-full mx-auto px-6 pb-36 transition-all duration-[1200ms] ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } delay-[500ms]`}
      >
        {/* Lite Tier Card */}
        <div className="relative rounded-3xl border border-border bg-card/85 p-8 flex flex-col justify-between shadow-md backdrop-blur-md hover:border-primary/30 transition-all duration-300 group">
          <div>
            {/* Header info */}
            <h3 className="text-2xl font-semibold text-foreground tracking-wide font-clash">Lite</h3>
            <p className="text-muted-foreground text-[13px] font-sans mt-2">
              Great for hobbyists and content creators.
            </p>

            {/* Price section */}
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">$9.90</span>
              <span className="text-muted-foreground text-sm font-sans">/ month</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold font-mono tracking-wider">
                Save 33%
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1.5 font-sans">$118.80 billed annually</p>

            {/* Metrics grid */}
            <div className="mt-6 border border-border rounded-2xl bg-[#FFFDF2]/60 flex divide-x divide-border overflow-hidden">
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">1,000</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">credits / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">200</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">songs / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">30</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">days storage</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full mt-6 py-3 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              Get Lite
            </button>

            {/* Dotted divider */}
            <div className="border-t border-dashed border-border my-6 w-full" />

            {/* Includes list */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase font-mono mb-1">Includes</h4>
              
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Priority generation queue</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Private Generations</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Unsubscribe Anytime</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Commercial license</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Email support</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Early access to new models</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tier Card (Featured Solid Black Card) */}
        <div className="relative rounded-3xl border border-black bg-black p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all duration-300 group ring-1 ring-primary/20">
          {/* Popular Badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FDFCDA] text-black border border-black/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono shadow-lg z-20">
            Popular
          </div>

          <div>
            {/* Header info */}
            <h3 className="text-2xl font-semibold text-white tracking-wide font-clash">Pro</h3>
            <p className="text-slate-300 text-[13px] font-sans mt-2">
              Ideal for professional musicians and producers.
            </p>

            {/* Price section */}
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">$17.90</span>
              <span className="text-slate-300 text-sm font-sans">/ month</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold font-mono tracking-wider">
                Save 40%
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1.5 font-sans">$214.80 billed annually</p>

            {/* Metrics grid */}
            <div className="mt-6 border border-white/10 rounded-2xl bg-white/5 flex divide-x divide-white/10 overflow-hidden">
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-white">3,000</span>
                <span className="text-[9px] text-slate-400 font-sans tracking-wide mt-0.5">credits / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-white">600</span>
                <span className="text-[9px] text-slate-400 font-sans tracking-wide mt-0.5">songs / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-white">90</span>
                <span className="text-[9px] text-slate-400 font-sans tracking-wide mt-0.5">days storage</span>
              </div>
            </div>

            {/* CTA Button - Inverted White Button */}
            <button className="w-full mt-6 py-3 rounded-xl bg-[#FDFCDA] hover:bg-[#FDFCDA]/90 text-black text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md">
              <Zap className="w-3.5 h-3.5 fill-black stroke-[2.5]" />
              Get Pro
            </button>

            {/* Dotted divider */}
            <div className="border-t border-dashed border-white/10 my-6 w-full" />

            {/* Includes list */}
            <div className="flex flex-col gap-3.5 text-left">
              <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono mb-1">Everything in Lite</h4>
              
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light">Priority generation queue</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light">Private Generations</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light">Unsubscribe Anytime</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light">Commercial license</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light font-medium">Priority email support</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-xs font-sans font-light">Early access to new models</span>
              </div>
            </div>
          </div>
        </div>

        {/* Max Tier Card */}
        <div className="relative rounded-3xl border border-border bg-card/85 p-8 flex flex-col justify-between shadow-md backdrop-blur-md hover:border-primary/30 transition-all duration-300 group">
          <div>
            {/* Header info */}
            <h3 className="text-2xl font-semibold text-foreground tracking-wide font-clash">Max</h3>
            <p className="text-muted-foreground text-[13px] font-sans mt-2">
              Perfect for professional studios and businesses.
            </p>

            {/* Price section */}
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">$29.90</span>
              <span className="text-muted-foreground text-sm font-sans">/ month</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold font-mono tracking-wider">
                Save 50%
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1.5 font-sans">$358.80 billed annually</p>

            {/* Metrics grid */}
            <div className="mt-6 border border-border rounded-2xl bg-[#FFFDF2]/60 flex divide-x divide-border overflow-hidden">
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">10,000</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">credits / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">2,000</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">songs / mo</span>
              </div>
              <div className="flex-1 py-3 px-1 flex flex-col items-center justify-center">
                <span className="text-base font-bold text-foreground">365</span>
                <span className="text-[9px] text-muted-foreground font-sans tracking-wide mt-0.5">days storage</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full mt-6 py-3 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer">
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              Get Max
            </button>

            {/* Dotted divider */}
            <div className="border-t border-dashed border-border my-6 w-full" />

            {/* Includes list */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase font-mono mb-1">Everything in Pro</h4>
              
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Priority generation queue</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Private Generations</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Unsubscribe Anytime</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Commercial license</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Priority email support</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-sans font-light">Early access to new models</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer ref={footerRef} className="w-full bg-card border-t border-border relative z-10 pt-24 pb-0 overflow-hidden mt-auto">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 text-sm font-sans mb-20 text-muted-foreground text-left">
          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">India</span>
            <span className="text-foreground font-normal text-sm font-mono">{currentTime || "22:55:56"}</span>
            <span className="text-slate-500 text-xs font-mono">(GMT+5:30)</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">About</span>
            <a href="/#about" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">About Us</a>
            <a href="/#services" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Services</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono flex items-center gap-1">
              Quick Links<span className="text-[9px] text-primary font-mono leading-none align-super">(4)</span>
            </span>
            <a href="/sip-calculator" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">SIP Calculator</a>
            <a href="/pricing" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Pricing</a>
            <a href="/onboarding" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Onboarding</a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Contact</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">Socials</span>
            <a href="/" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Instagram</a>
            <a href="/" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">LinkedIn</a>
            <a href="/" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Newsletter</a>
            <a href="/" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Medium</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">Contact</span>
            <a href="mailto:contact@finanalysis.in" className="text-muted-foreground hover:text-primary transition duration-200 text-sm break-all font-mono">
              contact@finanalysis.in
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-border max-w-5xl mx-auto px-6 py-6 text-xs text-muted-foreground font-sans gap-4">
          <span>©2026 FinAnalysis</span>
          <div className="flex gap-6">
            <a href="/" className="hover:text-primary transition duration-200">Privacy</a>
            <a href="/" className="hover:text-primary transition duration-200">Terms</a>
            <a href="/" className="hover:text-primary transition duration-200">Cookies</a>
          </div>
          <span>Website by <a href="https://arddev.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-bold transition duration-200">ard.dev</a></span>
        </div>

        <div className="w-full overflow-hidden flex justify-center items-end relative h-[14vw] min-h-[100px] mt-10">
          <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none select-none" />
          <h1 className="font-chillax text-[18vw] font-bold text-primary/10 tracking-tighter leading-none select-none translate-y-[20%] text-center uppercase">
            FinAnalysis
          </h1>
        </div>
      </footer>

      {/* Floating Chatbot Widget */}
      {isLoaded && (
        <div 
          className={`fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-500 ease-out ${
            isFooterIntersecting 
              ? "opacity-0 translate-y-10 scale-90 pointer-events-none" 
              : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          }`}
        >
          {/* Chatbot Modal */}
          {isChatOpen && (
            <div className="w-80 md:w-96 h-[450px] md:h-[500px] mb-4 rounded-3xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 origin-bottom-right">
              {/* Header */}
              <div className="px-5 py-4 bg-transparent border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground tracking-wide font-clash">Finsync AI</span>
                    <span className="text-[10px] text-muted-foreground font-mono">AI AGENT • ONLINE</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition duration-150 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-black/10 select-text">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                      msg.sender === "user"
                        ? "bg-primary rounded-br-none self-end text-left text-primary-foreground border-primary font-clash"
                        : "bg-card rounded-bl-none self-start text-left text-foreground border-border font-clash"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-card border border-border px-4 py-2.5 rounded-2xl rounded-bl-none text-sm self-start flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce delay-[100ms]" />
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce delay-[200ms]" />
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce delay-[300ms]" />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-transparent flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask about scoring criteria, anomalies..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:border-primary placeholder-slate-400 font-clash"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Speech Bubble */}
          {!isChatOpen && (
            <div className="absolute bottom-16 right-2 mb-2.5 bg-primary border border-primary rounded-xl px-3 py-1.5 text-xs text-primary-foreground tracking-wide shadow-lg whitespace-nowrap select-none font-clash">
              Ask me <span className="text-amber-400 font-semibold">anything !</span>
              {/* Arrow */}
              <div className="absolute bottom-[-5px] right-5 w-2.5 h-2.5 bg-primary rotate-45" />
            </div>
          )}

          {/* Stickman Face Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-200 group"
          >
            {/* Eyes Container */}
            <div className="flex gap-2 mb-1.5 justify-center items-center">
              {/* Left Eye */}
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                <div
                  className="w-2 h-2 rounded-full bg-slate-900 transition-transform duration-75 ease-out"
                  style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
                />
              </div>
              {/* Right Eye */}
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                <div
                  className="w-2 h-2 rounded-full bg-slate-900 transition-transform duration-75 ease-out"
                  style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
                />
              </div>
            </div>
            {/* Smile */}
            <div className="w-5 h-2 flex items-center justify-center">
              <svg className="w-4 h-2 text-slate-800" viewBox="0 0 20 10" fill="none">
                <path d="M 2 2 Q 10 9 18 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {isLoaded && (
        <GradualBlur preset="page-footer" height="3rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}

