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

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");

  // Reward States
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill out all fields.");
      return;
    }
    try {
      setContactSubmitting(true);
      setContactError(null);
      setContactSuccess(false);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact message. Please try again.");
      }

      setSubmittedName(contactName);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      setContactError(err.message || "An unexpected error occurred.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleCardFlip = async () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    // If flipping to the back side:
    if (nextFlipped) {
      const token = localStorage.getItem("token");
      const loggedInNow = !!token;
      setIsLoggedIn(loggedInNow);

      if (loggedInNow) {
        const claimedDate = localStorage.getItem('dailyRewardClaimedDate');
        const today = new Date().toDateString();

        if (claimedDate !== today) {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${backendUrl}/api/auth/claim-daily-reward`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ clientDate: today })
            });
            const data = await res.json();
            if (data.success && data.data) {
              const points = data.data.pointsClaimed;
              const newBalance = data.data.newBalance;

              localStorage.setItem("finPointsBalance", newBalance.toString());
              localStorage.setItem("dailyRewardClaimedDate", today);
              localStorage.setItem("lastRewardAmount", points.toString());

              setRewardAmount(points);
              setRewardClaimed(true);
              setHasClaimedToday(true);

              // Notify navbar
              window.dispatchEvent(new Event("points-updated"));
            } else {
              if (data.error === 'Already claimed today') {
                localStorage.setItem("dailyRewardClaimedDate", today);
                setHasClaimedToday(true);
                setRewardClaimed(true);
              }
            }
          } catch (err) {
            console.error("Failed to claim daily reward from DB", err);
          }
        }
      }
    }
  };

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

    // Check if daily reward claimed today
    const claimedDate = localStorage.getItem('dailyRewardClaimedDate');
    const today = new Date().toDateString();
    if (claimedDate === today) {
      setHasClaimedToday(true);
      setRewardClaimed(true);
      const savedAmount = localStorage.getItem('lastRewardAmount');
      if (savedAmount) {
        setRewardAmount(Number(savedAmount));
      }
    }
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
    if (typeof window !== "undefined" && sessionStorage.getItem("hasSeenPreloader")) {
      setIsLoaded(true);
      setPreloaderGone(true);
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasSeenPreloader", "true");
    }

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
          {/* Centered Hero Text (Fades out on scroll) */}
          <div
            style={{
              opacity: Math.max(0, 1 - heroProgress * 2.5),
              transform: `translateY(${-heroProgress * 40}px)`,
              pointerEvents: heroProgress < 0.4 ? "auto" : "none",
              transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
            }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20 sm:pt-0 z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold text-primary font-chillax leading-none tracking-tighter uppercase select-none">
              Preserving Legacy<br />
              <span className="text-primary">Finance Growth</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-lg max-w-2xl mt-4 sm:mt-8 font-sans leading-relaxed">
              Combining 35+ years of generation-spanning trust with modern portfolio analytics and machine learning anomaly detection to secure your wealth.
            </p>

            {/* Finance widgets container - placed inline below the paragraph */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-10 justify-center items-stretch w-full max-w-2xl px-6 select-none z-20">

              {/* ML Anomaly Engine Widget */}
              <div className="flex-1 flex flex-col gap-2.5 sm:gap-3.5 p-4 sm:p-5 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-sm text-left hover:-translate-y-1.5 hover:shadow-md transition-all duration-350">
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Active Scan
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">ENGINE V2.4</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary font-clash">ML Anomaly Engine</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 font-sans">
                    Analyzing portfolio drift, asset correlation, and hidden cost leakages.
                  </p>
                </div>
                <div className="border-t border-slate-200/50 pt-2.5 mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Risk Level</span>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase font-mono">Secure (0.01%)</span>
                  </div>
                  {/* SVG Live Scan Line */}
                  <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 100 40" fill="none">
                    <path d="M0,20 L20,20 L30,5 L40,35 L50,20 L80,20 L90,10 L100,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="100" cy="20" r="3" fill="currentColor" className="animate-ping" />
                  </svg>
                </div>
              </div>

              {/* Assets Under Advisory Widget */}
              <div className="flex-1 flex flex-col gap-2.5 sm:gap-3.5 p-4 sm:p-5 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-sm text-left hover:-translate-y-1.5 hover:shadow-md transition-all duration-350">
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-[9px] font-mono text-foreground font-bold uppercase tracking-wider bg-foreground/5 border border-foreground/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-pulse" />
                    Yield Tracker
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">CAGR AVG</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary font-clash">Assets Under Advisory</h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold font-clash text-primary leading-none">₹3Cr+</span>
                    <span className="text-[9px] font-mono text-emerald-600 font-bold">+18.4%</span>
                  </div>
                </div>
                <div className="border-t border-slate-200/50 pt-2.5 mt-auto">
                  {/* SVG Sparkline */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Founded</span>
                      <span className="text-[10px] font-bold text-primary font-mono">1989 (35+ Yrs)</span>
                    </div>
                    <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M0,35 Q15,30 30,18 T60,22 T90,5 T100,2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 sm:bottom-12 flex flex-col items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-widest animate-pulse">
              <span>Scroll to explore</span>
              <svg className="w-4.5 h-4.5 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Animated Profile Image (Fades in on scroll) */}
          {(() => {
            const isMobile = windowSize.width < 768;

            const x = isMobile ? windowSize.width / 2 - 80 : windowSize.width * 0.12;
            const y = isMobile ? windowSize.height * 0.16 : windowSize.height / 2 - 160;
            const size = isMobile ? 160 : 320;
            const borderRadius = isMobile ? 16 : 24;

            // Fade in as hero text fades out
            const fadeInOpacity = Math.max(0, Math.min(1, (heroProgress - 0.2) / 0.6));
            const shadowOpacity = fadeInOpacity * 0.15;

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
                  opacity: fadeInOpacity,
                  pointerEvents: heroProgress >= 0.4 ? "auto" : "none",
                  overflow: "hidden",
                  transition: "opacity 0.2s ease-out, box-shadow 0.1s ease-out",
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
            const fadeInOpacity = Math.max(0, Math.min(1, (heroProgress - 0.2) / 0.6));
            const textYOffset = (1 - fadeInOpacity) * 20; // slide up 20px on fade

            const endX = isMobile ? windowSize.width / 2 - 80 : windowSize.width * 0.12;
            const endY = isMobile ? windowSize.height * 0.16 : windowSize.height / 2 - 160;
            const endSize = isMobile ? 160 : 320;

            const textLeft = isMobile ? windowSize.width / 2 - 145 : endX + endSize + 80;
            // Shift desktop top slightly up to give room for expansions
            const textTop = isMobile ? endY + endSize + 20 : windowSize.height / 2 - 160;

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
                  opacity: fadeInOpacity,
                  transform: `translateY(${textYOffset}px)`,
                  pointerEvents: heroProgress >= 0.4 ? "auto" : "none",
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
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-lg md:text-xl text-foreground font-bold ${expandedOption === "about" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        FinAnalysis blends over 35 years of trusted financial advisory with modern technology and data science. Founded on a legacy started by <strong className="text-primary font-extrabold">Arindam De</strong> in 1989, we have transitioned across multiple market cycles to safeguard and grow client wealth. Today, <strong className="text-primary font-extrabold">Arijit De</strong> (SEBI-certified Mutual Fund Distributor ARN-273396 and SIF distributor) integrates computer science analytics, systematic portfolio optimization, and structured asset allocation, delivering a modern, data-backed approach to wealth management that prior generations never had access to.
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
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-lg md:text-xl text-foreground font-bold ${expandedOption === "services" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        We provide a comprehensive, fully regulated suite of financial and wealth creation solutions tailored to your unique lifecycle goals. This includes systematically managed <span className="font-extrabold text-primary">Mutual Funds & SIP planning</span> for long-term compound growth, high-yield <span className="font-extrabold text-primary">Fixed Deposits, Specialized Investment Funds (SIF)</span>, and <span className="font-extrabold text-primary">Portfolio Management Services (PMS)</span> for sophisticated asset allocation. Additionally, we protect your family's future with robust <span className="font-extrabold text-primary">Life Insurance (LIC), Mediclaim Health Insurance, Vehicle/Property Insurance</span>, and provide leverage options through <span className="font-extrabold text-primary">PNB Housing Finance</span> home loans.
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
                  <div className={`grid transition-all duration-350 ease-in-out overflow-hidden text-lg md:text-xl text-foreground font-bold ${expandedOption === "why-us" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="overflow-hidden max-w-[320px] md:max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-2.5 font-sans pr-4 leading-relaxed">
                      <p>
                        In an era dominated by cold robo-advisors and static investment apps, your hard-earned wealth deserves personalized, <span className="font-extrabold text-primary">relationship-driven human advisory</span>. We exist to bridge the gap between human empathy and data precision. By standing by our clients through decades of market turbulence, recessions, and regulatory shifts, we prioritize multi-generational trust and structured planning. We don't just measure relationships in transactions; we measure them in decades of successful outcomes and financial security.
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
      <div className="w-full relative z-10 py-16 px-6 overflow-hidden">
        {/* Ambient backing glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(46,125,50,0.03)_0%,transparent_70%)] pointer-events-none select-none" />

        <div className="w-full max-w-5xl mx-auto p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
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

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/45 backdrop-blur-2xl border border-border rounded-2xl md:min-w-[280px] shadow-sm text-center relative group">
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
          <ScrollBlurReveal className="max-w-6xl text-center mb-20 flex flex-col gap-6 font-chillax">
            <p className="text-2xl md:text-5xl text-primary leading-relaxed font-semibold tracking-tight">
              For over 35 years, the name De has stood for one thing in personal finance — trust.
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed max-w-4xl mx-auto">
              Today, as the needs of investors evolve, we’re embracing the future with data-driven planning, technology-enabled insights, and a renewed commitment to what matters most: your financial future.
            </p>
            <p className="text-2xl md:text-5xl text-primary font-semibold leading-relaxed mt-4 font-chillax">
              We've got everything covered.
            </p>
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
          <div className="relative overflow-hidden p-8 md:p-12 bg-gradient-to-br from-[#F5EFE6] via-[#EAE1D4] to-[#DFD3C3] border border-[#8D6E63]/30 rounded-3xl shadow-[0_20px_50px_rgba(139,90,43,0.12)] flex flex-col lg:flex-row gap-12 text-left items-stretch">
            {/* Background decorative glows */}
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Details */}
            <div className="flex-1 flex flex-col justify-between space-y-8 relative z-10">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-primary border border-primary/35 bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  Investor Profiling
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-clash leading-tight">
                  Know what kind of investor you are!
                </h2>
                <p className="text-foreground/80 text-sm md:text-base leading-relaxed font-sans max-w-md">
                  Are you a Conservative Protector, a Strategic Compounder, or an Aggressive Visionary? Take our quick 2-minute diagnostic to analyze your risk preference and discover the asset mix that fits your lifestyle.
                </p>

                {/* Animal Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {["🐅 Tiger", "🐘 Elephant", "🦌 Deer", "🦊 Fox", "🦁 Lion"].map((animal, idx) => (
                    <span key={idx} className="text-xs font-semibold font-mono text-foreground bg-[#FAF6F0] border border-[#C4A484]/40 px-2.5 py-1 rounded-lg select-none hover:scale-105 hover:bg-[#EAE1D4] hover:border-[#8D6E63]/60 transition duration-200">
                      {animal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/quiz"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group cursor-pointer"
                >
                  <span className="font-bold">Start Quiz</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200 stroke-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Mock Profile Card */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <div className="w-full h-full min-h-[300px] p-6 bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#C4A484]/35 flex flex-col justify-between gap-6 shadow-xl relative group overflow-hidden transition-all duration-350 hover:scale-[1.015] hover:shadow-[0_25px_50px_rgba(139,90,43,0.18)]">
                {/* Sheen animation scanner */}
                <div className="absolute top-0 -left-[100%] h-full w-1/2 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-[1000ms] ease-out group-hover:left-[150%] pointer-events-none z-20" />

                {/* Background decorative glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none opacity-50 z-0" />

                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#C4A484]/30 pb-3.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E65100] animate-ping" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#8D6E63]/60 uppercase tracking-wider">ARCHETYPE</span>
                </div>

                {/* Gauge SVG Speedometer */}
                <div className="relative w-48 h-28 mx-auto mt-2 flex items-center justify-center select-none z-10">
                  <svg className="w-full h-full" viewBox="0 0 200 120">
                    <defs>
                      <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="55%" stopColor="#EAB308" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Mechanical Ticks */}
                    <path
                      d="M 32,98 A 68,68 0 0 1 168,98"
                      fill="transparent"
                      stroke="#8D6E63"
                      strokeOpacity="0.2"
                      strokeWidth="2"
                      strokeDasharray="2, 5"
                    />

                    {/* Background track */}
                    <path
                      d="M 30,100 A 70,70 0 0 1 170,100"
                      fill="transparent"
                      stroke="#EFEBE9"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Active colored path (65% fill) with glow */}
                    <path
                      d="M 30,100 A 70,70 0 0 1 170,100"
                      fill="transparent"
                      stroke="url(#riskGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="220"
                      strokeDashoffset={220 * (1 - 0.65)}
                      filter="url(#glow)"
                    />

                    {/* Needle pivot */}
                    <circle cx="100" cy="100" r="8" fill="#FF8F00" />

                    {/* Needle Pointer */}
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="42"
                      stroke="#FF8F00"
                      strokeWidth="4"
                      strokeLinecap="round"
                      transform={`rotate(${(0.65 * 180) - 90}, 100, 100)`}
                      className="transition-transform duration-[1200ms] ease-out"
                    />

                    {/* Score display inside the arch */}
                    <text x="100" y="86" textAnchor="middle" className="fill-foreground font-clash text-base font-bold">
                      Match: <tspan className="fill-foreground">Tiger</tspan>
                    </text>
                    <text x="100" y="102" textAnchor="middle" className="fill-foreground/80 font-mono text-[8px] uppercase tracking-wider font-bold">
                      Steady Compounding
                    </text>
                  </svg>
                </div>
 
                {/* Profile Breakdown Badges */}
                <div className="grid grid-cols-3 gap-2.5 mt-2 relative z-10">
                  <div className="p-3 bg-[#FAF6F0] border border-[#C4A484]/30 rounded-2xl flex flex-col items-center gap-1 text-center hover:-translate-y-0.5 hover:shadow-md hover:bg-[#EAE1D4]/60 hover:border-[#8D6E63]/40 transition-all duration-300 cursor-default select-none text-foreground">
                    <span className="text-[9px] font-mono text-foreground/70 tracking-wider block">🐅 Elephant</span>
                    <span className="text-xs font-bold text-foreground font-clash">20%</span>
                  </div>
 
                  <div className="p-3 bg-gradient-to-b from-foreground/10 to-foreground/5 border border-foreground/30 rounded-2xl flex flex-col items-center gap-1 text-center shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/50 transition-all duration-300 relative overflow-hidden cursor-default select-none text-foreground">
                    <div className="absolute top-0 inset-x-0 h-1 bg-foreground" />
                    <span className="text-[9px] font-mono text-foreground tracking-wider font-bold block">🐘 Tiger</span>
                    <span className="text-xs font-bold text-foreground font-clash">65%</span>
                  </div>
 
                  <div className="p-3 bg-[#FAF6F0] border border-[#C4A484]/30 rounded-2xl flex flex-col items-center gap-1 text-center hover:-translate-y-0.5 hover:shadow-md hover:bg-[#EAE1D4]/60 hover:border-[#8D6E63]/40 transition-all duration-300 cursor-default select-none text-foreground">
                    <span className="text-[9px] font-mono text-foreground/70 tracking-wider block">🦊 Fox</span>
                    <span className="text-xs font-bold text-foreground font-clash">15%</span>
                  </div>
                </div>
 
                {/* Footer / Active Category Display */}
                <div className="bg-[#FAF6F0]/85 border border-[#C4A484]/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 mt-2 relative z-10 shadow-inner hover:bg-[#FAF6F0] transition duration-200">
                  <div className="text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-foreground/10 border border-foreground/20 flex items-center justify-center text-base shadow-inner select-none">
                      🐘
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-foreground/70 uppercase block tracking-wider">Primary Archetype</span>
                      <span className="text-sm font-bold text-foreground font-clash leading-tight">Aggressive Tiger</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-foreground/10 text-foreground border border-foreground/25 px-3 py-1 rounded-xl font-bold uppercase tracking-wider shadow-sm select-none">
                    Optimal Fit
                  </span>
                </div>
              </div>
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
              Get a new financial quote every 24 hours. Click the card below to turn it over and claim your daily FinPoints reward!
            </p>
          </div>

          {/* Flippable Card Container */}
          <div
            className="w-full max-w-xl mx-auto h-[320px] [perspective:1000px] cursor-pointer"
            onClick={handleCardFlip}
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
                  <span>Tap Card to Claim Reward</span>
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
                  <span className="text-[9px] font-mono text-slate-400">ACTIVE TODAY</span>
                </div>

                {isLoggedIn ? (
                  // Logged In State: Show claimed points reward
                  <div className="w-full my-auto space-y-4 relative">
                    {hasClaimedToday && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                        <style>{`
                          .coin-particle {
                            position: absolute;
                            font-size: 28px;
                            pointer-events: none;
                            opacity: 0;
                          }
                          .coin-1 { animation: float-coin-1 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                          .coin-2 { animation: float-coin-2 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards; }
                          .coin-3 { animation: float-coin-3 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.2s forwards; }
                          .coin-4 { animation: float-coin-4 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.15s forwards; }
                          .coin-5 { animation: float-coin-5 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.25s forwards; }

                          @keyframes float-coin-1 {
                            0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
                            15% { opacity: 1; }
                            100% { transform: translate(-80px, -110px) scale(1.4) rotate(360deg); opacity: 0; }
                          }
                          @keyframes float-coin-2 {
                            0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
                            15% { opacity: 1; }
                            100% { transform: translate(80px, -110px) scale(1.4) rotate(-360deg); opacity: 0; }
                          }
                          @keyframes float-coin-3 {
                            0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
                            15% { opacity: 1; }
                            100% { transform: translate(-40px, -130px) scale(1.4) rotate(180deg); opacity: 0; }
                          }
                          @keyframes float-coin-4 {
                            0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
                            15% { opacity: 1; }
                            100% { transform: translate(40px, -130px) scale(1.4) rotate(-180deg); opacity: 0; }
                          }
                          @keyframes float-coin-5 {
                            0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
                            15% { opacity: 1; }
                            100% { transform: translate(0px, -150px) scale(1.5) rotate(90deg); opacity: 0; }
                          }
                        `}</style>
                        <span className="coin-particle coin-1">🪙</span>
                        <span className="coin-particle coin-2">🪙</span>
                        <span className="coin-particle coin-3">🪙</span>
                        <span className="coin-particle coin-4">🪙</span>
                        <span className="coin-particle coin-5">🪙</span>
                      </div>
                    )}

                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 text-2xl shadow-inner animate-pulse">
                        🎁
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl md:text-5xl font-extrabold font-clash text-primary leading-none">+{rewardAmount || 3}</span>
                        <span className="text-xs font-sans font-bold text-neutral-500">FP</span>
                      </div>
                      <h3 className="text-sm font-bold font-clash text-neutral-800 mt-1">
                        {rewardClaimed ? "Reward Claimed!" : "Already Claimed Today!"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-sans max-w-xs mx-auto">
                        {rewardClaimed
                          ? `Congratulations! ${rewardAmount} FinPoints have been successfully added to your wallet balance.`
                          : `You have already claimed today's reward. Come back tomorrow to collect more points!`}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Logged Out State: Prompt login
                  <div className="w-full my-auto space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl relative">
                        <svg className="w-5 h-5 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold font-clash text-neutral-800 mt-1">Daily Reward Locked</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-sans max-w-xs mx-auto">
                        Sign in to unlock and claim today's random FinPoints (up to 5 FP). Your points can be used to unlock priority review sessions!
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  {isLoggedIn ? (
                    <div className="flex justify-center items-center gap-1.5 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      <span>Claimed successfully</span>
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

      {/* Contact Section */}
      <div id="contact" className="w-full bg-transparent relative z-10 py-24 overflow-hidden">
        <ScrollBlurReveal className="w-full max-w-xl mx-auto px-6">
          <div className="relative text-left">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl lg:text-5xl  tracking-tight text-primary font-clash">
                Connect with our Advisors
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed font-sans max-w-sm mx-auto">
                Drop us a message and our wealth advisory team will get back to you shortly to analyze your portfolio.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              {contactError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 text-xs font-sans flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{contactError}</span>
                </div>
              )}

              {contactSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-600 text-xs font-sans flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Message sent successfully! Scroll down to see confirmation.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ashish Ranjan"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ashish@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your current investment targets or details..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full mt-2 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm uppercase tracking-wider disabled:opacity-50"
              >
                {contactSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
              {contactSuccess && (
                <div className="text-center mt-3 text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Message sent successfully!</span>
                </div>
              )}
            </form>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Scroll-Driven Video Playback Showcase */}

      <Footer footerRef={footerRef} />

      {/* Preloader Overlay Screen (Slides down smoothly) */}
      {!preloaderGone && (
        <div
          id="preloader-screen"
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
