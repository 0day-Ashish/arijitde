'use client';

import { useState, useEffect, useRef } from "react";
import ColorBends from "@/components/ColorBends";
import Lenis from "lenis";
import GradualBlur from "@/components/GradualBlur";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import ScrollVideoPlayer from "@/components/ScrollVideoPlayer";
import ScrollBlurReveal from "@/components/ScrollBlurReveal";
import ServicesConstellation from "@/components/ServicesConstellation";

const servicesData = [
  {
    title: "Mutual Funds & SIP Planning",
    description: "Build robust, long-term wealth using systematically structured mutual fund portfolios, tailored to balance growth targets with proper risk management."
  },
  {
    title: "Specialised Investment Funds (SIF)",
    description: "Gain access to bespoke, high-growth investment vehicles engineered for sophisticated investors seeking alternative asset class diversification."
  },
  {
    title: "Portfolio Management Services (PMS)",
    description: "Leverage personalized wealth management models with active monitoring, strategic allocation adjustments, and direct equity integration."
  },
  {
    title: "Life Insurance & LIC Products",
    description: "Secure your family's future and safeguard your capital with top-tier life protection policies, endowment options, and customizable term riders."
  },
  {
    title: "Mediclaim & Health Insurance",
    description: "Guard against sudden medical emergencies and rising healthcare inflation with comprehensive personal, family, and corporate health covers."
  },
  {
    title: "Vehicle & Householder Insurance",
    description: "Protect your physical assets, including automobiles and residential property, from accidental damage, theft, and third-party liabilities."
  },
  {
    title: "Fixed Deposits",
    description: "Secure fixed interest rates and guaranteed capital preservation through high-yield fixed deposit options backed by leading banking institutions."
  },
  {
    title: "PNB Housing Finance",
    description: "Unlock structural leverage and long-term homeownership support through customized home loans, construction finance, and refinancing services."
  }
];

const faqData = [
  {
    question: "How is FinAnalysis different from a robo-advisor or standard investment app?",
    answer: "While apps rely solely on static algorithms, we combine advanced data analytics (like our ML anomaly detection models) with over 35 years of human market experience. This means your portfolio gets both structural precision and real-world wisdom."
  },
  {
    question: "What does the SEBI-certified Mutual Fund Distributor model mean for me?",
    answer: "It ensures all mutual fund advisory, distribution, and systematic transactions are fully compliant with SEBI regulations, structured, and aligned with standard security requirements, guaranteeing absolute transparency."
  },
  {
    question: "What dimensions are used to score my investment portfolio?",
    answer: "We evaluate your portfolio on 5 core pillars: Goal Alignment, Asset Allocation, Diversification, Systematic Investment Plan (SIP) Discipline, and Fee Efficiency to give you a clear, comprehensive scorecard."
  },
  {
    question: "Is there any charge for the basic portfolio evaluation?",
    answer: "Our basic manual portfolio scorecard and anomaly check is completely free. We charge a premium tier fee only for automated recurring alerts, continuous monitoring, and structured portfolio optimization strategies."
  },
  {
    question: "How do I get started with a consultation?",
    answer: "You can book a live video demo using the button in the hero section or drop us an email at contact@finanalysis.in. We will schedule a personalized session to analyze your current assets."
  }
];

export default function Home() {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [preloaderGone, setPreloaderGone] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Chatbot & Stickman states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I am your FinAnalysis AI assistant. How can I help you optimize your portfolio today?" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const animationRef = useRef<number | null>(null);

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

  // Services scroll sync tracking
  const [activeService, setActiveService] = useState(0);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.55; // trigger slightly below mid viewport
      let currentActive = 0;

      serviceRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        if (rect.top <= triggerPoint) {
          currentActive = idx;
        }
      });

      // Auto-activate last items if user reaches the bottom of the page
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollPosition >= documentHeight - 80) {
        currentActive = servicesData.length - 1;
      }

      setActiveService(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
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

  // FAQ accordion active state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const triggerEnd = () => {
    setIsLoaded(true); // Slides preloader up
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCount(100);
    setTimeout(() => {
      setPreloaderGone(true); // Unmounts preloader
    }, 1000); // Match slide duration
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Mock response after delay
    setTimeout(() => {
      let replyText = "I'm here to help! Feel free to ask about portfolio scoring, ML anomaly detection, or pricing options.";
      const query = inputVal.toLowerCase();
      if (query.includes("score") || query.includes("dimension")) {
        replyText = "FinAnalysis evaluates your portfolio on 5 key dimensions: Goal Alignment, Asset Allocation, Diversification, SIP Discipline, and Fee Efficiency. Each gets scored out of 20 points.";
      } else if (query.includes("demo") || query.includes("book")) {
        replyText = "To book a demo, click the 'Book a demo' button in the center. We'll show you how we connect Node.js, FastAPI, and Next.js for unified scoring.";
      } else if (query.includes("anomaly") || query.includes("ml") || query.includes("fastapi")) {
        replyText = "Our FastAPI ML microservice runs an isolation forest model in python to flag strange anomalies or structural issues in your portfolio records.";
      } else if (query.includes("pricing") || query.includes("cost")) {
        replyText = "Manual basic scoring is completely free! Automation and continuous scoring alerts are part of our premium membership tier.";
      } else if (query.includes("hello") || query.includes("hi")) {
        replyText = "Hello! Hope you're having a great day. Ask me anything about FinAnalysis!";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate direction vector from bottom-right towards cursor
      const anchorX = window.innerWidth - 60; // Approximate position of the face
      const anchorY = window.innerHeight - 60;
      
      const dx = e.clientX - anchorX;
      const dy = e.clientY - anchorY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Capped movement offset for the pupils
      const maxOffset = 4; 
      const offsetX = (dx / dist) * maxOffset;
      const offsetY = (dy / dist) * maxOffset;
      
      setEyeOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let startTime: number | null = null;

    const animate = () => {
      if (startTime === null) return;
      const elapsed = Date.now() - startTime;
      const duration = 5000; // 5 seconds
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setCount(progress);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        triggerEnd();
      }
    };

    const handlePlay = () => {
      if (startTime !== null) return; // already started
      startTime = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    };

    video.addEventListener("play", handlePlay);
    
    // Fallback if autoplay is blocked or doesn't trigger play event
    const fallback = setTimeout(() => {
      if (startTime === null) {
        handlePlay();
      }
    }, 1000);

    return () => {
      video.removeEventListener("play", handlePlay);
      clearTimeout(fallback);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#030014] text-slate-100 flex flex-col font-clash">
      {/* Background container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
          autoRotate={0}
          color="#A855F7"
        />
        {/* Dark radial overlay for premium ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3,0,20,0.1)_0%,rgba(3,0,20,0.85)_80%)]" />
        <div className="absolute inset-0 bg-[#030014]/50" />
      </div>

      {/* Fixed Header Wrapper (InfoBar + NavBar) */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 w-full flex flex-col items-center transition-all duration-[1000ms] cubic-bezier(0.25,1,0.5,1) ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-24"
        }`}
      >
        {/* InfoBar on Top */}
        <div className="w-full py-2.5 bg-black/40 text-center text-[10px] md:text-xs tracking-wider text-white border-b border-white/5 backdrop-blur-sm select-none font-clash">
          Welcome to the new <span className="text-[#01ffc6]">FinAnalysis PWA.</span> Optimize your portfolio using modern AI-driven models and experts.
        </div>

        {/* Centered Floating Navbar */}
        <div className="w-full max-w-5xl px-6 mt-4">
          <header className="w-full border border-white/10 rounded-2xl backdrop-blur-xl bg-black/40 shadow-xl overflow-hidden transition-all duration-350 ease-in-out">
            {/* Top Navbar Row */}
            <div className="w-full px-6 py-3.5 flex items-center justify-between">
              {/* Left: Brand Name */}
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 font-chillax select-none">
                  FinAnalysis
                </span>
              </div>

              {/* Center: Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                <a href="#about" className="hover:text-[#00ffd1] transition duration-200">About</a>
                <a href="#" className="hover:text-[#00ffd1] transition duration-200">Clients</a>
                <a href="#" className="hover:text-[#00ffd1] transition duration-200">Services</a>
                <a href="#" className="hover:text-[#00ffd1] transition duration-200">Pricing</a>
              </nav>

              {/* Right: Desktop CTA Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition duration-200">
                  Sign In
                </button>
                <button className="px-5 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-200 transition duration-200 shadow-md">
                  Get Started
                </button>
              </div>

              {/* Right: Mobile Hamburger Button */}
              <div className="flex md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-300 hover:text-white focus:outline-none p-1"
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

            {/* Bottom Row: Mobile Nav Links (Staggered Animations) */}
            <div
              className={`md:hidden transition-all duration-500 ease-in-out border-t border-white/5 bg-black/20 ${
                isMobileMenuOpen ? "max-h-[350px] py-6 px-6" : "max-h-0 py-0 px-6 pointer-events-none opacity-0"
              } overflow-hidden`}
            >
              <nav className="flex flex-col gap-4 text-base font-semibold text-slate-300">
                <a
                  href="#about"
                  className={`hover:text-[#00ffd1] transition-all duration-300 transform ${
                    isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[100ms]`}
                >
                  About
                </a>
                <a
                  href="#"
                  className={`hover:text-[#00ffd1] transition-all duration-300 transform ${
                    isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[200ms]`}
                >
                  Services
                </a>
                <a
                  href="#"
                  className={`hover:text-[#00ffd1] transition-all duration-300 transform ${
                    isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[300ms]`}
                >
                  Clients
                </a>
                <a
                  href="#"
                  className={`hover:text-[#00ffd1] transition-all duration-300 transform ${
                    isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[400ms]`}
                >
                  Pricing
                </a>
                <hr className="border-white/5 my-2" />
                <div
                  className={`flex gap-4 items-center transition-all duration-300 transform ${
                    isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  } delay-[500ms]`}
                >
                  <button className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 rounded-xl bg-white/5 transition duration-200">
                    Sign In
                  </button>
                  <button className="flex-1 text-center py-2.5 text-sm font-bold text-slate-950 bg-white rounded-xl hover:bg-slate-200 transition duration-200">
                    Get Started
                  </button>
                </div>
              </nav>
            </div>
          </header>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-36 pb-48 text-center max-w-5xl mx-auto">
        {/* Heading (Blur-in) */}
        <h1
          className={`text-5xl md:text-8xl font-normal tracking-tight mt-30 mb-8 leading-none text-white font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-lg scale-95"
          } delay-[700ms]`}
        >
          Your investment workspace.
        </h1>

        {/* Subtitle (Blur-in) */}
        <p
          className={`text-base md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed opacity-90 font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[900ms]`}
        >
          The power of many over the knowledge of one. Bipsync's AI-powered platform ensures institutional investors capture, structure, and leverage collective intelligence at scale.
        </p>

        {/* CTA Buttons (Slides up) */}
        <div
          className={`flex flex-row gap-4 justify-center items-center w-full transition-all duration-[1000ms] ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          } delay-[1100ms]`}
        >
          <button className="px-8 py-3.5 bg-[#00ffd1] hover:bg-[#00ffd1]/90 text-slate-950 font-semibold text-sm rounded-lg transition duration-200 shadow-lg shadow-emerald-500/10">
            Book a demo
          </button>
          <button className="px-8 py-3.5 border border-emerald-500/40 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm rounded-lg transition duration-200 backdrop-blur-sm">
            Find out more
          </button>
        </div>
      </div>

      {/* Spotlight & Features Section */}
      <div className="w-full bg-black relative z-10 border-t border-white/5">
        <div 
          className={`w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          } delay-[1200ms]`}
        >
          {/* Main Statements */}
          <ScrollBlurReveal className="max-w-4xl text-center mb-20 flex flex-col gap-6 font-clash">
            <p className="text-xl md:text-3xl text-white font-normal leading-relaxed">
              For over 35 years, the name De has stood for one thing in personal finance — trust.
            </p>
            <p className="text-xl md:text-3xl text-slate-400 font-normal leading-relaxed">
              Today, as the needs of investors evolve, we’re embracing the future with data-driven planning, technology-enabled insights, and a renewed commitment to what matters most: your financial future.
            </p>
            <p className="text-2xl md:text-4xl text-[#00ffd1] font-normal leading-relaxed mt-4 font-chillax">
              We've got everything covered.
            </p>
          </ScrollBlurReveal>
          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start relative">
            {/* Left Column: 3 Feature Cards */}
            <ScrollBlurReveal className="lg:col-span-5 flex flex-col gap-5 py-20">
              {/* Card 1: Capture & Centralize */}
              <div className="relative group border border-emerald-500/20 bg-slate-950/20 hover:bg-slate-950/40 p-6 rounded-2xl flex flex-col gap-2 transition-all duration-300 shadow-lg backdrop-blur-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="absolute top-6 right-6 text-[#00ffd1] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <path d="M5 5 L10 10 M10 10 H7 M10 10 V7" />
                    <path d="M19 5 L14 10 M14 10 H17 M14 10 V7" />
                    <path d="M5 19 L10 14 M10 14 H7 M10 14 V17" />
                    <path d="M19 19 L14 14 M14 14 H17 M14 14 V17" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white font-clash tracking-wide">Capture & Centralize</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans pr-8">
                  Automatically ingest research from emails, documents, and third-party providers.
                </p>
              </div>

              {/* Card 2: Structure & Collaborate */}
              <div className="relative group border border-emerald-500/20 bg-slate-950/20 hover:bg-slate-950/40 p-6 rounded-2xl flex flex-col gap-2 transition-all duration-300 shadow-lg backdrop-blur-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="absolute top-6 right-6 text-[#00ffd1] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="5" height="5" rx="1" />
                    <rect x="9.5" y="3" width="5" height="5" rx="1" />
                    <rect x="16" y="3" width="5" height="5" rx="1" />
                    <rect x="3" y="9.5" width="5" height="5" rx="1" />
                    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
                    <rect x="16" y="9.5" width="5" height="5" rx="1" />
                    <rect x="3" y="16" width="5" height="5" rx="1" />
                    <rect x="9.5" y="16" width="5" height="5" rx="1" />
                    <rect x="16" y="16" width="5" height="5" rx="1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white font-clash tracking-wide">Structure & Collaborate</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans pr-8">
                  Organize data intuitively across teams, with optional AI-assisted tagging.
                </p>
              </div>

              {/* Card 3: Analyze & Decide */}
              <div className="relative group border border-emerald-500/20 bg-slate-950/20 hover:bg-slate-950/40 p-6 rounded-2xl flex flex-col gap-2 transition-all duration-300 shadow-lg backdrop-blur-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="absolute top-6 right-6 text-[#00ffd1] group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M4 16v2a2 2 0 002 2h2M16 20h2a2 2 0 002-2v-2" />
                    <circle cx="11" cy="11" r="3" />
                    <path d="M20 20l-3-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white font-clash tracking-wide">Analyze & Decide</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans pr-8">
                  Leverage your team's collective intelligence at scale to surface insights and track workflows.
                </p>
              </div>
            </ScrollBlurReveal>

            {/* Right Column: Video Showcase */}
            <ScrollBlurReveal className="lg:col-span-7 relative flex items-center justify-center lg:sticky lg:top-[12rem] h-auto lg:h-[550px] w-full">
              {/* Ambient backing glow */}
              <div className="absolute -inset-2 pointer-events-none" />
              <div className="relative p-2.5 overflow-hidden w-full h-full flex items-center justify-center">
                <video
                  src="/assets/vid1.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover shadow-inner"
                />
              </div>
            </ScrollBlurReveal>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="w-full bg-black border-t border-white/5 relative z-10">
        <ScrollRevealSection
          text="we offer something no app can replicate — 35 years of relationship-driven expertise combined with modern portfolio intelligence, goal-based planning, and technology-backed analysis."
          isLoaded={isLoaded}
        />

        {/* Paragraphs Section */}
        <div className="w-full py-32 bg-black text-white relative z-10">
          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image: me.jpeg */}
            <ScrollBlurReveal className="lg:col-span-3 flex justify-center lg:justify-start order-2 lg:order-1">
              <img 
                src="/assets/me.jpeg" 
                alt="Me" 
                className="w-full max-w-[280px] lg:max-w-full h-auto object-cover rounded-2xl shadow-2xl"
              />
            </ScrollBlurReveal>

            {/* Center Text Column */}
            <ScrollBlurReveal className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 w-full">
              <div className="max-w-[460px] flex flex-col gap-8 text-sm md:text-[15px] text-white leading-relaxed font-sans text-left">
                <p>
                  <span className="font-bold text-white">Arindam De</span> began this journey in 1989 in the insurance and financial services space, building a practice rooted in long-term client relationships at a time when financial planning was still a privilege of the few. From 2004 onwards, he expanded into mutual funds — bringing the same discipline and depth that defined his insurance practice into the world of market-linked investments. Today, he operates across the full spectrum of financial services: Mutual Funds, Specialised Investment Funds, Portfolio Management Services, Life Insurance, Mediclaim, Vehicle Insurance, Householder Insurance, Fixed Deposits, and PNB Housing Finance. His client relationships aren't measured in transactions. They're measured in decades.

                </p>
                <p>
                  <span className="font-bold text-white">Arijit De</span> represents the next chapter, a B.Tech graduate in Computer Science, SEBI-certified Mutual Fund Distributor (ARN-273396) and SIF distributor, Arijit brings a data-driven, technology-assisted approach to advisory that the previous generation of investors never had access to. In under 5 years, he has established a strong and growing advisory practice — built entirely on trust, structured planning, and personalised guidance. An MBA beginning next year will further strengthen his expertise at the intersection of finance and technology.

                </p>
              </div>
            </ScrollBlurReveal>

            {/* Right Image: about.jpeg */}
            <ScrollBlurReveal className="lg:col-span-4 flex justify-center lg:justify-end order-3 lg:order-3">
              <img 
                src="/assets/about.jpeg" 
                alt="About" 
                className="w-full max-w-[540px] lg:max-w-full h-auto object-cover rounded-2xl shadow-2xl pointer-events-none"
              />
            </ScrollBlurReveal>

          </div>
        </div>
      </div>

      {/* Scroll Video Player Section */}
      <ScrollVideoPlayer
        src="/assets/footer.mp4"
        isLoaded={isLoaded}
      />

      {/* Services Sticky Constellation Section */}
      <div className="w-full bg-black relative z-10 pt-32 pb-[50vh] overflow-visible">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative">
          
          {/* Left Column: Sticky Constellation Graphic */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center items-center lg:sticky lg:top-[25%] py-6 lg:py-0 h-auto">
            <ScrollBlurReveal className="w-full flex flex-col items-center gap-6">
              <ServicesConstellation activeIndex={activeService} />
              <div className="text-[10px] md:text-sm uppercase text-white font-clash font-mono text-center">
                Active Node: 0{activeService + 1} / 08
              </div>
            </ScrollBlurReveal>
          </div>

          {/* Right Column: Title and 8 Scrollable Items */}
          <div className="lg:col-span-7 flex flex-col gap-12 w-full">
            <ScrollBlurReveal className="flex flex-col gap-4 text-left">
              <span className="text-[10px] md:text-sm uppercase text-white font-mono font-bold font-clash">
                Services & Solutions
              </span>
              <h2 className="text-3xl md:text-5xl font-normal leading-tight text-white font-clash">
                Comprehensive wealth planning under one roof.
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl font-sans mt-2">
                We combine decades of personal finance trust with modern technology-backed analysis to ensure you capture and compound growth securely.
              </p>
            </ScrollBlurReveal>

            {/* List of 8 Services */}
            <div className="flex flex-col border-t border-white/10 w-full mt-6">
              {servicesData.map((service, idx) => {
                const isActive = idx === activeService;
                return (
                  <div
                    key={idx}
                    ref={(el) => { serviceRefs.current[idx] = el; }}
                    className={`py-8 border-b border-white/10 transition-all duration-500 flex flex-col text-left cursor-default ${
                      isActive ? "opacity-100" : "opacity-30 hover:opacity-50"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full gap-4">
                      <div className="flex items-center gap-6 md:gap-8">
                        {/* Number Index */}
                        <span className={`text-xs md:text-sm font-mono tracking-wider transition-colors duration-500 ${
                          isActive ? "text-[#00ffd1]" : "text-slate-500"
                        }`}>
                          0{idx + 1}
                        </span>
                        {/* Service Title */}
                        <h3 className={`text-lg md:text-2xl font-normal tracking-wide transition-colors duration-500 font-clash ${
                          isActive ? "text-white" : "text-slate-300"
                        }`}>
                          {service.title}
                        </h3>
                      </div>
                      
                      {/* Plus/Minus Indicator */}
                      <span className={`text-xl transition-transform duration-500 ${
                        isActive ? "text-[#00ffd1] rotate-45" : "text-slate-500"
                      }`}>
                        +
                      </span>
                    </div>

                    {/* Accordion description container (Modern CSS Grid transition) */}
                    <div className={`grid transition-all duration-[500ms] ease-in-out ${
                      isActive ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    }`}>
                      <div className="overflow-hidden">
                        <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl pl-12 md:pl-16 font-sans">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>

      {/* Why Us Section */}
      <div className="w-full bg-black relative z-10 py-32 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_75%)] pointer-events-none select-none" />

        <div className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          <ScrollBlurReveal className="flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-normal leading-tight text-white font-clash mb-12">
              Why us?
            </h2>
            <p className="text-xl md:text-3xl text-slate-100 font-normal leading-relaxed max-w-4xl mx-auto font-sans tracking-wide">
              Because your money deserves <span className="text-[#00ffd1] font-medium">more than an algorithm</span>. It deserves people who have seen market cycles, managed real portfolios through real crises, and still show up — <span className="text-[#00ffd1] font-medium">every single time</span>.
            </p>
          </ScrollBlurReveal>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full bg-black relative z-10 py-32 border-t border-white/5 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative">
          
          {/* Left Column: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-left lg:sticky lg:top-[25%]">
            <ScrollBlurReveal className="flex flex-col gap-4">
              <span className="text-[10px] md:text-sm uppercase text-white font-clash font-bold">
                Common Inquiries
              </span>
              <h2 className="text-3xl md:text-5xl font-normal leading-tight text-white font-clash">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400 text-sm font-sans mt-2">
                Can't find the answer you're looking for? Reach out to our advisory team at <a href="mailto:contact@finanalysis.in" className="text-white hover:text-[#00ffd1] transition font-mono">contact@finanalysis.in</a>.
              </p>
            </ScrollBlurReveal>
          </div>

          {/* Right Column: Interactive Accordion List */}
          <div className="lg:col-span-8 flex flex-col w-full border-t border-white/10 mt-6 lg:mt-0">
            {faqData.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-white/10 py-6 flex flex-col text-left transition-colors duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex justify-between items-center w-full gap-4 text-left focus:outline-none group"
                  >
                    <h3 className={`text-base md:text-lg font-normal tracking-wide transition-colors duration-300 font-clash ${
                      isOpen ? "text-white" : "text-slate-300 group-hover:text-white"
                    }`}>
                      {faq.question}
                    </h3>
                    
                    {/* Expand/Collapse Chevron Indicator */}
                    <span className={`text-xl md:text-2xl transition-transform duration-500 text-slate-500 ${
                      isOpen ? "text-[#00ffd1] rotate-180" : "group-hover:text-white"
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {/* Accordion description container (Modern CSS Grid transition) */}
                  <div className={`grid transition-all duration-[500ms] ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans pr-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Footer Section */}
      <footer ref={footerRef} className="w-full bg-black border-t border-white/5 relative z-10 pt-24 pb-0 overflow-hidden">
        {/* Top Columns Grid */}
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 text-sm font-sans mb-20 text-slate-400 text-left">
          {/* Location & Time */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-medium text-xs tracking-wider uppercase font-mono">India</span>
            <span className="text-slate-300 font-normal text-sm font-mono">{currentTime || "22:55:56"}</span>
            <span className="text-slate-500 text-xs font-mono">(GMT+5:30)</span>
          </div>

          {/* About */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-medium text-xs tracking-wider uppercase font-mono">About</span>
            <a href="#about" className="text-slate-400 hover:text-white transition duration-200 text-sm">About Us</a>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Process</a>
          </div>

          {/* Projects */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-medium text-xs tracking-wider uppercase font-mono flex items-center gap-1">
              Projects<span className="text-[9px] text-[#00ffd1] font-mono leading-none align-super">(4)</span>
            </span>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Services</a>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Pricing</a>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-medium text-xs tracking-wider uppercase font-mono">Socials</span>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Instagram</a>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Newsletter</a>
            <a href="#" className="text-slate-400 hover:text-white transition duration-200 text-sm">Medium</a>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-medium text-xs tracking-wider uppercase font-mono">Contact</span>
            <a href="mailto:contact@finanalysis.in" className="text-slate-400 hover:text-white transition duration-200 text-sm break-all font-mono">
              contact@finanalysis.in
            </a>
          </div>
        </div>

        {/* Middle Divider Row */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-white/10 max-w-5xl mx-auto px-6 py-6 text-xs text-slate-500 font-sans gap-4">
          <span>©2026 FinAnalysis</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition duration-200">Privacy</a>
            <a href="#" className="hover:text-white transition duration-200">Terms</a>
            <a href="#" className="hover:text-white transition duration-200">Cookies</a>
          </div>
          <span>Website by <a href="https://arddev.in" target="_blank" rel="noopener noreferrer" className="hover:text-white font-bold transition duration-200">ard.dev</a></span>
        </div>

        {/* Big Brand Logo Text */}
        <div className="w-full overflow-hidden flex justify-center items-end relative h-[14vw] min-h-[100px] mt-10">
          {/* Ambient backing glow centered under the big logo */}
          <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] rounded-full bg-[radial-gradient(circle,rgba(0,255,209,0.12)_0%,transparent_70%)] pointer-events-none select-none" />
          
          <h1 className="font-chillax text-[18vw] font-bold text-white tracking-tighter leading-none select-none translate-y-[20%] text-center uppercase">
            FinAnalysis
          </h1>
        </div>
      </footer>

      {/* Preloader Overlay Screen (Slides down smoothly) */}
      {!preloaderGone && (
        <div
          className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#020503] p-12 md:p-20 transition-transform duration-[1000ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
            isLoaded ? "translate-y-full" : "translate-y-0"
          }`}
        >
          {/* Top Row: Brand Info */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white tracking-wide">Arijit De ©2026</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Video player */}
          <div className="flex-1 flex items-center justify-center w-full max-w-[280px] mx-auto my-4">
            <video
              ref={videoRef}
              src="/assets/preloader.mp4"
              autoPlay
              muted
              playsInline
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Bottom Row: Counter on the Right */}
          <div className="flex justify-end items-end w-full">
            {/* Display Counter (Bottom Right) */}
            <div className="text-right">
              <span className="text-8xl md:text-[10rem] font-bold text-white tracking-tight font-clash select-none leading-none">
                {count}%
              </span>
            </div>
          </div>
        </div>
      )}
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
            <div className="w-80 md:w-96 h-[450px] md:h-[500px] mb-4 rounded-3xl border border-white/15 bg-transparent backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 origin-bottom-right">
              {/* Header */}
              <div className="px-5 py-4 bg-transparent border-b border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-white tracking-wide font-clash">Finsync AI</span>
                    <span className="text-[10px] text-white/60 font-mono">AI AGENT • ONLINE</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/60 hover:text-white transition duration-150 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10 select-text">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-white border border-white/10 ${
                      msg.sender === "user"
                        ? "bg-white/10 rounded-br-none self-end text-left font-clash"
                        : "bg-white/5 rounded-bl-none self-start text-left font-clash"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm self-start flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-[100ms]" />
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-[200ms]" />
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-[300ms]" />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/15 bg-transparent flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask about scoring criteria, anomalies..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-transparent border border-white/15 text-white focus:outline-none focus:border-white/40 placeholder-white/40 font-clash"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition duration-200"
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
            <div className="absolute bottom-16 right-2 mb-2.5 bg-slate-950/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white tracking-wide shadow-lg whitespace-nowrap select-none font-clash">
              Ask me <span className="text-[#01ffc6]">anything !</span>
              {/* Arrow */}
              <div className="absolute bottom-[-5px] right-5 w-2.5 h-2.5 bg-slate-950 border-r border-b border-white/10 rotate-45" />
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
