'use client';

import { useState, useEffect, useRef } from "react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import ScrollBlurReveal from "@/components/ScrollBlurReveal";
import SvgScrollWipe from "@/components/SvgScrollWipe";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import ServicesConstellation from "@/components/ServicesConstellation";
import { GoArrowDownRight } from "react-icons/go";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import BookCallModal from "@/components/BookCallModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    question: "Is the portfolio health report really free?",
    answer: "Yes. Your portfolio health report is completely free."
  },
  {
    question: "How is my portfolio score calculated?",
    answer: "Your score is calculated out of 100 across five dimensions: Goal Alignment, Asset Allocation, Diversification, Investment Discipline, and Portfolio Efficiency. Each dimension is evaluated against your age, financial goal, and investment behavior — not generic benchmarks."
  },
  {
    question: "Do I need to be a client to use the platform?",
    answer: "No. Anyone can sign up, take the Investor Personality Assessment, and upload their portfolio for analysis"
  },
  {
    question: "Can I analyze a portfolio that wasn't built through your distribution?",
    answer: "Absolutely. The platform analyzes any mutual fund portfolio regardless of where it was built — Groww, Zerodha, Paytm Money, or anywhere else."
  },
  {
    question: "What format do I need to upload my portfolio in?",
    answer: "We use a fixed Excel template with six fields: Fund Name, Investment Type, Start Date, Monthly SIP Amount, Total Invested, and Current Value."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. Your portfolio data is stored on secure, encrypted servers with strict access controls. Your information is never sold, shared, or visible to other users. Only you and our team can access your data."
  },
  {
    question: "What is the Investor Personality Assessment?",
    answer: "It's a 15-question behavioral assessment that identifies your natural investing style — not your financial knowledge. Based on your responses, you are classified into one of five investor archetypes: Tiger, Elephant, Deer, Fox, or Lion. It takes under 3 minutes and is completely free."
  },
  {
    question: "Does this platform give stock tips or guaranteed returns?",
    answer: "No. We do not provide stock recommendations, trading tips, or return guarantees of any kind. Our platform provides portfolio health report, goal-based planning, and structured distribution — all regulated under SEBI and AMFI guidelines."
  },
  {
    question: "What do I get after my portfolio health report?",
    answer: "You receive a Portfolio Score out of 100, three key insights specific to your portfolio, and the option to discuss your results with Arijit De directly through a one-on-one portfolio review discussion."
  },
  {
    question: "How do I schedule a consultation?",
    answer: "After your analysis, you can book a call directly through the platform by selecting your preferred time slot. Calls are available daily between 8:00 PM and 1:00 AM. You can also request a callback and we'll reach out to confirm."
  },
  {
    question: "Who is behind this platform?",
    answer: "FinAnalysis is built and operated by Arijit De — SEBI-certified Mutual Fund Distributor (ARN-273396) and SIF Distributor — backed by 35 years of AMFI-registered Mutual Fund distribution experience from his father, Arindam De. This is not a faceless app. There is a real, certified distributor behind every analysis."
  },
  {
    question: "I already have a AMFI-registered Mutual Fund Distributor. Can I still use this?",
    answer: "Yes. A second opinion never hurts. Our platform gives you an independent, data-backed view of your portfolio health regardless of who manages it."
  },
  {
    question: "What if I disagree with my portfolio score?",
    answer: "Your score is based on rule-based financial parameters and is reviewed by a certified distributor before being released to you. If you feel something is inaccurate, book a call and we'll walk through it together."
  },
  {
    question: "Is this platform only for mutual fund investors?",
    answer: "Currently, the portfolio health report engine is built for mutual fund portfolios. However, Arindam De's distribution services cover the full spectrum — Insurance, PMS, Fixed Deposits, PNB Housing Finance, and more. Reach out directly for anything beyond mutual funds."
  }
]

const servicesList = [
  {
    title: "Mutual Funds & SIP",
    desc: "Systematically managed for long-term compound growth.",
    tag: "Wealth Creation"
  },
  {
    title: "Fixed Deposits",
    desc: "Secure, high-yield options for guaranteed stable returns.",
    tag: "Capital Protection"
  },
  {
    title: "Specialized Investment Funds (SIF)",
    desc: "Sophisticated compounding returns using hurdle rates and strategic top-ups.",
    tag: "High Yield"
  },
  {
    title: "Portfolio Management (PMS)",
    desc: "Tailored active strategies for customized asset allocation.",
    tag: "Premium Advisory"
  },
  {
    title: "Insurance Solutions",
    desc: "Robust Life Insurance (LIC), Mediclaim health, and property protection.",
    tag: "Risk Mitigation"
  },
  {
    title: "Housing Finance & Loans",
    desc: "Structured leverage options through PNB Housing Finance home loans.",
    tag: "Leverage Options"
  }
];

export default function Home() {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preloaderGone, setPreloaderGone] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollVideoRef = useRef<HTMLVideoElement | null>(null);

  const scrollToFaq = () => {
    const faqElement = document.getElementById("faq");
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: "smooth" });
    }
  };



  // Daily Rewards Section States
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/onboarding");
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");



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
    }
  };

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "ADMIN") {
          setDashboardUrl("/dashboard/admin");
        } else if (user.role === "CLIENT") {
          setDashboardUrl("/dashboard/client");
        } else {
          setDashboardUrl("/dashboard/user");
        }
      } catch (e) {
        setDashboardUrl("/dashboard/user");
      }
    }

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("book") === "true") {
        setIsBookingModalOpen(true);
        // Clean up the URL search params so reloading doesn't re-open it
        window.history.replaceState({}, document.title, window.location.pathname);
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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [activeHoverLevel1, setActiveHoverLevel1] = useState<string | null>(null);
  const [activeHoverLevel2, setActiveHoverLevel2] = useState<string | null>(null);
  const [mobileActiveLevel1, setMobileActiveLevel1] = useState<string | null>(null);
  const [mobileActiveLevel2, setMobileActiveLevel2] = useState<string | null>(null);
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

  const envelopeRef = useRef<HTMLDivElement>(null);
  const helloSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!preloaderGone) return;

    const envelope = envelopeRef.current;
    if (!envelope) return;

    const ctx = gsap.context(() => {
      gsap.to(envelope, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, helloSectionRef);

    return () => {
      ctx.revert();
    };
  }, [preloaderGone]);


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
    if (preloaderGone) {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }
  }, [preloaderGone]);

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
    <main className="relative min-h-screen w-full bg-transparent text-foreground font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} onBookCallClick={() => setIsBookingModalOpen(true)} />

      <SvgScrollWipe
        screen1={
          <ScrollBlurReveal className="flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto space-y-6 pt-28 md:pt-24 lg:pt-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-white/20 backdrop-blur-md text-xs font-medium text-primary select-none">
              <span>35+ Years of Certified Amfi-Registered Mutual Fund Distribution</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-primary font-chillax leading-tight tracking-tight uppercase">
              Built on the legacy<br />
              <span className="text-primary">of Mr. Arindam De</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed font-normal">
              Combining 35+ years of generation-spanning trust with systematic portfolio optimization and machine learning diagnostics to accelerate your growth.
            </p>
            <div className="pt-2">
              <a
                href="/onboarding"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group cursor-pointer"
              >
                <span className="font-bold text-xs">Get My Free Portfolio Report</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200 stroke-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </ScrollBlurReveal>
        }
        screen2={
          <ScrollBlurReveal className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-10 md:gap-14 px-6 text-center">
            {/* Profile Image */}
            <div className="shrink-0 flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-[24px] border border-border shadow-lg overflow-hidden bg-card flex items-center justify-center">
                <img
                  src="/assets/me.jpeg"
                  alt="Arijit De"
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Expanding Options */}
            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-10 text-left select-text relative z-10">
              {/* 01: About Us */}
              <div className="flex flex-col">
                <button
                  onClick={() => setExpandedOption(expandedOption === "about" ? null : "about")}
                  className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                >
                  <span className={`text-xs xl:text-sm font-mono transition duration-200 ${expandedOption === "about" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>01</span>
                  <span className={`font-instrument-serif text-2xl xl:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "about" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    About Us
                    <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                  </span>
                </button>
                <div className={`grid xl:hidden transition-all duration-350 ease-in-out overflow-hidden text-sm text-foreground font-bold ${expandedOption === "about" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                  <div className="overflow-hidden space-y-2.5 font-sans pr-4 leading-relaxed font-bold text-foreground text-sm">
                    <img
                      src="/assets/about.svg"
                      alt="About Us"
                      className="w-56 h-auto rounded-2xl object-contain select-none pointer-events-none mt-2 mx-auto block"
                    />
                    <p>
                      FinAnalysis blends over 35 years of trusted AMFI-registered Mutual Fund distribution with modern technology and data science. Founded on a legacy started by <strong className="text-primary font-extrabold">Arindam De</strong> in 1989, we have transitioned across multiple market cycles to safeguard and grow client wealth. Today, <strong className="text-primary font-extrabold">Arijit De</strong> (SEBI-certified Mutual Fund Distributor ARN-273396 and SIF distributor) integrates computer science analytics, systematic portfolio optimization, and structured asset allocation, delivering a modern, data-backed approach to wealth management that prior generations never had access to.
                    </p>
                  </div>
                </div>
              </div>

              {/* 02: What we provide */}
              <div className="flex flex-col">
                <button
                  onClick={() => setExpandedOption(expandedOption === "services" ? null : "services")}
                  className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                >
                  <span className={`text-xs xl:text-sm font-mono transition duration-200 ${expandedOption === "services" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>02</span>
                  <span className={`font-instrument-serif text-2xl xl:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "services" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    What we provide
                    <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                  </span>
                </button>
                <div className={`grid xl:hidden transition-all duration-350 ease-in-out overflow-hidden text-sm text-foreground font-bold ${expandedOption === "services" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                  <div className="overflow-hidden space-y-4 font-sans pr-4 leading-relaxed font-bold text-foreground text-sm">
                    <div className="flex flex-col gap-4 mt-2 w-full">
                      
                      {/* Level 1: Investments (Tap to expand) */}
                      <div className="flex flex-col w-full">
                        <button
                          onClick={() => {
                            setMobileActiveLevel1(mobileActiveLevel1 === "investments" ? null : "investments");
                            setMobileActiveLevel2(null);
                          }}
                          className={`w-full p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden cursor-pointer ${
                            mobileActiveLevel1 === "investments"
                              ? "bg-amber-500/10 border-amber-500/40 shadow-md"
                              : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_10px_25px_rgba(245,158,11,0.04)]"
                          }`}
                        >
                          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/5 rounded-full blur-lg pointer-events-none" />
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[8px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                              Wealth & Growth
                            </span>
                            <span className="text-xs font-mono text-amber-600 font-bold uppercase tracking-wider">
                              {mobileActiveLevel1 === "investments" ? "Tap to Collapse ▲" : "Tap to Expand ▼"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-primary font-clash mt-2.5 mb-1 text-left">
                            Investments
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium text-left">
                            Systematic wealth creation & capital protection.
                          </p>
                        </button>

                        {/* Level 2: Under Investments (FD & MF) */}
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          mobileActiveLevel1 === "investments" ? "max-h-[1500px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none"
                        }`}>
                          <div className="pl-4 border-l border-amber-500/20 flex flex-col gap-4">
                            
                            {/* FD */}
                            <div className="flex flex-col w-full">
                              <button
                                onClick={() => setMobileActiveLevel2(mobileActiveLevel2 === "fd" ? null : "fd")}
                                className={`w-full p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                  mobileActiveLevel2 === "fd"
                                    ? "bg-amber-500/10 border-amber-500/40"
                                    : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="text-[8px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    Capital Protection
                                  </span>
                                  <span className="text-[9px] font-mono text-amber-600 font-bold">
                                    {mobileActiveLevel2 === "fd" ? "▲" : "▼"}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-primary font-clash mt-2 mb-1">
                                  Fixed Deposits
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-tight font-sans font-medium">
                                  Secure, stable high-yield options.
                                </p>
                              </button>

                              {/* Level 3: Under FD */}
                              <div className={`transition-all duration-350 ease-in-out overflow-hidden ${
                                mobileActiveLevel2 === "fd" ? "max-h-[200px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                              }`}>
                                <div className="pl-4 border-l-2 border-amber-500/30">
                                  <div 
                                    className="p-3.5 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/45 to-amber-500/5 text-left cursor-pointer active:scale-[0.98] transition-all duration-200 select-none"
                                    onClick={scrollToFaq}
                                  >
                                    <span className="text-[7px] font-mono text-amber-800 tracking-wider uppercase font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                                      Fixed Return
                                    </span>
                                    <h5 className="text-xs font-bold text-primary font-clash mt-1.5 mb-0.5">
                                      Company Deposit
                                    </h5>
                                    <p className="text-[10px] text-muted-foreground font-sans leading-tight">
                                      Corporate deposits with secure, verified high yields.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* MF */}
                            <div className="flex flex-col w-full">
                              <button
                                onClick={() => setMobileActiveLevel2(mobileActiveLevel2 === "mf" ? null : "mf")}
                                className={`w-full p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                  mobileActiveLevel2 === "mf"
                                    ? "bg-amber-500/10 border-amber-500/40"
                                    : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="text-[8px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    Active Growth
                                  </span>
                                  <span className="text-[9px] font-mono text-amber-600 font-bold">
                                    {mobileActiveLevel2 === "mf" ? "▲" : "▼"}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-primary font-clash mt-2 mb-1">
                                  Mutual Funds
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-tight font-sans font-medium">
                                  Market-linked growth with diversification.
                                </p>
                              </button>

                              {/* Level 3: Under MF */}
                              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                mobileActiveLevel2 === "mf" ? "max-h-[800px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                              }`}>
                                <div className="pl-4 border-l-2 border-amber-500/30 grid grid-cols-1 gap-2.5">
                                  {[
                                    { title: "SIP", desc: "Systematic investments for long-term compound growth." },
                                    { title: "Lumpsum", desc: "Compounding one-time principal investments over any tenure." },
                                    { title: "SIF", desc: "Specialized Investment Funds with hurdle targets." },
                                    { title: "PMS", desc: "Portfolio Management Services for customized asset allocation." }
                                  ].map((sub, i) => (
                                    <div 
                                      key={i} 
                                      className="p-4 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/45 to-amber-500/5 text-left cursor-pointer active:scale-[0.98] transition-all duration-200 select-none"
                                      onClick={scrollToFaq}
                                    >
                                      <span className="text-[7px] font-mono text-amber-800 tracking-wider uppercase font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                                        Growth
                                      </span>
                                      <h5 className="text-sm font-bold text-primary font-clash mt-2 mb-1">{sub.title}</h5>
                                      <p className="text-xs text-muted-foreground leading-normal font-sans font-medium">{sub.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Level 1: Life Insurance */}
                      <div 
                        className="w-full p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_10px_25px_rgba(245,158,11,0.04)] text-left relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-200 select-none"
                        onClick={scrollToFaq}
                      >
                        <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/5 rounded-full blur-lg pointer-events-none" />
                        <span className="text-[8px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                          Risk Mitigation
                        </span>
                        <h4 className="text-sm font-bold text-primary font-clash mt-2.5 mb-1 text-left">
                          Life Insurance
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium text-left">
                          Protecting your family's future, health, and properties.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* 03: Why we exist */}
              <div className="flex flex-col">
                <button
                  onClick={() => setExpandedOption(expandedOption === "why-us" ? null : "why-us")}
                  className="group flex items-baseline gap-3 focus:outline-none cursor-pointer text-left"
                >
                  <span className={`text-xs xl:text-sm font-mono transition duration-200 ${expandedOption === "why-us" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>03</span>
                  <span className={`font-instrument-serif text-2xl xl:text-4xl font-bold tracking-tight transition duration-200 ${expandedOption === "why-us" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    Why we exist
                    <GoArrowDownRight className="inline-block ml-2 align-middle transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
                  </span>
                </button>
                <div className={`grid xl:hidden transition-all duration-350 ease-in-out overflow-hidden text-sm text-foreground font-bold ${expandedOption === "why-us" ? "grid-rows-[1fr] mt-2.5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                  <div className="overflow-hidden space-y-2.5 font-sans pr-4 leading-relaxed font-bold text-foreground text-sm">
                    <img
                      src="/assets/exist.png"
                      alt="Why We Exist"
                      className="w-56 h-auto rounded-2xl object-contain select-none pointer-events-none mt-2 mx-auto block"
                    />
                    <p>
                      In an era dominated by cold robo-distribution representatives and static investment apps, your hard-earned wealth deserves personalized, <span className="font-extrabold text-primary">relationship-driven human distribution</span>. We exist to bridge the gap between human empathy and data precision. By standing by our clients through decades of market turbulence, recessions, and regulatory shifts, we prioritize multi-generational trust and structured planning. We don't just measure relationships in transactions; we measure them in decades of successful outcomes and financial security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Full-Width Expanded Content */}
            <div className={`hidden xl:grid transition-all duration-350 ease-in-out w-full ${expandedOption ? "grid-rows-[1fr] mt-10 opacity-100 overflow-visible" : "grid-rows-[0fr] opacity-0 overflow-hidden"}`}>
              <div className={`w-full grid grid-cols-1 grid-rows-1 ${expandedOption ? "overflow-visible" : "overflow-hidden"}`}>
                {/* 01: About Us */}
                <div className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${expandedOption === "about" ? "opacity-100 pointer-events-auto scale-100 translate-y-0" : "opacity-0 pointer-events-none scale-95 -translate-y-2"}`}>
                  <div className="flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto text-center">
                    <img
                      src="/assets/about.svg"
                      alt="About Us"
                      className="w-76 h-auto rounded-2xl object-contain select-none pointer-events-none"
                    />
                    <p className="font-sans leading-relaxed font-bold text-foreground text-base md:text-lg max-w-4xl mx-auto">
                      FinAnalysis blends over 35 years of trusted AMFI-registered Mutual Fund distribution with modern technology and data science. Founded on a legacy started by <strong className="text-primary font-extrabold">Arindam De</strong> in 1989, we have transitioned across multiple market cycles to safeguard and grow client wealth. Today, <strong className="text-primary font-extrabold">Arijit De</strong> (SEBI-certified Mutual Fund Distributor ARN-273396 and SIF distributor) integrates computer science analytics, systematic portfolio optimization, and structured asset allocation, delivering a modern, data-backed approach to wealth management that prior generations never had access to.
                    </p>
                  </div>
                </div>

                {/* 02: Services */}
                <div className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${expandedOption === "services" ? "opacity-100 pointer-events-auto scale-100 translate-y-0" : "opacity-0 pointer-events-none scale-95 -translate-y-2"}`}>
                  <div className="flex flex-col items-center justify-start gap-8 max-w-5xl mx-auto text-center w-full min-h-[520px]">
                    <div className="grid grid-cols-2 gap-16 lg:gap-28 w-full mt-4 justify-items-center items-start">
                      
                      {/* Investments Branch container (wraps Level 1, 2, and 3) */}
                      <div
                        className="flex flex-col items-center animate-in fade-in duration-300 w-max xl:pl-16"
                        onMouseEnter={() => setActiveHoverLevel1("investments")}
                        onMouseLeave={() => {
                          setActiveHoverLevel1(null);
                          setActiveHoverLevel2(null);
                        }}
                      >
                        {/* Level 1 Investments Box */}
                        <div className={`p-6 w-80 min-w-[320px] max-w-[320px] min-h-[170px] rounded-3xl border transition-all duration-300 text-left relative overflow-hidden select-none cursor-pointer ${
                          activeHoverLevel1 === "investments"
                            ? "bg-amber-500/10 border-amber-500/40 shadow-lg scale-[1.02]"
                            : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_20px_50px_rgba(245,158,11,0.08)] hover:scale-[1.01]"
                        }`}>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                          <span className="text-[9px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                            Wealth & Growth
                          </span>
                          <h4 className="text-lg font-bold text-primary font-clash mt-3 mb-1.5">
                            Investments
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                            Systematic wealth creation & capital protection.
                          </p>
                        </div>

                        {/* Level 2 Connector line (drawn under parent card) */}
                        <div className={`w-0.5 transition-all duration-500 ease-in-out bg-gradient-to-b from-amber-500/30 to-amber-500/10 ${
                          activeHoverLevel1 === "investments" ? "h-8 opacity-100" : "h-0 opacity-0 pointer-events-none"
                        }`} />

                        {/* Level 2 Grid Container */}
                        <div className={`grid grid-cols-2 gap-8 transition-all duration-500 ease-in-out transform origin-top ${
                          activeHoverLevel1 === "investments"
                            ? "opacity-100 scale-100 max-h-[1000px] translate-y-0"
                            : "opacity-0 scale-95 max-h-0 -translate-y-4 overflow-hidden pointer-events-none"
                        }`}>
                          
                          {/* Fixed Deposits child branch */}
                          <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setActiveHoverLevel2("fd")}
                            onMouseLeave={() => setActiveHoverLevel2(null)}
                          >
                            {/* FD Box */}
                            <div className={`p-6 w-72 min-w-[288px] max-w-[288px] rounded-3xl border transition-all duration-300 text-left relative overflow-hidden select-none cursor-pointer ${
                              activeHoverLevel2 === "fd"
                                ? "bg-amber-500/10 border-amber-500/40 shadow-md scale-[1.02]"
                                : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_15px_35px_rgba(245,158,11,0.06)] hover:scale-[1.01]"
                            }`}>
                              <span className="text-[9px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                                Capital Protection
                              </span>
                              <h4 className="text-base font-bold text-primary font-clash mt-3 mb-1.5">
                                Fixed Deposits
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                                Secure, stable high-yield options.
                              </p>
                            </div>

                            {/* Level 3 Connector (FD) */}
                            <div className={`w-0.5 transition-all duration-500 ease-in-out bg-gradient-to-b from-amber-500/30 to-amber-500/10 ${
                              activeHoverLevel2 === "fd" ? "h-8 opacity-100" : "h-0 opacity-0 pointer-events-none"
                            }`} />

                            {/* Level 3 Content (FD) */}
                            <div className={`transition-all duration-500 ease-in-out transform origin-top ${
                              activeHoverLevel2 === "fd"
                                ? "opacity-100 scale-100 max-h-[300px] translate-y-0"
                                : "opacity-0 scale-95 max-h-0 -translate-y-4 overflow-hidden pointer-events-none"
                            }`}>
                              <div 
                                className="p-5 w-64 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/45 to-amber-500/5 shadow-[0_15px_30px_rgba(245,158,11,0.1)] backdrop-blur-2xl text-left relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 select-none"
                                onClick={scrollToFaq}
                              >
                                <span className="text-[8px] font-mono text-amber-800 tracking-wider uppercase font-bold bg-amber-500/20 px-2 py-0.5 rounded-full w-fit">
                                  Fixed Return
                                </span>
                                <h5 className="text-sm font-bold text-primary font-clash mt-2.5 mb-1">
                                  Company Deposit
                                </h5>
                                <p className="text-xs text-muted-foreground leading-normal font-sans font-medium">
                                  Corporate deposits with secure, verified high yields.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Mutual Funds child branch */}
                          <div
                            className="flex flex-col items-center relative"
                            onMouseEnter={() => setActiveHoverLevel2("mf")}
                            onMouseLeave={() => setActiveHoverLevel2(null)}
                          >
                            {/* MF Box */}
                            <div className={`p-6 w-72 min-w-[288px] max-w-[288px] rounded-3xl border transition-all duration-300 text-left relative overflow-hidden select-none cursor-pointer ${
                              activeHoverLevel2 === "mf"
                                ? "bg-amber-500/10 border-amber-500/40 shadow-md scale-[1.02]"
                                : "border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_15px_35px_rgba(245,158,11,0.06)] hover:scale-[1.01]"
                            }`}>
                              <span className="text-[9px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                                Active Growth
                              </span>
                              <h4 className="text-base font-bold text-primary font-clash mt-3 mb-1.5">
                                Mutual Funds
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                                Market-linked growth with diversification.
                              </p>
                            </div>

                            {/* Level 3 Connector (MF) */}
                            <div className={`w-0.5 transition-all duration-500 ease-in-out bg-gradient-to-b from-amber-500/30 to-amber-500/10 ${
                              activeHoverLevel2 === "mf" ? "h-8 opacity-100" : "h-0 opacity-0 pointer-events-none"
                            }`} />

                            {/* Level 3 Content (MF - 4 boxes) */}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ease-in-out transform origin-top ${
                              activeHoverLevel2 === "mf"
                                ? "opacity-100 scale-100 max-h-[500px] translate-y-0"
                                : "opacity-0 scale-95 max-h-0 -translate-y-4 overflow-hidden pointer-events-none"
                            }`}>
                              <div className="grid grid-cols-4 gap-3 w-[900px]">
                                {[
                                  { title: "SIP", desc: "Systematic investments for long-term compound growth." },
                                  { title: "Lumpsum", desc: "Compounding one-time principal investments over any tenure." },
                                  { title: "SIF", desc: "Specialized Investment Funds with hurdle targets." },
                                  { title: "PMS", desc: "Portfolio Management Services for customized asset allocation." }
                                ].map((sub, i) => (
                                  <div 
                                    key={i} 
                                    className="p-5 min-h-[150px] rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/45 to-amber-500/5 shadow-[0_15px_30px_rgba(245,158,11,0.08)] backdrop-blur-2xl text-left relative overflow-hidden select-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    onClick={scrollToFaq}
                                  >
                                    <span className="text-[8px] font-mono text-amber-800 tracking-wider uppercase font-bold bg-amber-500/20 px-2 py-0.5 rounded-full w-fit">
                                      Growth
                                    </span>
                                    <h5 className="text-base font-bold text-primary font-clash mt-3 mb-1">{sub.title}</h5>
                                    <p className="text-xs text-muted-foreground leading-normal font-sans font-medium">{sub.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Life Insurance Box Branch (Level 1 only) */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="p-6 w-80 min-w-[320px] max-w-[320px] min-h-[170px] rounded-3xl border border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_20px_50px_rgba(245,158,11,0.08)] backdrop-blur-2xl text-left relative overflow-hidden select-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                          onClick={scrollToFaq}
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                          <span className="text-[9px] font-mono text-amber-700 tracking-wider uppercase font-bold bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                            Risk Mitigation
                          </span>
                          <h4 className="text-lg font-bold text-primary font-clash mt-3 mb-1.5">
                            Life Insurance
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                            Protecting your family's future, health, and properties.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 03: Why Us */}
                <div className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${expandedOption === "why-us" ? "opacity-100 pointer-events-auto scale-100 translate-y-0" : "opacity-0 pointer-events-none scale-95 -translate-y-2"}`}>
                  <div className="flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto text-center">
                    <img
                      src="/assets/exist.png"
                      alt="Why We Exist"
                      className="w-76 h-auto rounded-2xl object-contain select-none pointer-events-none"
                    />
                    <p className="font-sans leading-relaxed font-bold text-foreground text-base md:text-lg max-w-4xl mx-auto">
                      In an era dominated by cold robo-distribution representatives and static investment apps, your hard-earned wealth deserves personalized, <span className="font-extrabold text-primary">relationship-driven human distribution</span>. We exist to bridge the gap between human empathy and data precision. By standing by our clients through decades of market turbulence, recessions, and regulatory shifts, we prioritize multi-generational trust and structured planning. We don't just measure relationships in transactions; we measure them in decades of successful outcomes and financial security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollBlurReveal>
        }
      />

      <ScrollTextReveal />

      {/* Interactive Chatbot Promo Section */}
      <div className="w-full relative z-10 pt-4 pb-16 px-6 overflow-hidden">
        {/* Ambient backing glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(46,125,50,0.03)_0%,transparent_70%)] pointer-events-none select-none" />

        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="w-full p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
          <div className="space-y-4 max-w-xl text-left">
            <span className="text-[10px] text-primary border border-primary/25 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Instant Support
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary font-instrument-serif">
              Meet Virtual Arijit : Real-Time Insights, Zero Waiting.
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed font-sans">
              Have questions about how we check anomalies, calculate fee efficiency, or structure systematic portfolios? It leverages insights from our 35-year distribution experience to answer your questions instantly.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/45 backdrop-blur-2xl border border-border rounded-2xl md:min-w-[280px] shadow-sm text-center relative group">
            <span className="text-lg font-semibold text-primary font-instrument-serif">Try Virtual Arijit Now</span>

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
      </ScrollBlurReveal>
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
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-instrument-serif leading-tight">
                  Know what kind of investor you are!
                </h2>
                <p className="text-foreground/80 text-sm md:text-base leading-relaxed font-sans max-w-md">
                  Are you a Conservative Protector, a Strategic Compounder, or an Aggressive Visionary? Take our quick 2-minute diagnostic to analyze your risk preference and discover the asset mix that fits your lifestyle.
                </p>

                {/* Animal Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {["🐅 Tiger", "🐘 Elephant", "🦌 Deer", "🦊 Fox", "🦁 Lion"].map((animal, idx) => (
                    <span key={idx} className="text-xs font-semibold font-instrument-serif text-foreground bg-[#FAF6F0] border border-[#C4A484]/40 px-2.5 py-1 rounded-lg select-none hover:scale-105 hover:bg-[#EAE1D4] hover:border-[#8D6E63]/60 transition duration-200">
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
                  <span className="font-bold font-instrument-serif">Start Quiz</span>
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
                    <span className="text-[9px] font-mono text-foreground/70 tracking-wider block">🐘 Elephant</span>
                    <span className="text-xs font-bold text-foreground font-clash">20%</span>
                  </div>

                  <div className="p-3 bg-gradient-to-b from-foreground/10 to-foreground/5 border border-foreground/30 rounded-2xl flex flex-col items-center gap-1 text-center shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/50 transition-all duration-300 relative overflow-hidden cursor-default select-none text-foreground">
                    <div className="absolute top-0 inset-x-0 h-1 bg-foreground" />
                    <span className="text-[9px] font-mono text-foreground tracking-wider font-bold block">🐅 Tiger</span>
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
                      🐅
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

      {/* Portfolio Health Report Section */}
      <div className="w-full relative z-10 py-16 px-6">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-3xl shadow-sm flex flex-col lg:flex-row gap-12 text-left items-stretch">
            {/* Background decorative glows */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Left Column: Details */}
            <div className="flex-1 flex flex-col justify-between space-y-8 relative z-10">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-instrument-serif leading-tight">
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
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-instrument-serif font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group"
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
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Calculators Hub Section */}
      <div id="calculators" className="w-full relative z-10 py-16 px-6 bg-transparent">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-instrument-serif leading-tight mt-3">
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
                title: "SWP Calculator",
                desc: "Calculate how long your retirement corpus will last or find out what corpus is required for your desired monthly income.",
                href: "/swp-calculator"
              },
              {
                title: "Inflation Calculator",
                desc: "Visualize the future cost of your goals adjusted for inflation and determine the monthly SIP needed to reach them.",
                href: "/inflation-calculator"
              },
              {
                title: "SIF Calculator",
                desc: "Model Specialized Investment Fund compounding returns using target hurdle rates and top-ups.",
                href: "/sif-calculator"
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
                    {(i + 1) < 10 ? '0' : ''}{i + 1}
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-instrument-serif leading-tight mt-3">
                Daily Wisdom
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
              Get a new financial quote every 24 hours.
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
                className="absolute inset-0 w-full h-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 backdrop-blur-2xl border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.08)] flex flex-col justify-between items-center text-center overflow-hidden hover:border-amber-500/35 transition-colors duration-300"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Decorative glowing background gradients */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Floating typographic quotes */}
                <span className="absolute left-6 top-16 text-8xl font-serif text-amber-500/10 leading-none pointer-events-none select-none">“</span>
                <span className="absolute right-6 bottom-16 text-8xl font-serif text-amber-500/10 leading-none pointer-events-none select-none">”</span>

                <div className="w-full flex justify-between items-center pb-3.5 relative z-10">
                  <span className="text-[10px] font-mono text-amber-700 tracking-widest uppercase font-bold">Daily Quote</span>
                  <span className="text-[9px] font-mono text-amber-600/60 uppercase font-bold">ACTIVE FOR 24H</span>
                </div>

                <div className="my-auto py-6 relative z-10">
                  <p className="text-xl md:text-2xl font-medium font-clash italic leading-relaxed text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    "{dailyQuote.text}"
                  </p>
                  <span className="block text-right text-[11px] md:text-xs text-amber-700 font-mono mt-4 font-bold tracking-wider">
                    — {dailyQuote.author}
                  </span>
                </div>


              </div>

              {/* Back Side of Card */}
              <div
                className="absolute inset-0 w-full h-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 backdrop-blur-2xl border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.08)] flex flex-col justify-between items-center text-center overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Decorative glowing background gradients */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-full flex justify-between items-center pb-3.5 relative z-10">
                  <span className="text-[10px] font-mono text-amber-700 tracking-widest uppercase font-bold">Advisor Profile</span>
                  <span className="text-[9px] font-mono text-amber-600/60 uppercase font-bold">SEBI REGISTERED</span>
                </div>

                <div className="w-full my-auto space-y-4 relative z-10">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-16 h-16 rounded-full border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center bg-primary/5">
                      <img
                        src="/assets/me.jpeg"
                        alt="Arijit De"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold font-clash text-neutral-900 mt-1">Arijit De</h3>
                    <p className="text-xs text-neutral-500 font-mono">SEBI Mutual Fund Distributor</p>
                    <p className="text-xs text-neutral-600 leading-relaxed font-sans max-w-sm mx-auto">
                      Helping retail and corporate investors optimize their mutual fund distribution portfolios, restructure tax impact, and execute active rebalancing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="w-full bg-transparent relative z-10 py-32">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative">

          {/* Left Column: Title & FAQ List */}
          <div className="lg:col-span-7 flex flex-col gap-12 text-left w-full">
            <ScrollBlurReveal className="flex flex-col gap-4">
              <span className="text-[10px] md:text-sm uppercase text-muted-foreground font-clash font-bold tracking-wider">
                Common Inquiries
              </span>
              <h2 className="text-4xl md:text-[5rem] leading-[1.05] text-primary tracking-tight font-normal">
                <span className="font-clash">Frequently</span>{" "}
                <span className="font-clash font-medium tracking-tight">asked</span>
                <span className="block font-clash font-medium tracking-tight">questions</span>
              </h2>
            </ScrollBlurReveal>

            {/* Interactive Accordion List */}
            <ScrollBlurReveal className="w-full">
              <div className="flex flex-col w-full border-t border-border mt-6">
              {faqData.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border-b border-border py-6 flex flex-col text-left transition-colors duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="flex justify-between items-center w-full gap-4 text-left focus:outline-none group py-1"
                    >
                      <h3 className={`text-base md:text-lg font-medium tracking-wide transition-colors duration-300 font-clash ${isOpen ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"
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
                    <div className={`grid transition-all duration-[400ms] ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                      }`}>
                      <div className="overflow-hidden">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans pr-4 pb-4 pt-1">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </ScrollBlurReveal>
          </div>

          {/* Right Column: Sticky Call Booking Widget */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-32 flex justify-center lg:justify-end mt-12 lg:mt-0">
            <ScrollBlurReveal className="w-full max-w-sm">
              <div className="w-full rounded-[2.5rem] p-8 md:p-10 bg-white/30 backdrop-blur-2xl border border-border shadow-[0_20px_50px_rgba(147,197,253,0.12)] relative overflow-hidden flex flex-col text-left text-foreground group hover:scale-[1.02] transition-transform duration-500">
                {/* Local Box Background (Book Call Image) inside the card */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-90">
                  <img
                    src="/assets/bookcall.jpeg"
                    alt="Book Call Background"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-white/10" />
                </div>

                {/* Call-to-action Heading */}
                <h3 className="text-3xl md:text-4xl font-semibold leading-tight mb-8 font-clash relative z-10 text-primary">
                  Book a 15-min<br />intro call
                </h3>

                {/* Booking Link */}
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full block py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer relative z-10 font-clash"
                >
                  Book a call
                </button>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-border my-8 relative z-10" />

                {/* Footer section with email and arrow button */}
                <div className="flex justify-between items-center relative z-10 w-full">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prefer to email?</span>
                    <a
                      href="mailto:arijit1504@gmail.com"
                      className="text-sm font-semibold hover:underline text-primary font-mono"
                    >
                      arijit1504@gmail.com
                    </a>
                  </div>

                  <a
                    href="mailto:arijit1504@gmail.com"
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 hover:bg-primary/90 active:scale-95 transition-all duration-300 shadow-md cursor-pointer flex-shrink-0"
                    aria-label="Send email"
                  >
                    <svg className="w-5 h-5 transform stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </ScrollBlurReveal>
          </div>

        </div>
      </div>

      {/* Hello Text Section */}
      <div ref={helloSectionRef} className="w-full relative z-10 bg-transparent select-none">
        <div className="w-full flex flex-col items-center justify-center px-6 py-2">
          <ScrollBlurReveal className="w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
            <div ref={envelopeRef} className="w-64 h-64 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] relative z-0 flex items-center justify-center">
              <img
                src="/assets/envelope.png"
                alt="Envelope"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          </ScrollBlurReveal>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="w-full bg-transparent relative z-10 pt-10 pb-24 overflow-hidden">
        <ScrollBlurReveal className="w-full max-w-xl mx-auto px-6">
          <div className="relative text-left">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl lg:text-5xl tracking-tight text-primary font-instrument-serif">
                Connect With Us
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed font-sans max-w-sm mx-auto">
                Drop us a message and we will get back to you shortly to analyze your portfolio.
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
                  placeholder="e.g. Your Name"
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
                  placeholder="e.g. youremail@example.com"
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

      <Footer footerRef={footerRef} onBookCallClick={() => setIsBookingModalOpen(true)} />

      <BookCallModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

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
                We use cookies to analyze traffic, remember preferences, and optimize your portfolio health report. Read our <a href="/cookies" className="underline hover:text-primary transition duration-200">Cookies Policy</a>.
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

    </main>
  );
}
