'use client';

import { useState, useEffect, useRef } from "react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import Lenis from "lenis";
import GradualBlur from "@/components/GradualBlur";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import ScrollBlurReveal from "@/components/ScrollBlurReveal";
import ServicesConstellation from "@/components/ServicesConstellation";
import { GoArrowDownRight } from "react-icons/go";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollVideoRef = useRef<HTMLVideoElement | null>(null);



  // Daily Rewards Section States
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Select daily quote based on calendar day
    const quotesList = [
      { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
      { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
      { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
      { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "John Templeton" },
      { text: "The most powerful force in the universe is compound interest.", author: "Albert Einstein" },
      { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
      { text: "Know what you own, and know why you own it.", author: "Peter Lynch" }
    ];
    const day = new Date().getDate();
    setDailyQuote(quotesList[day % quotesList.length] || quotesList[0]);
  }, []);

  // Cookie Acceptance State
  const [showCookieBox, setShowCookieBox] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieBox(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const animationRef = useRef<number | null>(null);

  // Hero Scroll-driven Animation States
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const scrolled = -rect.top;
      const maxScroll = rect.height - window.innerHeight;

      if (maxScroll <= 0) return;

      let progress = scrolled / maxScroll;
      progress = Math.min(1, Math.max(0, progress));
      setHeroProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Clock state removed, handled in component

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
        threshold: 0,
        rootMargin: "0px 0px 100px 0px",
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Scroll-driven video playback loop
  useEffect(() => {
    let animationFrameId: number;
    let targetTime = 0;

    const handleScrollVideo = () => {
      const video = scrollVideoRef.current;
      const container = scrollVideoContainerRef.current;
      if (!video || !container) {
        animationFrameId = requestAnimationFrame(handleScrollVideo);
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only perform calculations when container is visible in viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        animationFrameId = requestAnimationFrame(handleScrollVideo);
        return;
      }

      const duration = video.duration;
      if (!isNaN(duration) && duration > 0) {
        const scrollRange = rect.height - viewportHeight;
        const relativeScroll = -rect.top;

        let progress = relativeScroll / scrollRange;
        progress = Math.max(0, Math.min(1, progress));

        targetTime = progress * duration;

        // Smooth LERP interpolation (0.15 factor for responsiveness vs smoothness)
        const diff = targetTime - video.currentTime;
        if (Math.abs(diff) > 0.005) {
          video.currentTime += diff * 0.15;
        } else {
          video.currentTime = targetTime;
        }

      }

      animationFrameId = requestAnimationFrame(handleScrollVideo);
    };

    animationFrameId = requestAnimationFrame(handleScrollVideo);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
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



  useEffect(() => {
    let startTime = Date.now();
    const duration = 5000; // 5 seconds preloader duration

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setCount(progress);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        triggerEnd();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#F2F0EF] bg-[radial-gradient(circle_at_bottom,rgba(147,197,253,0.95)_0%,rgba(186,230,253,0.65)_45%,rgba(242,240,239,0)_85%)]">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} />

      {/* Scroll-Driven Morphing Hero Section */}
      <div ref={heroRef} className="h-[180vh] w-full relative z-10 bg-transparent">
        {/* Sticky viewport frame */}
        <div className="sticky top-0 h-screen w-full overflow-hidden select-none bg-transparent">
          {/* Animated Morphing me.jpeg */}
          {(() => {
            const isMobile = windowSize.width < 768;

            // Coordinates & sizes
            const startX = isMobile ? windowSize.width - 60 - 24 : windowSize.width - 80 - 48;
            const startY = isMobile ? 120 : 140;
            const startSize = isMobile ? 60 : 80;

            const endX = isMobile ? windowSize.width / 2 - 100 : windowSize.width * 0.15;
            const endY = isMobile ? windowSize.height * 0.22 : windowSize.height / 2 - 160;
            const endSize = isMobile ? 200 : 320;
            const endRadius = isMobile ? 16 : 24;

            // Interpolated values
            const x = startX + heroProgress * (endX - startX);
            const y = startY + heroProgress * (endY - startY);
            const size = startSize + heroProgress * (endSize - startSize);

            // Interpolate border radius (from size/2 to endRadius)
            const startRadius = startSize / 2;
            const borderRadius = startRadius + heroProgress * (endRadius - startRadius);

            // Interpolate shadow opacity
            const shadowOpacity = heroProgress * 0.15;

            return (
              <div
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 20px 40px rgba(0, 0, 0, ${shadowOpacity})`,
                  overflow: "hidden",
                  transition: "box-shadow 0.1s ease-out",
                }}
                className="border border-border z-20 flex items-center justify-center bg-card"
              >
                <img
                  src="/assets/me.jpeg"
                  alt="Arijit De"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })()}

          {/* Fade-in Text Options */}
          {(() => {
            const isMobile = windowSize.width < 768;
            const textOpacity = Math.max(0, (heroProgress - 0.75) / 0.25);
            const textYOffset = (1 - textOpacity) * 20; // slide up 20px on fade

            const endX = isMobile ? windowSize.width / 2 - 100 : windowSize.width * 0.15;
            const endY = isMobile ? windowSize.height * 0.22 : windowSize.height / 2 - 160;
            const endSize = isMobile ? 200 : 320;

            const textLeft = isMobile ? windowSize.width / 2 - 140 : endX + endSize + 80;
            // Shift desktop top slightly up to give room for expansions
            const textTop = isMobile ? endY + endSize + 32 : windowSize.height / 2 - 160;

            const handleSmoothScroll = (e: React.MouseEvent, selector: string) => {
              e.preventDefault();
              const element = document.querySelector(selector);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            };

            const toggleOption = (option: string) => {
              setExpandedOption(expandedOption === option ? null : option);
            };

            return (
              <div
                style={{
                  position: "absolute",
                  left: `${textLeft}px`,
                  top: `${textTop}px`,
                  opacity: textOpacity,
                  transform: `translateY(${textYOffset}px)`,
                  pointerEvents: heroProgress >= 0.75 ? "auto" : "none",
                  transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
                  zIndex: 10,
                }}
                className="flex flex-col gap-4 md:gap-6 text-left select-text relative z-10"
              >
                {/* 01: About Us */}
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleOption("about")}
                    className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                  >
                    <span className={`text-xs md:text-sm font-mono transition duration-200 ${expandedOption === "about" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>01</span>
                    <span className={`font-heading text-2xl md:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "about" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      About Us
                      <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-sm md:text-base text-[#64748B] ${expandedOption === "about" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        FinAnalysis blends over 35 years of trusted financial advisory with modern technology and data science. Founded on a legacy started by <strong className="text-primary font-semibold">Arindam De</strong> in 1989, we have transitioned across multiple market cycles to safeguard and grow client wealth. Today, <strong className="text-primary font-semibold">Arijit De</strong> (SEBI-certified Mutual Fund Distributor ARN-273396 and SIF distributor) integrates computer science analytics, systematic portfolio optimization, and structured asset allocation, delivering a modern, data-backed approach to wealth management that prior generations never had access to.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 02: What we provide */}
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleOption("services")}
                    className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                  >
                    <span className={`text-xs md:text-sm font-mono transition duration-200 ${expandedOption === "services" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>02</span>
                    <span className={`font-heading text-2xl md:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "services" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      What we provide
                      <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-sm md:text-base text-[#64748B] ${expandedOption === "services" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        We provide a comprehensive, fully regulated suite of financial and wealth creation solutions tailored to your unique lifecycle goals. This includes systematically managed <span className="font-semibold text-primary">Mutual Funds & SIP planning</span> for long-term compound growth, high-yield <span className="font-semibold text-primary">Fixed Deposits, Specialized Investment Funds (SIF)</span>, and <span className="font-semibold text-primary">Portfolio Management Services (PMS)</span> for sophisticated asset allocation. Additionally, we protect your family's future with robust <span className="font-semibold text-primary">Life Insurance (LIC), Mediclaim Health Insurance, Vehicle/Property Insurance</span>, and provide leverage options through <span className="font-semibold text-primary">PNB Housing Finance</span> home loans.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 03: Why we exist */}
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleOption("why-us")}
                    className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                  >
                    <span className={`text-xs md:text-sm font-mono transition duration-200 ${expandedOption === "why-us" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>03</span>
                    <span className={`font-heading text-2xl md:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "why-us" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                      Why we exist
                      <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                    </span>
                  </button>
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-sm md:text-base text-[#64748B] ${expandedOption === "why-us" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        In an era dominated by cold robo-advisors and static investment apps, your hard-earned wealth deserves personalized, <span className="font-semibold text-primary">relationship-driven human advisory</span>. We exist to bridge the gap between human empathy and data precision. By standing by our clients through decades of market turbulence, recessions, and regulatory shifts, we prioritize multi-generational trust and structured planning. We don't just measure relationships in transactions; we measure them in decades of successful outcomes and financial security.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </div>

      {/* Interactive Chatbot Promo Section */}
      <div className="w-full relative z-10  py-20 px-6 overflow-hidden">
        {/* Ambient backing glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(46,125,50,0.03)_0%,transparent_70%)] pointer-events-none select-none" />

        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4 max-w-xl text-left">
            <span className="text-[10px] font-mono text-primary border border-primary/25 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Instant Advisory
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary font-clash">
              Meet Finsync AI: Real-Time Insights, Zero Waiting.
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed font-sans">
              Have questions about how we check anomalies, calculate fee efficiency, or structure systematic portfolios? Finsync AI is trained directly on our 35-year advisory playbook to answer your investment questions instantly.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/35 backdrop-blur-2xl border border-border rounded-2xl md:min-w-[280px] shadow-sm text-center relative group">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 block">interactive demo</span>
            <span className="text-lg font-semibold text-primary font-clash">Try Finsync AI Now</span>

            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full mt-5 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm"
            >
              <span>Launch AI Assistant</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Bouncing Pointer Arrow towards Bottom-Right Chatbot Widget (visible on hover) */}
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[#64748B] font-mono text-[9px] uppercase tracking-wider">Look at the bottom right</span>
              <svg
                className="w-3.5 h-3.5 text-[#C9A54C] animate-diagonal-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 19H9m10 0V9m0 10L5 5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight & Features Section */}
      <div className="w-full bg-transparent relative z-10">
        <div
          className={`w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center transition-all duration-[1200ms] ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            } delay-[1200ms]`}
        >
          {/* Main Statements */}
          <ScrollBlurReveal className="max-w-4xl text-center mb-20 flex flex-col gap-6 font-clash">
            <p className="text-xl md:text-3xl text-primary font-medium leading-relaxed">
              For over 35 years, the name De has stood for one thing in personal finance — trust.
            </p>
            <p className="text-xl md:text-3xl text-muted-foreground font-normal leading-relaxed">
              Today, as the needs of investors evolve, we’re embracing the future with data-driven planning, technology-enabled insights, and a renewed commitment to what matters most: your financial future.
            </p>
            <p className="text-2xl md:text-4xl text-primary font-semibold leading-relaxed mt-4 font-chillax">
              We've got everything covered.
            </p>
          </ScrollBlurReveal>

          {/* Bento Grid Layout */}
          <ScrollBlurReveal className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Card 1: Capture & Centralize (col-span-2) */}
              <div className="md:col-span-2 p-8 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:shadow-md hover:border-primary/20 group relative overflow-hidden text-left">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <path d="M5 5 L10 10 M10 10 H7 M10 10 V7" />
                      <path d="M19 5 L14 10 M14 10 H17 M14 10 V7" />
                      <path d="M5 19 L10 14 M10 14 H7 M10 14 V17" />
                      <path d="M19 19 L14 14 M14 14 H17 M14 14 V17" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  <h3 className="text-xl font-bold text-primary font-clash tracking-wide">Capture & Centralize</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans max-w-xl">
                    Automatically ingest research from emails, documents, and third-party providers.
                  </p>
                </div>
              </div>

              {/* Card 2: Structure & Collaborate (col-span-1) */}
              <div className="p-6 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:shadow-md hover:border-primary/20 group relative overflow-hidden text-left">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                </div>
                <div className="space-y-2 mt-6">
                  <h3 className="text-xl font-bold text-primary font-clash tracking-wide">Structure & Collaborate</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    Organize data intuitively across teams, with optional AI-assisted tagging.
                  </p>
                </div>
              </div>

              {/* Card 3: Analyze & Decide (col-span-3) */}
              <div className="md:col-span-3 p-8 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 group relative overflow-hidden text-left">
                <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 shrink-0 self-start md:self-auto">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M4 16v2a2 2 0 002 2h2M16 20h2a2 2 0 002-2v-2" />
                      <circle cx="11" cy="11" r="3" />
                      <path d="M20 20l-3-3" />
                    </svg>
                  </div>
                  <div className="space-y-2 max-w-xl">
                    <h3 className="text-2xl font-bold text-primary font-clash tracking-wide">Analyze & Decide</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                      Leverage your team's collective intelligence at scale to surface insights and track workflows.
                    </p>
                  </div>
                </div>
                <div className="z-10 shrink-0 mt-2 md:mt-0">
                  <a href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs rounded-2xl transition duration-200 shadow-sm uppercase tracking-wider">
                    <span>Get Started Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </ScrollBlurReveal>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="w-full  relative z-10">
        <ScrollRevealSection
          text="we offer something no app can replicate — 35 years of relationship-driven expertise combined with modern portfolio intelligence, goal-based planning, and technology-backed analysis."
          isLoaded={isLoaded}
        />
      </div>

      {/* Investor Quiz Section */}
      <div className="w-full relative z-10 py-16 px-6">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
            {/* Background decorative glows */}
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 max-w-2xl relative z-10">
              <span className="text-[10px] font-mono text-primary border border-primary/25 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                Investor Profiling
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-clash leading-tight">
                Know what kind of investor you are !
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-sans">
                Are you a Conservative Protector, a Strategic Compounder, or an Aggressive Visionary? Take our quick 2-minute diagnostic to analyze your risk preference and discover the asset mix that fits your lifestyle.
              </p>
            </div>

            <div className="shrink-0 relative z-10 w-full md:w-auto">
              <a
                href="/quiz"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group"
              >
                <span>Start Quiz</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Portfolio Analysis Section */}
      <div className="w-full relative z-10 py-16 px-6">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col lg:flex-row gap-12 text-left items-stretch">
            {/* Background decorative glows */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Left Column: Details */}
            <div className="flex-1 flex flex-col justify-between space-y-8 relative z-10">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-primary border border-primary/25 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                  Portfolio Diagnostic
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-clash leading-tight">
                  Analyze your portfolio in real-time
                </h2>
                <p className="text-[#64748B] text-sm leading-relaxed font-sans max-w-md">
                  Get a comprehensive overview of your investment health. We measure your portfolio across 5 core regulatory and performance dimensions to optimize your yields.
                </p>
              </div>

              {/* Pillars List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Goal Alignment", desc: "Matching assets to timeline" },
                  { name: "Asset Allocation", desc: "Optimal equity/debt splits" },
                  { name: "Diversification", desc: "Risk dispersion balance" },
                  { name: "SIP Discipline", desc: "Consistency efficiency" },
                  { name: "Fee Efficiency", desc: "Minimizing expense ratios" }
                ].map((pillar, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-white/30 rounded-2xl border border-border/50">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/5 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-primary font-clash">{pillar.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group"
                >
                  <span>Evaluate My Portfolio</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Mock Scorecard */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <div className="w-full h-full min-h-[300px] p-6 bg-white/30 rounded-2xl border border-border/50 flex flex-col justify-between gap-6 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-primary font-clash tracking-wide uppercase">Scorecard Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">DEMO PORTFOLIO</span>
                </div>

                {/* Score Circle & Metrics */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                  {/* Radial Progress Circle */}
                  <div className="relative w-36 h-36 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(147, 197, 253, 0.15)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#2E7D32"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.78)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-clash text-primary leading-none">78</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase mt-1">Health Score</span>
                    </div>
                  </div>

                  {/* Vertical Progress Bars */}
                  <div className="flex-1 w-full space-y-3">
                    {[
                      { name: "Goal Match", score: 85, color: "bg-emerald-600" },
                      { name: "Allocation", score: 65, color: "bg-amber-500" },
                      { name: "Fee Efficiency", score: 92, color: "bg-emerald-600" }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-primary">
                          <span>{metric.name}</span>
                          <span className="font-mono">{metric.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer advice */}
                <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl text-left">
                  <span className="text-[10px] font-bold text-[#2E7D32] font-mono uppercase block mb-1">Advisor Alert</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    High exposure in thematic mutual funds detected. Consider rebalancing into broad-market index options to increase fee efficiency and lower tracking variance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Calculators Hub Section */}
      <div id="calculators" className="w-full relative z-10 py-16 px-6 bg-transparent">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-clash leading-tight mt-3">
              Premium Financial Calculators
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed font-sans mt-3 max-w-2xl">
              Use our suite of interactive financial calculators to project systematic investments, model recurring deposits, optimize fees, and visualize prepayment schedules.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="/quiz"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition duration-200 shadow-md uppercase tracking-wider group"
              >
                <span>Start Quiz</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Calculator Grid */}
          <div id="calculators" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "SIP Calculator",
                desc: "Model your systematic investments and project future returns based on compounding growth.",
                href: "/sip-calculator"
              },
              {
                title: "Step-up SIP Calculator",
                desc: "Calculate how stepping up your monthly contributions annually can exponentially accelerate wealth creation.",
                href: "/step-up-sip-calculator"
              },
              {
                title: "Lumpsum Calculator",
                desc: "Project the compounding growth of a one-time principal investment over any tenure.",
                href: "/lumpsum-calculator"
              },
              {
                title: "SIF Calculator",
                desc: "Model Specialized Investment Fund compounding returns using target hurdle rates and top-ups.",
                href: "/sif-calculator"
              },
              {
                title: "PMS Calculator",
                desc: "Analyze Portfolio Management Services returns after factoring in management fees.",
                href: "/pms-calculator"
              },
              {
                title: "Fixed Deposit (FD)",
                desc: "Compute fixed deposit returns with quarterly compounding interest.",
                href: "/fd-calculator"
              },
              {
                title: "Recurring Deposit (RD)",
                desc: "Estimate recurring deposit maturity values based on quarterly compounded interest.",
                href: "/rd-calculator"
              },
              {
                title: "EMI Calculator",
                desc: "Calculate monthly payments and total interest outgo for any home, car, or personal loan.",
                href: "/emi-calculator"
              },
              {
                title: "Loan Calculator",
                desc: "Visualize prepayment schedules to see how much interest and tenure you can save.",
                href: "/loan-calculator"
              }
            ].map((calc, i) => (
              <a
                key={i}
                href={calc.href}
                className="group flex flex-col justify-between p-6 bg-white/35 backdrop-blur-2xl border border-border rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 text-primary font-mono text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    0{i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-primary font-clash mb-2 group-hover:text-[#3A8293] transition-colors duration-300">
                    {calc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-6">
                    {calc.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary tracking-wider uppercase font-sans">
                  <span>Calculate Now</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Daily Rewards Quotes Section */}
      <div id="daily-rewards" className="w-full relative z-10 py-16 px-6 bg-transparent">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-clash leading-tight mt-3">
                Daily Wisdom & Rewards
              </h2>
              <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 mt-3">
                <DotLottieReact
                  src="https://lottie.host/8866dfb7-4cf0-4918-88c1-8b34b9434bd7/qZLurleDmZ.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed font-sans mt-3 max-w-xl mx-auto">
              Get a new financial quote every 24 hours. Click the card below to turn it over and claim your daily reward promo code!
            </p>
          </div>

          {/* Flippable Card Container */}
          <div
            className="w-full max-w-xl mx-auto h-[320px] [perspective:1000px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="relative w-full h-full duration-700 transition-transform"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side of Card */}
              <div
                className="absolute inset-0 w-full h-full p-8 md:p-12 rounded-3xl bg-white/35 backdrop-blur-2xl border border-border shadow-sm flex flex-col justify-between items-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full flex justify-between items-center border-b border-border/20 pb-3">
                  <span className="text-[9px] font-mono text-primary tracking-widest uppercase font-bold">Daily Quote</span>
                  <span className="text-[9px] font-mono text-slate-400">ACTIVE FOR 24H</span>
                </div>

                <div className="my-auto py-4">
                  <p className="text-lg md:text-xl font-medium font-clash italic leading-relaxed text-primary">
                    "{dailyQuote.text}"
                  </p>
                  <span className="block text-right text-[10px] md:text-xs text-slate-500 font-mono mt-3">
                    — {dailyQuote.author}
                  </span>
                </div>

                <div className="flex justify-center items-center gap-2 text-[10px] md:text-xs font-bold text-[#3A8293] uppercase tracking-wider">
                  <span>Tap Card to Reveal Reward</span>
                  <span className="animate-bounce">🎁</span>
                </div>
              </div>

              {/* Back Side of Card */}
              <div
                className="absolute inset-0 w-full h-full p-8 md:p-12 rounded-3xl bg-white/35 backdrop-blur-2xl border border-border shadow-sm flex flex-col justify-between items-center text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-full flex justify-between items-center border-b border-border/20 pb-3">
                  <span className="text-[9px] font-mono text-primary tracking-widest uppercase font-bold">Reward Portal</span>
                  <span className="text-[9px] font-mono text-slate-400">COUPON VALID TODAY</span>
                </div>

                {isLoggedIn ? (
                  // Logged In State: Show Reward clearly
                  <div className="w-full my-auto space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-mono text-[#3A8293] uppercase tracking-widest block font-bold">Your Unlocked Code</span>
                      <div className="text-xl md:text-2xl font-bold font-mono text-primary mt-1.5 uppercase tracking-wider select-all cursor-pointer">
                        DAILYWISE15
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      Congratulations! You've unlocked 15% off standard advisory package audits. Mention this code when connecting with our experts.
                    </p>
                  </div>
                ) : (
                  // Logged Out State: Blur and lock reward
                  <div className="w-full my-auto space-y-4">
                    <div className="relative bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center overflow-hidden">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block select-none">Locked Promo Code</span>
                      <div className="text-xl md:text-2xl font-bold font-mono text-primary mt-1.5 select-none filter blur-md select-none pointer-events-none">
                        DAILYWISE15
                      </div>
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px] flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-[11px] text-red-500 font-semibold leading-relaxed font-sans">
                      Daily reward is locked. Please sign in to view and claim this exclusive promo code.
                    </p>
                  </div>
                )}

                <div className="w-full">
                  {isLoggedIn ? (
                    <div className="flex justify-center items-center gap-1.5 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      <span>Reward unlocked successfully</span>
                      <span>✓</span>
                    </div>
                  ) : (
                    <a
                      href="/onboarding"
                      onClick={(e) => e.stopPropagation()} // Stop click propagating to rotate card back
                      className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground text-center block rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200"
                    >
                      Sign In to Claim Reward
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="w-full bg-transparent relative z-10 py-32  overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative">

          {/* Left Column: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col gap-4 text-left lg:sticky lg:top-[25%]">
            <ScrollBlurReveal className="flex flex-col gap-4">
              <span className="text-[10px] md:text-sm uppercase text-muted-foreground font-clash font-bold">
                Common Inquiries
              </span>
              <h2 className="text-3xl md:text-5xl font-normal leading-tight text-primary font-clash">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-sm font-sans mt-2">
                Can't find the answer you're looking for? Reach out to our advisory team at <a href="mailto:contact@finanalysis.in" className="text-primary hover:underline font-mono">contact@finanalysis.in</a>.
              </p>
            </ScrollBlurReveal>
          </div>

          {/* Right Column: Interactive Accordion List */}
          <div className="lg:col-span-8 flex flex-col w-full border-t border-border mt-6 lg:mt-0">
            {faqData.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-border py-6 flex flex-col text-left transition-colors duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex justify-between items-center w-full gap-4 text-left focus:outline-none group"
                  >
                    <h3 className={`text-base md:text-lg font-normal tracking-wide transition-colors duration-300 font-clash ${isOpen ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"
                      }`}>
                      {faq.question}
                    </h3>

                    {/* Expand/Collapse Chevron Indicator */}
                    <span className={`text-xl md:text-2xl transition-transform duration-500 text-muted-foreground ${isOpen ? "text-primary rotate-180" : "group-hover:text-primary"
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {/* Accordion description container */}
                  <div className={`grid transition-all duration-[500ms] ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden bg-card p-4 rounded-xl border border-border shadow-sm">
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans pr-4">
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

      {/* Scroll-Driven Video Playback Showcase */}
      <div
        ref={scrollVideoContainerRef}
        className="relative w-full h-[180vh] bg-transparent overflow-visible mt-20"
      >
        {/* Sticky viewport container - Full Bleed */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">

          {/* Video element container - Full Bleed */}
          <div className="relative w-full h-full bg-black">
            <video
              ref={scrollVideoRef}
              src="/assets/video2.mp4"
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>

      <Footer footerRef={footerRef} />

      {/* Preloader Overlay Screen (Slides down smoothly) */}
      {!preloaderGone && (
        <div
          className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#F2F0EF] p-12 md:p-20 transition-transform duration-[1000ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isLoaded ? "translate-y-full" : "translate-y-0"
            }`}
        >
          {/* Top Row: Brand Info */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-primary tracking-wide">Arijit De ©2026</span>
              </div>
            </div>
          </div>

          {/* Middle Row: GIF player */}
          <div className="flex-1 flex items-center justify-center w-full max-w-[280px] mx-auto my-4">
            <img
              src="/assets/video.gif"
              alt="Preloader animation"
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Bottom Row: Counter on the Right */}
          <div className="flex justify-end items-end w-full">
            {/* Display Counter */}
            <div className="text-right">
              <span className="text-8xl md:text-[10rem] font-bold text-primary tracking-tight font-clash select-none leading-none">
                {count}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget
        isFooterIntersecting={isFooterIntersecting}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      {/* Cookie Acceptance Banner */}
      {showCookieBox && isLoaded && (
        <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-3rem)] max-w-xs p-5 rounded-3xl bg-white/35 backdrop-blur-2xl border border-border shadow-xl text-left flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary font-clash">Cookie Preferences</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-sans">
                We use cookies to analyze traffic, remember preferences, and optimize your portfolio analysis. Read our <a href="/cookies" className="underline hover:text-primary transition duration-200">Cookies Policy</a>.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                localStorage.setItem("cookieConsent", "accepted");
                setShowCookieBox(false);
              }}
              className="flex-1 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all duration-200"
            >
              Accept
            </button>
            <button
              onClick={() => {
                localStorage.setItem("cookieConsent", "declined");
                setShowCookieBox(false);
              }}
              className="flex-1 py-2 bg-transparent border border-border hover:bg-black/5 text-slate-500 hover:text-primary font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all duration-200"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {isLoaded && (
        <GradualBlur preset="page-footer" height="2rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}
