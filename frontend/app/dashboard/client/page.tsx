'use client';

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { 
  LogOut, 
  LayoutGrid, 
  Award, 
  ShieldCheck, 
  Wallet, 
  Sparkles, 
  Gift, 
  Percent, 
  Calendar, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Download, 
  RefreshCw,
  Clock,
  HelpCircle,
  FileText,
  User,
  ArrowRight
} from "lucide-react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import ChatbotWidget from "@/components/ChatbotWidget";

// ──── Quiz Configuration ────
const GOAL_OPTIONS = [
  { value: "WEALTH_CREATION", label: "Wealth Creation", desc: "Long-term compounding to build a substantial corpus", icon: Sparkles },
  { value: "RETIREMENT", label: "Retirement Planning", desc: "Securing financial independence for your post-work years", icon: ShieldCheck },
  { value: "HOUSE_PURCHASE", label: "House Purchase", desc: "Saving for your dream home", icon: Sparkles },
  { value: "CHILD_EDUCATION", label: "Child Education", desc: "Building a corpus for your children's education", icon: Calendar },
  { value: "MARRIAGE", label: "Marriage", desc: "Funding an upcoming marriage", icon: Sparkles },
  { value: "PASSIVE_INCOME", label: "Passive Income", desc: "Generate steady returns from your investments", icon: Sparkles },
  { value: "TAX_SAVING", label: "Tax Saving", desc: "Optimizing investments for tax efficiency", icon: ShieldCheck },
  { value: "NOT_SURE_YET", label: "Not Sure Yet", desc: "Exploring and learning about investment options", icon: CompassIcon },
];

const AGE_RANGE_OPTIONS = [
  { value: "BELOW_25", label: "Below 25", numericAge: 22 },
  { value: "25_35", label: "25–35", numericAge: 30 },
  { value: "36_45", label: "36–45", numericAge: 40 },
  { value: "46_60", label: "46–60", numericAge: 53 },
  { value: "ABOVE_60", label: "Above 60", numericAge: 65 },
];

const LIFE_STAGE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "EARLY_CAREER", label: "Early Career Professional" },
  { value: "MID_CAREER", label: "Mid-Career Professional" },
  { value: "BUSINESS_OWNER", label: "Business Owner" },
  { value: "HIGH_LEVEL_PROFESSIONAL", label: "High-Level Professional (10+ Years Experience)" },
  { value: "RETIRED", label: "Retired" },
];

const INVESTMENT_TENURE_OPTIONS = [
  { value: "LESS_THAN_3_YEARS", label: "Less than 3 Years" },
  { value: "3_TO_5_YEARS", label: "3–5 Years" },
  { value: "5_TO_10_YEARS", label: "5–10 Years" },
  { value: "10_TO_20_YEARS", label: "10–20 Years" },
  { value: "MORE_THAN_20_YEARS", label: "More than 20 Years" },
];

const MONTHLY_INVESTMENT_OPTIONS = [
  { value: "NOT_INVESTING", label: "Currently Not Investing" },
  { value: "BELOW_1000", label: "Below ₹1,000" },
  { value: "1500_2500", label: "₹1,500 – ₹2,500" },
  { value: "3000_5000", label: "₹3,000 – ₹5,000" },
  { value: "6000_10000", label: "₹6,000 – ₹10,000" },
  { value: "15000_PLUS", label: "₹15,000+" }
];

const EMERGENCY_FUND_OPTIONS = [
  { value: "YES_MORE_THAN_6_MONTHS", label: "Yes, more than 6 months expenses" },
  { value: "YES_3_TO_6_MONTHS", label: "Yes, 3–6 months expenses" },
  { value: "YES_LESS_THAN_3_MONTHS", label: "Less than 3 months expenses" },
  { value: "NO_EMERGENCY_FUND", label: "No emergency fund" }
];

function CompassIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const quotesList = [
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
  { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "John Templeton" },
  { text: "The most powerful force in the universe is compound interest.", author: "Albert Einstein" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "Know what you own, and know why you own it.", author: "Peter Lynch" }
];

interface PortfolioRow {
  fundName: string;
  type: "SIP" | "LUMPSUM";
  startDate: string;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

interface ScoreData {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: "ALIGNED" | "MODERATE" | "NEEDS_REVIEW" | "NEEDS_STRUCTURING";
  insights: string[];
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free Tier",
  PREMIUM: "Premium Pro Plan",
  MAX: "Max Portfolio Plan",
};

export default function ClientDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<{ 
    id: string; 
    name?: string; 
    email?: string; 
    role?: string; 
    phone?: string;
    pan?: string;
    client?: {
      activePlan: string | null;
      advisorNotes: string | null;
      activatedAt: string;
    } | null;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // States
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // PAN login states
  const [panInput, setPanInput] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  // Forgot password flow states
  const [forgotFlow, setForgotFlow] = useState<'LOGIN' | 'SEND_OTP' | 'VERIFY_RESET'>('LOGIN');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Quiz States (if needed to update lifecycle)
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>("25-35");
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>("");
  const [quizGoal, setQuizGoal] = useState<string>("WEALTH_CREATION");
  const [quizInvestmentTenure, setQuizInvestmentTenure] = useState<string>("");
  const [quizIsCompletePortfolio, setQuizIsCompletePortfolio] = useState<boolean | null>(true);
  const [quizInvestmentStyle, setQuizInvestmentStyle] = useState<string>("");
  const [quizExpectedReturn, setQuizExpectedReturn] = useState<string>("");
  const [quizRiskBehavior, setQuizRiskBehavior] = useState<string>("");
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] = useState<string>("");
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>("");
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);

  // Database contexts
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [activePortfolio, setActivePortfolio] = useState<any | null>(null);
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);
  const [existingClientData, setExistingClientData] = useState<any | null>(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  // Client specifics
  const [finPoints, setFinPoints] = useState<number>(0);
  const [lastQuoteFlipTime, setLastQuoteFlipTime] = useState<string | null>(null);
  const [isClientQuoteFlipped, setIsClientQuoteFlipped] = useState(false);
  const [usePointsForDiscount, setUsePointsForDiscount] = useState(false);
  const [clientBookings, setClientBookings] = useState<string[]>([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [pointsEarnedToday, setPointsEarnedToday] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Booking / Scheduling States
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [slot3, setSlot3] = useState("");
  const [mustSchedule, setMustSchedule] = useState(false);

  // Uploader tabs
  const [analyzeTab, setAnalyzeTab] = useState<"FILE" | "MANUAL">("FILE");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualRows, setManualRows] = useState<PortfolioRow[]>([
    { fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }
  ]);


  const [currentTime, setCurrentTime] = useState("");

  // View full scorecard inline toggle
  const [viewFullReport, setViewFullReport] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const setAuthSession = (token: string, user: any, remember: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : ""; // 30 days or session cookie
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; ${expiry}; SameSite=Lax; Secure`;
  };

  // Clock Synchronizer and Booking Slot Initializer
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Default slot: 24h from now formatted to YYYY-MM-DDTHH:mm
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    setSelectedSlot(`${year}-${month}-${day}T${hours}:${minutes}`);

    return () => clearInterval(interval);
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

  // Auth Guard & Setup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      setIsLoaded(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== "CLIENT") {
        window.location.href = "/dashboard/user";
        return;
      }
      setToken(savedToken);
      setUserData(parsedUser);
      setIsLoaded(true);

      // Load client states
      const savedPoints = localStorage.getItem("finPointsBalance");
      if (savedPoints) {
        setFinPoints(Number(savedPoints));
      } else {
        localStorage.setItem("finPointsBalance", "0");
        setFinPoints(0);
      }

      const savedFlipTime = localStorage.getItem("lastQuoteFlipTime");
      setLastQuoteFlipTime(savedFlipTime);

      const savedBookings = localStorage.getItem("clientBookings");
      if (savedBookings) {
        setClientBookings(JSON.parse(savedBookings));
      }
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoaded(true);
    }
  }, []);

  // Data Fetching
  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token]);

  const fetchClientData = async () => {
    try {
      setApiLoading(true);
      setStatusMsg("Loading premium client workspace...");
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Me check
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/onboarding";
        return;
      }
      const meData = await meRes.json();
      if (meRes.ok && meData.data?.role === "CLIENT") {
        const uObj = meData.data;
        setUserData(uObj);
        localStorage.setItem("user", JSON.stringify(uObj));
        if (uObj.finPoints !== undefined) {
          setFinPoints(uObj.finPoints);
          localStorage.setItem("finPointsBalance", uObj.finPoints.toString());
        }
      }

      // 2. Fetch assessments
      const assessRes = await fetch(`${backendUrl}/api/assess`, { headers });
      const assessData = await assessRes.json();
      const userAssessments = assessData.success ? assessData.data : [];

      if (userAssessments.length > 0) {
        const latestAssessment = userAssessments[0];
        setActiveAssessmentId(latestAssessment.id);
        setQuizAge(latestAssessment.age);
        setQuizGoal(latestAssessment.goal);
        if (latestAssessment.ageRange) setQuizAgeRange(latestAssessment.ageRange);
        if (latestAssessment.lifeStage) setQuizLifeStage(latestAssessment.lifeStage);
        if (latestAssessment.investmentTenure) setQuizInvestmentTenure(latestAssessment.investmentTenure);
        if (latestAssessment.isCompletePortfolio !== null && latestAssessment.isCompletePortfolio !== undefined) setQuizIsCompletePortfolio(latestAssessment.isCompletePortfolio);
        if (latestAssessment.investmentStyle) setQuizInvestmentStyle(latestAssessment.investmentStyle);
        if (latestAssessment.expectedReturn) setQuizExpectedReturn(latestAssessment.expectedReturn);
        if (latestAssessment.riskBehavior) setQuizRiskBehavior(latestAssessment.riskBehavior);
        if (latestAssessment.monthlyInvestment) setQuizMonthlyInvestment(latestAssessment.monthlyInvestment);
        if (latestAssessment.emergencyFund) setQuizEmergencyFund(latestAssessment.emergencyFund);
      }

      // 3. Fetch portfolios
      const portRes = await fetch(`${backendUrl}/api/portfolio`, { headers });
      const portData = await portRes.json();
      const userPortfolios = portData.success ? portData.data : [];

      if (userPortfolios.length > 0) {
        const latestPortfolio = userPortfolios[0];
        setActivePortfolioId(latestPortfolio.id);
        setActivePortfolio(latestPortfolio);
        if (latestPortfolio.score) {
          setScoreReport(latestPortfolio.score);
        } else {
          // Score it inline
          await calculatePortfolioScore(latestPortfolio.id);
        }
      }

      // 4. Fetch official matching ExistingClient and Folios data
      try {
        const ecRes = await fetch(`${backendUrl}/api/portfolio/client-data`, { headers });
        const ecData = await ecRes.json();
        if (ecData.success && ecData.data) {
          setExistingClientData(ecData.data);
        }
      } catch (ecErr) {
        console.error("Failed to load certified valuation telemetry:", ecErr);
      }

      // 5. Fetch payments and sessions to check if live session is scheduled
      try {
        const payRes = await fetch(`${backendUrl}/api/payments/my-payments`, { headers });
        const payData = await payRes.json();
        const userPayments = payData.success ? payData.data : [];
        setPayments(userPayments);

        const sessionsRes = await fetch(`${backendUrl}/api/leads/my-sessions`, { headers });
        const sessionsData = await sessionsRes.json();
        const userSessions = sessionsData.success ? sessionsData.data : [];
        setSessions(userSessions);

        const validPayments = userPayments.filter((p: any) => p.status === "APPROVED" || p.status === "PENDING");
        const hasPaidLive = validPayments.some((p: any) => p.productType === "LIVE_SESSION" || p.amount === 499 || p.amount === 300 || p.amount === 699);
        if (hasPaidLive) {
          const liveSession = userSessions.find((s: any) => s.payment?.status === "APPROVED" || s.payment?.productType === "LIVE_SESSION");
          const hasScheduled = liveSession && new Date(liveSession.preferredSlot1).getTime() > 0;
          if (liveSession && !hasScheduled) {
            setMustSchedule(true);
          } else {
            setMustSchedule(false);
          }
        } else {
          setMustSchedule(false);
        }
      } catch (checkErr) {
        console.error("Failed to run schedule guard check:", checkErr);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load diagnostic telemetry data.");
    } finally {
      setApiLoading(false);
    }
  };

  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/score/${portfolioId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setScoreReport(data.data);
      } else {
        setError(data.error || "Failed to analyze score.");
      }
    } catch (err) {
      setError("Network error running score calculation.");
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1 || !slot2 || !slot3) {
      setError("Please select all 3 preferred time slots.");
      return;
    }

    const livePayment = payments.find(
      (p: any) => p.productType === "LIVE_SESSION" && p.status === "APPROVED"
    );

    if (!livePayment) {
      setError("No approved Live Portfolio Review Discussion payment found.");
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Submitting your slot preferences to Arijit...");

    try {
      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      const res = await fetch(`${backendUrl}/api/leads/book-session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          paymentId: livePayment.id,
          slot1,
          slot2,
          slot3
        })
      });
      const resData = await res.json();

      if (resData.success) {
        alert("Preferred slots submitted successfully! Arijit will review and confirm one of your slots.");
        setMustSchedule(false);
        await fetchClientData();
      } else {
        setError(resData.error || "Failed to submit booking preferences.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while submitting slots.");
    } finally {
      setApiLoading(false);
    }
  };

  // Flip quote reward
  const handleClientQuoteFlip = async () => {
    if (!isClientQuoteFlipped) {
      const today = new Date().toDateString();
      const claimedDate = localStorage.getItem('dailyRewardClaimedDate');

      if (claimedDate !== today) {
        try {
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

            setFinPoints(newBalance);
            setPointsEarnedToday(points);
            localStorage.setItem("finPointsBalance", newBalance.toString());
            localStorage.setItem("dailyRewardClaimedDate", today);
            
            // Notify other components
            window.dispatchEvent(new Event("points-updated"));
          } else {
            if (data.error === 'Already claimed today') {
              localStorage.setItem("dailyRewardClaimedDate", today);
              setPointsEarnedToday(0);
            }
          }
        } catch (err) {
          console.error("Failed to claim daily reward from dashboard", err);
          setPointsEarnedToday(0);
        }
      } else {
        setPointsEarnedToday(0);
      }
      setIsClientQuoteFlipped(true);
    } else {
      setIsClientQuoteFlipped(false);
    }
  };

  const getRemainingFlipTime = () => {
    const claimedDate = localStorage.getItem('dailyRewardClaimedDate');
    const today = new Date().toDateString();
    if (claimedDate !== today) return "Ready to flip!";
    return "Come back tomorrow!";
  };

  // 1-Click Booking
  const handleClientBookCall = async () => {
    setError(null);
    setApiLoading(true);
    setStatusMsg("Registering premium portfolio review discussion booking...");

    try {
      const res = await fetch(`${backendUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData?.name || "Client",
          phone: userData?.phone || "0000000000",
          slot: selectedSlot ? new Date(selectedSlot).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
      const data = await res.json();

      if (data.success) {
        const selectedSlotDate = selectedSlot ? new Date(selectedSlot) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        const formattedSlot = selectedSlotDate.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const newBooking = `1-on-1 Strategy Session - Confirmed for ${formattedSlot} (Free)`;
        const updatedBookings = [newBooking, ...clientBookings];
        setClientBookings(updatedBookings);
        localStorage.setItem("clientBookings", JSON.stringify(updatedBookings));

        setShowBookingSuccess(true);
      } else {
        setError(data.error || "Failed to book call.");
      }
    } catch (err) {
      setError("Network error booking call.");
    } finally {
      setApiLoading(false);
    }
  };

  // Upload portfolio file submit
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (!activeAssessmentId) {
      setError("Assessment profile missing. Please complete lifecycle details first.");
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Uploading investment telemetry file...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("assessmentId", activeAssessmentId);

      const res = await fetch(`${backendUrl}/api/portfolio/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg("Analyzing asset allocation and scoring...");
        await calculatePortfolioScore(pId);
        await fetchClientData();
        setUploadedFile(null);
      } else {
        setError(data.error || "Failed to process Excel upload.");
      }
    } catch (err) {
      setError("Network error while uploading file.");
    } finally {
      setApiLoading(false);
    }
  };

  // Manual Portfolio submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentId) {
      setError("Assessment profile missing.");
      return;
    }

    for (let i = 0; i < manualRows.length; i++) {
      const row = manualRows[i]!;
      if (!row.fundName.trim()) {
        setError(`Row ${i + 1}: Fund name is required`);
        return;
      }
      if (!row.startDate) {
        setError(`Row ${i + 1}: Start date is required`);
        return;
      }
      if (new Date(row.startDate).getTime() > Date.now()) {
        setError(`Row ${i + 1}: Start date cannot be in the future`);
        return;
      }
      if (row.type === "SIP" && row.sipAmount <= 0) {
        setError(`Row ${i + 1}: SIP amount must be greater than 0`);
        return;
      }
      if (row.invested <= 0 || row.currentValue <= 0) {
        setError(`Row ${i + 1}: Invested and Current Value must be positive numbers`);
        return;
      }
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Saving manual investment details...");

    try {
      const formattedRows = manualRows.map(r => ({
        ...r,
        startDate: new Date(r.startDate).toISOString()
      }));

      const res = await fetch(`${backendUrl}/api/portfolio/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          rows: formattedRows
        })
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg("Calculating financial health scores...");
        await calculatePortfolioScore(pId);
        await fetchClientData();
        // Reset manual grid
        setManualRows([{ fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }]);
      } else {
        setError(data.error || "Failed to submit manual portfolio");
      }
    } catch (err) {
      setError("Network error while submitting details.");
    } finally {
      setApiLoading(false);
    }
  };

  const handleAddManualRow = () => {
    if (manualRows.length >= 15) {
      setError("Maximum of 15 rows allowed.");
      return;
    }
    setManualRows([...manualRows, { fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }]);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualRows.length === 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Fund Name,Investment Type,Start Date,Monthly SIP Amount,Total Invested,Current Value\n"
      + "HDFC Top 100 Fund,SIP,15/01/2022,5000,240000,295000\n"
      + "Parag Parikh Flexi Cap Fund,SIP,10/06/2021,10000,500000,680000\n"
      + "SBI Bluechip Fund,Lumpsum,20/03/2020,0,100000,165000\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Re-assess profile logic
  const handleQuizSubmit = async () => {
    if (!quizAgeRange || !quizGoal || !quizLifeStage || !quizInvestmentTenure || !quizMonthlyInvestment || !quizEmergencyFund) {
      setError("Please complete all assessment fields.");
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Updating your lifecycle diagnostics target...");

    try {
      const res = await fetch(`${backendUrl}/api/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(quizAge),
          goal: quizGoal,
          ageRange: quizAgeRange,
          lifeStage: quizLifeStage,
          investmentTenure: quizInvestmentTenure,
          monthlyInvestment: quizMonthlyInvestment,
          emergencyFund: quizEmergencyFund,
        })
      });
      const resData = await res.json();

      if (resData.success) {
        setActiveAssessmentId(resData.data.assessmentId);
        setShowQuiz(false);
        // Refresh scoring logic
        if (activePortfolioId) {
          await calculatePortfolioScore(activePortfolioId);
        }
      } else {
        setError(resData.error || "Failed to submit assessment target");
      }
    } catch (err) {
      setError("Could not submit assessment. Verify network connection.");
    } finally {
      setApiLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/onboarding";
  };

  const handlePanLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedPan = panInput.trim().toUpperCase();

    if (!trimmedPan) {
      setLoginError("Please enter your PAN number.");
      return;
    }

    if (trimmedPan.length !== 10) {
      setLoginError("PAN number must be exactly 10 characters long.");
      return;
    }

    if (!clientPassword) {
      setLoginError("Please enter your account password.");
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/pan/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan: trimmedPan, password: clientPassword }),
      });
      const data = await res.json();

      if (data.success) {
        const fetchedToken = data.data.token;
        const fetchedUser = data.data.user;

        setAuthSession(fetchedToken, fetchedUser, rememberMe);

        setToken(fetchedToken);
        setUserData(fetchedUser);

        // Load client states
        const savedPoints = localStorage.getItem("finPointsBalance");
        if (savedPoints) {
          setFinPoints(Number(savedPoints));
        } else {
          localStorage.setItem("finPointsBalance", "0");
          setFinPoints(0);
        }

        const savedFlipTime = localStorage.getItem("lastQuoteFlipTime");
        setLastQuoteFlipTime(savedFlipTime);

        const savedBookings = localStorage.getItem("clientBookings");
        if (savedBookings) {
          setClientBookings(JSON.parse(savedBookings));
        }
      } else {
        setLoginError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setLoginError("Network connection error. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSuccessMsg(null);
    const trimmedEmail = resetEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setLoginError("Please enter your registered email address.");
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/password/reset/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg(`Verification code sent successfully to ${trimmedEmail}`);
        setForgotFlow('VERIFY_RESET');
      } else {
        setLoginError(data.error || "Failed to send reset code.");
      }
    } catch (err) {
      setLoginError("Network connection error. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSuccessMsg(null);
    const trimmedEmail = resetEmail.trim().toLowerCase();
    const trimmedOtp = resetOtp.trim();
    const trimmedPass = newPassword.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setLoginError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (!trimmedPass || trimmedPass.length < 8 || !/[A-Z]/.test(trimmedPass) || !/[0-9]/.test(trimmedPass)) {
      setLoginError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/password/reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp, password: trimmedPass }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg("Password reset successfully! Please log in using your new credentials.");
        setForgotFlow('LOGIN');
        // Clear forms
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setPanInput('');
        setClientPassword('');
      } else {
        setLoginError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setLoginError("Network connection error. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 border-emerald-500/20 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-500/20 bg-amber-50";
    return "text-red-600 border-red-500/20 bg-red-50";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 75) return "#10b981";
    if (score >= 60) return "#d97706";
    return "#ef4444";
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case "ALIGNED": return "Perfectly Aligned";
      case "MODERATE": return "Moderately Aligned";
      case "NEEDS_REVIEW": return "Needs Critical Review";
      case "NEEDS_STRUCTURING": return "Needs Structuring";
      default: return tag;
    }
  };

  const getTagDesc = (tag: string) => {
    switch (tag) {
      case "ALIGNED": return "Your investment discipline, asset diversity, and cost efficiency are in excellent shape. Keep repeating the pattern.";
      case "MODERATE": return "Your portfolio is robust, but there are opportunities to optimize tax benefits, rebalance sector ratios, or trim overlaps.";
      case "NEEDS_REVIEW": return "Critical anomalies found. Value erosion, lack of asset diversification, or goal mismatches are dragging down your compound growth.";
      case "NEEDS_STRUCTURING": return "Your portfolio lacks structural direction relative to your lifecycle targets. A custom roadmap is highly recommended.";
      default: return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-[#F2F0EF] flex flex-col items-center justify-center text-center p-12">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
        <h3 className="text-lg font-medium text-neutral-900 font-clash">Loading Client portal...</h3>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-transparent text-neutral-900 flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Background with Ambient Radial Glows */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#F2F0EF] bg-[radial-gradient(circle_at_bottom,rgba(147,197,253,0.95)_0%,rgba(186,230,253,0.65)_45%,rgba(242,240,239,0)_85%)]">
        <SoftBoxBlurBg />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-border bg-white/35 backdrop-blur-md px-6 py-4 flex items-center justify-between text-neutral-900">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-neutral-400 bg-white/40 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
          <div className="hidden md:flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span className="font-chillax font-bold tracking-wider text-sm uppercase">Premium Client Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userData && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{userData.name || userData.email}</span>
              </div>
              <button
                onClick={() => setShowLogoutWarning(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col relative z-10">
        {/* Global Error Banner */}
        {error && (
          <div className="w-full max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Notification</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-neutral-900 font-bold ml-2">×</button>
          </div>
        )}

        {/* Global inline loaders */}
        {apiLoading && statusMsg && (
          <div className="fixed top-20 right-6 z-50 p-4 bg-white/80 border border-border rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 text-xs text-neutral-700 animate-in slide-in-from-right duration-300">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="font-medium">{statusMsg}</span>
          </div>
        )}

        {/* Quiz reassessment modal */}
        {(!token || !userData) ? (
          <div className="w-full max-w-md mx-auto bg-white/40 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">
                  {forgotFlow === 'LOGIN' && "Premium Client Access"}
                  {forgotFlow === 'SEND_OTP' && "Reset Account Password"}
                  {forgotFlow === 'VERIFY_RESET' && "Verify Reset Code"}
                </h2>
                <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                  {forgotFlow === 'LOGIN' && "Enter your registered 10-character PAN number and password to log in."}
                  {forgotFlow === 'SEND_OTP' && "Enter your registered email address to receive a 6-digit verification code."}
                  {forgotFlow === 'VERIFY_RESET' && "Enter the verification code sent to your email and your new password."}
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-600 rounded-xl text-xs text-left font-sans flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold shrink-0 mt-0.5">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 rounded-xl text-xs text-left font-sans flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold shrink-0 mt-0.5">✓</span>
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {forgotFlow === 'LOGIN' && (
                <form onSubmit={handlePanLogin} className="space-y-4 text-left animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">PAN Card Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panInput}
                      onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                      placeholder="E.g. ABCDE1234F"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-sm tracking-widest text-neutral-900 placeholder:text-neutral-400 placeholder:tracking-normal uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">Account Password</label>
                      <button
                        type="button"
                        onClick={() => { setForgotFlow('SEND_OTP'); setLoginError(null); setResetSuccessMsg(null); }}
                        className="text-[10px] text-primary hover:underline font-semibold font-sans cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showClientPassword ? "text" : "password"}
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="Enter account password"
                        disabled={authenticating}
                        className="w-full pl-4 pr-10 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
                      >
                        {showClientPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="dashboardRememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label htmlFor="dashboardRememberMe" className="text-xs text-muted-foreground select-none cursor-pointer font-sans">
                      Remember me on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authenticating Client...</span>
                      </>
                    ) : (
                      <>
                        <span>Secure Log In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotFlow === 'SEND_OTP' && (
                <form onSubmit={handleSendResetOtp} className="space-y-4 text-left animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setForgotFlow('LOGIN'); setLoginError(null); setResetSuccessMsg(null); }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              )}

              {forgotFlow === 'VERIFY_RESET' && (
                <form onSubmit={handleConfirmReset} className="space-y-4 text-left animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="Enter verification code"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-center font-mono text-sm tracking-widest text-neutral-900 placeholder:text-neutral-400 placeholder:tracking-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        disabled={authenticating}
                        className="w-full pl-4 pr-10 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-neutral-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset & Save Password</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setForgotFlow('LOGIN'); setLoginError(null); setResetSuccessMsg(null); }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
                    >
                      &larr; Cancel and Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : showQuiz ? (
          <div className="w-full max-w-md mx-auto bg-white/30 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
              <span>Client Targets Quiz</span>
              <span>Step {quizStep} of 5</span>
            </div>

            {/* Step 1: Life Stage */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Which best describes your current stage?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">Context and financial capacity.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {LIFE_STAGE_OPTIONS.map((opt) => {
                    const isSelected = quizLifeStage === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setQuizLifeStage(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? "bg-primary/10 border-primary text-neutral-900" : "bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900"}`}
                      >{opt.label}</button>
                    );
                  })}
                </div>
                <button onClick={() => { if (!quizLifeStage) { setError("Please select your life stage."); return; } setError(null); setQuizStep(2); }}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2: Investment Goal */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">What is the primary reason you&apos;re investing?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">Goal alignment score.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-left max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = quizGoal === goal.value;
                    const IconComponent = goal.icon;
                    return (
                      <button key={goal.value} onClick={() => { setQuizGoal(goal.value); setShowNotSureMessage(goal.value === "NOT_SURE_YET"); }}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${isSelected ? "bg-primary/10 border-primary" : "bg-white/40 border-white/20"}`}>
                        <div className="p-1.5 rounded-lg bg-white border border-border text-neutral-500"><IconComponent className="w-3.5 h-3.5" /></div>
                        <div>
                          <span className="text-xs font-semibold block">{goal.label}</span>
                          <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">{goal.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showNotSureMessage && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-sans leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="font-bold block mb-1">💡 You&apos;re not alone!</span>
                    More than 60% of investors start investing without a clearly defined goal. Let&apos;s help identify one through your portfolio health report.
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setQuizStep(1)} className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer">Back</button>
                  <button onClick={() => { if (!quizGoal) { setError("Please choose an investment goal."); return; } setError(null); setQuizStep(3); }}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5">Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Step 3: Investment Tenure */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">When do you expect to use this money?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">Tenure matching.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {INVESTMENT_TENURE_OPTIONS.map((opt) => {
                    const isSelected = quizInvestmentTenure === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setQuizInvestmentTenure(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? "bg-primary/10 border-primary text-neutral-900" : "bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900"}`}
                      >{opt.label}</button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQuizStep(2)} className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer">Back</button>
                  <button onClick={() => { if (!quizInvestmentTenure) { setError("Please select your investment tenure."); return; } setError(null); setQuizStep(4); }}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5">Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Step 4: Monthly Investment */}
            {quizStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Approximately how much are you able to invest every month?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">Investment capacity profile.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {MONTHLY_INVESTMENT_OPTIONS.map((opt) => {
                    const isSelected = quizMonthlyInvestment === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setQuizMonthlyInvestment(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? "bg-primary/10 border-primary text-neutral-900" : "bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900"}`}
                      >{opt.label}</button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQuizStep(3)} className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer">Back</button>
                  <button onClick={() => { if (!quizMonthlyInvestment) { setError("Please select your monthly investment amount."); return; } setError(null); setQuizStep(5); }}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5">Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Step 5: Emergency Fund */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Do you have an emergency fund?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">Safety reserves check.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {EMERGENCY_FUND_OPTIONS.map((opt) => {
                    const isSelected = quizEmergencyFund === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setQuizEmergencyFund(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? "bg-primary/10 border-primary text-neutral-900" : "bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900"}`}
                      >{opt.label}</button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-8">
                  <button onClick={() => setQuizStep(4)} className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer">Back</button>
                  <button onClick={handleQuizSubmit} disabled={apiLoading || !quizEmergencyFund}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer disabled:opacity-40">
                    {apiLoading ? "Submitting..." : "Finish & Update"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : mustSchedule ? (
          /* Distributor Booking Calendar for Paid Session */
          <div className="w-full max-w-xl mx-auto border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 text-left">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-neutral-900 tracking-wide font-clash">Schedule Consultation</h2>
              <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                You have selected the Live Portfolio Review Discussion. Please select your 3 distinct preferred date and time slots for Arijit to review and confirm one.
              </p>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-6">
              <div className="space-y-4">
                {/* Preferred Date & Time Selector 1 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">Preferred Time Option 1 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={slot1}
                    onChange={(e) => setSlot1(e.target.value)}
                    min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>

                {/* Preferred Date & Time Selector 2 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">Preferred Time Option 2 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={slot2}
                    onChange={(e) => setSlot2(e.target.value)}
                    min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>

                {/* Preferred Date & Time Selector 3 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">Preferred Time Option 3 *</label>
                  <input
                    type="datetime-local"
                    required
                    value={slot3}
                    onChange={(e) => setSlot3(e.target.value)}
                    min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>
              </div>

              {/* Prominent Trust Refund Policy Banner */}
              <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-blue-700 font-sans leading-relaxed flex gap-2.5">
                <span className="text-base">🛡️</span>
                <span>
                  <strong>We value your trust.</strong> If your scheduled session does not happen for any reason, you will receive a full refund within 24 hours. No questions asked.
                </span>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={apiLoading || !slot1 || !slot2 || !slot3}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {apiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Slots...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking Slots</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Client Grid Workspace */
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start select-text text-left">
            
            {/* 1. Left Sidebar: Profile, Wallet & 1-Click Booking */}
            <div className="md:col-span-1 space-y-6">
              {/* Member profile details */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-mono text-[9px] font-bold tracking-wider uppercase">
                    {PLAN_LABELS[userData?.client?.activePlan || "PREMIUM"]}
                  </span>
                  <Award className="w-4 h-4 text-emerald-600 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-wide font-clash">
                    Welcome, {userData?.name || "Client"}
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    SEBI-compliant investment cockpit. Add data & re-analyze infinite times.
                  </p>
                </div>

                <div className="border-t border-border/30 pt-3 space-y-2 text-xs font-sans text-neutral-600">
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-semibold text-neutral-800">{quizAge} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Life Stage:</span>
                    <span className="font-semibold text-neutral-800">
                      {LIFE_STAGE_OPTIONS.find(o => o.value === quizLifeStage)?.label || quizLifeStage || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Goal:</span>
                    <span className="font-semibold text-neutral-800">
                      {GOAL_OPTIONS.find(o => o.value === quizGoal)?.label || quizGoal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horizon:</span>
                    <span className="font-semibold text-neutral-800">
                      {INVESTMENT_TENURE_OPTIONS.find(o => o.value === quizInvestmentTenure)?.label || quizInvestmentTenure || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly capacity:</span>
                    <span className="font-semibold text-neutral-800">
                      {MONTHLY_INVESTMENT_OPTIONS.find(o => o.value === quizMonthlyInvestment)?.label || quizMonthlyInvestment || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Fund:</span>
                    <span className="font-semibold text-neutral-800">
                      {EMERGENCY_FUND_OPTIONS.find(o => o.value === quizEmergencyFund)?.label || quizEmergencyFund || "Not set"}
                    </span>
                  </div>
                  {userData?.pan && (
                    <div className="flex justify-between font-mono">
                      <span>PAN Card:</span>
                      <span className="font-semibold text-neutral-800">{userData.pan}</span>
                    </div>
                  )}
                  {userData?.phone && (
                    <div className="flex justify-between font-mono">
                      <span>Phone:</span>
                      <span className="font-semibold text-neutral-800">{userData.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setShowQuiz(true); setQuizStep(1); }}
                  className="w-full py-2 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer text-center"
                >
                  Adjust Investment Target
                </button>
              </div>

              {/* FinPoints Wallet */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-primary" />
                    FinWallet Balance
                  </h3>
                  <span className="text-[9px] font-mono text-primary font-bold">1 FP = ₹0.5</span>
                </div>

                <div className="py-2.5 text-center bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest block font-bold">FinPoints</span>
                  <div className="text-3xl font-bold font-mono text-neutral-900 mt-1">
                    {finPoints} <span className="text-xs font-sans font-medium text-neutral-500 font-semibold">FP</span>
                  </div>
                  <span className="text-xs font-sans font-medium text-emerald-600 block mt-1">(≈ ₹{(finPoints * 0.5).toFixed(2)})</span>
                </div>
              </div>

              {/* 1-Click Booking Widget */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Book Portfolio Review
                  </h3>
                  <span className="text-[9px] font-mono text-neutral-400">1-CLICK</span>
                </div>

                <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                  Book a priority 1-on-1 strategy session with our distribution representatives. Free of charge for active clients.
                </p>

                <div className="space-y-1">
                  <label htmlFor="booking-time-slot" className="text-[10px] uppercase font-bold text-neutral-500 block font-mono">
                    Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="booking-time-slot"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full p-2.5 text-xs border border-border/40 rounded-xl bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 font-sans cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-neutral-900/5 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-semibold">Total Price</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    Free
                  </span>
                </div>

                <button
                  onClick={handleClientBookCall}
                  disabled={apiLoading}
                  className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {apiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Book Call Instantly</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {clientBookings.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Active Bookings</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {clientBookings.map((b, idx) => (
                        <div key={idx} className="p-2.5 bg-emerald-50 border border-emerald-500/10 text-emerald-800 text-[10px] rounded-xl flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                          <span className="font-sans">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Middle & Right Main Panel: Flippable quote card and portfolio diagnostics */}
            <div className="md:col-span-2 space-y-6">
              {/* Daily Wisdom card */}
              <div 
                className="w-full h-[280px] [perspective:1000px] cursor-pointer"
                onClick={handleClientQuoteFlip}
              >
                <div 
                  className="relative w-full h-full duration-700 transition-transform"
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isClientQuoteFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                  }}
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/40 shadow-xl flex flex-col justify-between items-center text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-full flex justify-between items-center border-b border-border/20 pb-2">
                      <span className="text-[9px] font-mono text-primary tracking-widest uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        Daily Wisdom
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400 font-sans">ACTIVE FOR 24H</span>
                    </div>

                    <div className="my-auto py-2">
                      <p className="text-base md:text-lg font-medium italic leading-relaxed text-neutral-800 font-clash">
                        "{quotesList[new Date().getDate() % quotesList.length]?.text}"
                      </p>
                      <span className="block text-right text-[10px] text-neutral-500 font-mono mt-2 mr-4">
                        — {quotesList[new Date().getDate() % quotesList.length]?.author}
                      </span>
                    </div>

                    <div className="flex justify-center items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider font-sans">
                      <span>Tap to flip & claim points</span>
                      <span className="animate-bounce"><Gift className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/40 shadow-xl flex flex-col justify-between items-center text-center"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                    <div className="w-full flex justify-between items-center border-b border-border/20 pb-2">
                      <span className="text-[9px] font-mono text-primary tracking-widest uppercase font-bold flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Wisdom Reward
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400 font-sans">TODAY'S CLAIM</span>
                    </div>

                    <div className="w-full my-auto space-y-3">
                      {pointsEarnedToday > 0 ? (
                        <div className="space-y-2">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                            <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest block font-bold">Points Unlocked</span>
                            <div className="text-3xl font-bold font-mono text-emerald-700 mt-1 uppercase tracking-wider">
                              +{pointsEarnedToday} FP
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-sans text-center">
                            Excellent! {pointsEarnedToday} FP have been credited to your FinWallet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="bg-neutral-500/10 border border-neutral-500/20 rounded-2xl p-4 text-center">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">Already Claimed</span>
                            <div className="text-sm font-bold text-neutral-700 mt-1 font-mono">
                              {getRemainingFlipTime()}
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-sans text-center">
                            Wisdom claimed! TheQuotes card resets every 24 hours. Check back tomorrow.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-mono text-neutral-400">
                      THANK YOU FOR BEING ON THE {PLAN_LABELS[userData?.client?.activePlan || "PREMIUM"].toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Portfolio Valuation (Admin Certified) */}
              {existingClientData && (
                <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-mono text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Certified Portfolio
                        </span>
                        {existingClientData.pan && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            PAN Match: {existingClientData.pan}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 font-clash mt-1">
                        Official Assets Under Management (AUM)
                      </h3>
                      <p className="text-neutral-500 text-xs font-sans">
                        Certified valuation metrics synchronized from official distributor records.
                      </p>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">AUM (Current Value)</span>
                      <div className="text-xl font-bold font-mono text-neutral-900">
                        ₹{(existingClientData.aum || existingClientData.currentValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-4 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">Total Invested</span>
                      <div className="text-xl font-bold font-mono text-neutral-900">
                        ₹{(existingClientData.purchaseValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-4 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">Total Return</span>
                      {(() => {
                        const currentVal = existingClientData.aum || existingClientData.currentValue || 0;
                        const investedVal = existingClientData.purchaseValue || 0;
                        const totalGain = currentVal - investedVal;
                        const totalGainPercent = investedVal > 0 ? (totalGain / investedVal) * 100 : 0;
                        const isProfit = totalGain >= 0;

                        return (
                          <div className={`text-xl font-bold font-mono ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isProfit ? '+' : ''}₹{totalGain.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-[10px] font-sans font-semibold block mt-0.5">
                              ({isProfit ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Scheme Holdings */}
                  {existingClientData.folios && existingClientData.folios.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 font-mono">
                        <Wallet className="w-4 h-4 text-primary" />
                        Mutual Fund Scheme Holdings ({existingClientData.folios.length})
                      </h4>

                      <div className="border border-border/30 bg-white/40 rounded-2xl overflow-hidden font-sans text-xs">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left text-neutral-900">
                            <thead>
                              <tr className="bg-white/60 border-b border-border/20 text-neutral-500 font-bold font-mono text-[9px] uppercase tracking-wider">
                                <th className="px-4 py-3">Scheme / Fund Name</th>
                                <th className="px-4 py-3 text-right">Invested</th>
                                <th className="px-4 py-3 text-right font-sans">Current Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                              {(() => {
                                // Group by scheme name to combine multiple folios under same fund
                                const groupedMap: Record<string, { schemeName: string, invested: number, current: number, units: number }> = {};
                                existingClientData.folios.forEach((f: any) => {
                                  const name = f.schemeName || 'Unknown Scheme';
                                  if (!groupedMap[name]) {
                                    groupedMap[name] = { schemeName: name, invested: 0, current: 0, units: 0 };
                                  }
                                  groupedMap[name].invested += f.purchaseValue || 0;
                                  groupedMap[name].current += f.aum || 0;
                                  groupedMap[name].units += f.units || 0;
                                });

                                return Object.values(groupedMap).map((scheme: any) => {
                                  const profitLossPercent = scheme.invested > 0 ? ((scheme.current - scheme.invested) / scheme.invested) * 100 : 0;
                                  const isProfit = (scheme.current - scheme.invested) >= 0;

                                  return (
                                    <tr key={scheme.schemeName} className="hover:bg-white/20 transition duration-150">
                                      <td className="px-4 py-3.5">
                                        <div className="font-semibold text-neutral-900 leading-snug">
                                          {scheme.schemeName}
                                        </div>
                                        {scheme.units > 0 && (
                                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                            Units: {scheme.units.toLocaleString()}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3.5 text-right font-mono text-neutral-600">
                                        ₹{scheme.invested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3.5 text-right font-mono">
                                        <span className="font-semibold text-neutral-900 mr-2">
                                          ₹{scheme.current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className={`text-[10px] font-sans font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Portfolio Diagnostics Board */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 font-clash">
                      Unlimited Portfolio Diagnostics
                    </h3>
                    <p className="text-neutral-500 text-xs font-sans">
                      Analyze asset diversification and scoring telemetry as many times as you like.
                    </p>
                  </div>
                  {scoreReport && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl border text-xs font-bold font-mono ${getScoreColor(scoreReport.total)}`}>
                        Score: {scoreReport.total}/100
                      </span>
                      <button
                        onClick={() => setViewFullReport(!viewFullReport)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs rounded-xl transition cursor-pointer font-sans"
                      >
                        {viewFullReport ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Score Report breakdown details view (if toggled) */}
                {scoreReport && viewFullReport && (
                  <div className="space-y-6 p-5 bg-white/40 border border-white/20 rounded-2xl animate-in fade-in duration-300 font-sans text-xs">
                    <div className="text-center max-w-sm mx-auto space-y-1">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Diagnostics Level</span>
                      <div className="text-lg font-bold text-neutral-900">{getTagLabel(scoreReport.tag)}</div>
                      <p className="text-[10px] text-neutral-500 leading-normal">{getTagDesc(scoreReport.tag)}</p>
                    </div>

                    {/* Gauges */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">Goal Alignment</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">{scoreReport.goalAlignment}/20</span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(scoreReport.goalAlignment / 20) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">Asset Allocation</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">{scoreReport.assetAlloc}/20</span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(scoreReport.assetAlloc / 20) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">Diversification</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">{scoreReport.diversification}/20</span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(scoreReport.diversification / 20) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">Discipline</span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">{scoreReport.discipline}/20</span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(scoreReport.discipline / 20) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insights list */}
                    {scoreReport.insights.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/20 text-left">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Anomalies Detected</span>
                        <div className="space-y-1.5">
                          {scoreReport.insights.map((insight, idx) => (
                            <div key={idx} className="p-2.5 bg-white border border-border/50 rounded-xl flex items-start gap-2 text-neutral-700 leading-normal text-[11px]">
                              <span className="w-4 h-4 rounded bg-neutral-100 flex items-center justify-center font-mono text-[9px] text-neutral-500 shrink-0 mt-0.5">
                                0{idx + 1}
                              </span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline Tab Selectors */}
                <div className="flex border-b border-border/50">
                  <button
                    onClick={() => { setError(null); setAnalyzeTab("FILE"); }}
                    className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${
                      analyzeTab === "FILE" 
                        ? "border-primary text-neutral-900" 
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    Excel / CSV Upload
                  </button>
                  <button
                    onClick={() => { setError(null); setAnalyzeTab("MANUAL"); }}
                    className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${
                      analyzeTab === "MANUAL" 
                        ? "border-primary text-neutral-900" 
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>

                {/* Tab Content: Upload File */}
                {analyzeTab === "FILE" && (
                  <form onSubmit={handleFileUploadSubmit} className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Telemetry File</span>
                        <button
                          type="button"
                          onClick={downloadCsvTemplate}
                          className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer bg-white/40 border border-border px-2.5 py-1 rounded-lg hover:bg-white/60 transition font-sans"
                        >
                          <Download className="w-3 h-3" />
                          Download Template
                        </button>
                      </div>

                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-neutral-400 bg-white/30 hover:bg-white/50 rounded-2xl transition cursor-pointer p-4 text-center">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => {
                            setError(null);
                            if (e.target.files && e.target.files[0]) {
                              setUploadedFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <div className="space-y-1">
                            <CheckCircle2 className="w-6 h-6 text-primary mx-auto animate-bounce" />
                            <span className="text-xs font-semibold text-neutral-900 block truncate max-w-[250px]">
                              {uploadedFile.name}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono block">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-neutral-500">
                            <FileSpreadsheet className="w-6 h-6 mx-auto stroke-[1.5]" />
                            <span className="text-xs font-semibold block">Click to select CSV/Excel</span>
                            <span className="text-[9px] font-mono block uppercase">xlsx, xls, csv (max 5MB)</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={apiLoading || !uploadedFile}
                      className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
                    >
                      {apiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{statusMsg || "Scoring..."}</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Portfolio</span>
                          <RefreshCw className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Tab Content: Manual Entry */}
                {analyzeTab === "MANUAL" && (
                  <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
                    <div className="overflow-x-auto border border-border/50 rounded-2xl bg-white/30 max-h-64 overflow-y-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-100/50 border-b border-border/50 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                            <th className="p-3">Fund / Asset Name</th>
                            <th className="p-3 font-sans">Type</th>
                            <th className="p-3 font-sans">Start Date</th>
                            <th className="p-3 font-sans">SIP Amt (₹)</th>
                            <th className="p-3 font-sans">Invested (₹)</th>
                            <th className="p-3 font-sans">Current (₹)</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {manualRows.map((row, idx) => (
                            <tr key={idx} className="border-b border-border/30 hover:bg-white/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Mutual Fund"
                                  required
                                  value={row.fundName}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.fundName = e.target.value;
                                    setManualRows(updated);
                                  }}
                                  className="w-full bg-white/60 border border-border rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={row.type}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.type = e.target.value as "SIP" | "LUMPSUM";
                                    setManualRows(updated);
                                  }}
                                  className="bg-white/60 border border-border rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary"
                                >
                                  <option value="SIP">SIP</option>
                                  <option value="LUMPSUM font-sans">Lumpsum</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="date"
                                  required
                                  value={row.startDate}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.startDate = e.target.value;
                                    setManualRows(updated);
                                  }}
                                  className="bg-white/60 border border-border rounded-lg p-1 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  disabled={row.type === "LUMPSUM"}
                                  value={row.sipAmount}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.sipAmount = Number(e.target.value);
                                    setManualRows(updated);
                                  }}
                                  className="w-16 bg-white/60 border border-border rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={row.invested}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.invested = Number(e.target.value);
                                    setManualRows(updated);
                                  }}
                                  className="w-20 bg-white/60 border border-border rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={row.currentValue}
                                  onChange={(e) => {
                                    const updated = [...manualRows];
                                    updated[idx]!.currentValue = Number(e.target.value);
                                    setManualRows(updated);
                                  }}
                                  className="w-20 bg-white/60 border border-border rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </td>
                              <td className="p-2 text-center font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveManualRow(idx)}
                                  disabled={manualRows.length === 1}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAddManualRow}
                        className="py-2.5 px-4 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Row</span>
                      </button>
                      <button
                        type="submit"
                        disabled={apiLoading}
                        className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
                      >
                        {apiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{statusMsg || "Scoring..."}</span>
                          </>
                        ) : (
                          <>
                            <span>Finish & Score</span>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Current Investments / Holdings Card */}
              {activePortfolio && activePortfolio.rows && activePortfolio.rows.length > 0 && (
                <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <h3 className="text-sm font-bold font-clash text-neutral-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      Current Investment Holdings ({activePortfolio.rows.length})
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Uploaded via {activePortfolio.uploadType}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                    Below are the current holdings you submitted during your portfolio assessment.
                  </p>

                  <div className="border border-border/30 bg-white/40 rounded-2xl overflow-hidden font-sans text-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-neutral-900">
                        <thead>
                          <tr className="bg-white/60 border-b border-border/20 text-neutral-500 font-bold font-mono text-[9px] uppercase tracking-wider">
                            <th className="px-4 py-3">Fund Name</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right">Invested</th>
                            <th className="px-4 py-3 text-right">Current Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-sans">
                          {activePortfolio.rows.map((row: any) => (
                            <tr key={row.id} className="hover:bg-white/20 transition duration-150">
                              <td className="px-4 py-3 font-semibold text-neutral-900 truncate max-w-[200px]" title={row.fundName}>
                                {row.fundName}
                              </td>
                              <td className="px-4 py-3 text-neutral-500 font-mono text-[10px]">{row.type}</td>
                              <td className="px-4 py-3 text-right text-neutral-900 font-mono">₹{row.invested.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-neutral-900 font-semibold font-mono">₹{row.currentValue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Success Modal Overlay */}
      {showBookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white/90 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto">
              <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">Call Booked Successfully!</h2>
              <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                Your 1-on-1 premium portfolio review discussion is scheduled. A SEBI-registered distributor will contact you within 24 hours at <strong className="text-neutral-800 font-mono font-medium">{userData?.phone || "your registered number"}</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowBookingSuccess(false)}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer font-sans"
            >
              Back to Client Portal
            </button>
          </div>
        </div>
      )}

      {/* Logout Warning Modal Overlay */}
      {showLogoutWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-neutral-900/10" onClick={() => setShowLogoutWarning(false)} />
          <div className="relative z-[70] bg-white/95 border border-white/40 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 tracking-wide font-clash">Sign Out Warning</h2>
              <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                Are you sure you want to sign out? You will need to log in again to access your premium client workspace, live AUM details, and portfolio telemetry reports.
              </p>
            </div>
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutWarning(false)}
                className="flex-1 py-3 text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl transition duration-200 text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutWarning(false);
                  handleSignOut();
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-12 mt-12 text-center border-t border-neutral-200/50 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left space-y-1.5">
            <span className="font-chillax font-bold text-neutral-800 tracking-wider text-xs uppercase block">Arijit De Partner Network</span>
            <p className="text-neutral-500 text-[10px] font-sans max-w-sm leading-relaxed">
              SEBI Registered Mutual Fund Distributor (ARN-285654). Subject to standard market risks.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>LIVE CLOCK: {currentTime || "00:00:00"}</span>
            </div>
            <span>©2026 FINANALYSIS</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
