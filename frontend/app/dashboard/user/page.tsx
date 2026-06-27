'use client';

import { useEffect, useState } from "react";
import Lenis from "lenis";
import {
  LogOut,
  Layout,
  User,
  Users,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  Compass,
  ShieldAlert,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Download,
  CreditCard,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  FileText,
  Coins
} from "lucide-react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import ChatbotWidget from "@/components/ChatbotWidget";

// ──── Quiz Configuration ────
const GOAL_OPTIONS = [
  { value: "WEALTH_CREATION", label: "Wealth Creation", desc: "Long-term compounding to build a substantial corpus", icon: Sparkles },
  { value: "RETIREMENT", label: "Retirement Planning", desc: "Securing financial independence for your post-work years", icon: ShieldCheck },
  { value: "HOUSE_PURCHASE", label: "House Purchase", desc: "Saving for your dream home", icon: TrendingUp },
  { value: "CHILD_EDUCATION", label: "Child Education", desc: "Building a corpus for your children's education", icon: Calendar },
  { value: "MARRIAGE", label: "Marriage", desc: "Funding an upcoming marriage", icon: Sparkles },
  { value: "PASSIVE_INCOME", label: "Passive Income", desc: "Generate steady returns from your investments", icon: TrendingUp },
  { value: "TAX_SAVING", label: "Tax Saving", desc: "Optimizing investments for tax efficiency", icon: ShieldCheck },
  { value: "NOT_SURE_YET", label: "Not Sure Yet", desc: "Exploring and learning about investment options", icon: Compass },
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

export default function UserDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<{ id: string; name?: string; email?: string; phone?: string; role?: string; walletBalance?: number; createdAt?: string; referralCode?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Flow & State control
  const [dashboardStage, setDashboardStage] = useState<"LOADING" | "QUIZ" | "PAYMENT_CHOICE" | "BOOKING" | "ANALYZE" | "REPORT" | "CLIENT_STATUS">("LOADING");
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Wallet, Session booking and Countdown states
  const [sessions, setSessions] = useState<any[]>([]);
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [slot3, setSlot3] = useState("");
  const [trialTimeLeft, setTrialTimeLeft] = useState("");

  // Phone Modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [anniversaryInput, setAnniversaryInput] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);


  const [currentTime, setCurrentTime] = useState("");

  // Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>("25-35");
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>("");
  const [quizGoal, setQuizGoal] = useState<string>("");
  const [quizInvestmentTenure, setQuizInvestmentTenure] = useState<string>("");
  const [quizIsCompletePortfolio, setQuizIsCompletePortfolio] = useState<boolean | null>(true);
  const [quizInvestmentStyle, setQuizInvestmentStyle] = useState<string>("");
  const [quizExpectedReturn, setQuizExpectedReturn] = useState<string>("");
  const [quizRiskBehavior, setQuizRiskBehavior] = useState<string>("");
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] = useState<string>("");
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>("");
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);

  // DB Identifiers
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  // Booking & availability state variables
  const [bookings, setBookings] = useState<any[]>([]);
  const [freeSlots, setFreeSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  // Analyze Section State
  const [analyzeTab, setAnalyzeTab] = useState<"FILE" | "MANUAL">("FILE");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualRows, setManualRows] = useState<PortfolioRow[]>([
    { fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }
  ]);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Auth Guard & Initial Fetch
  useEffect(() => {
    document.title = "Workspace | FinAnalysis";
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      window.location.href = "/onboarding";
      return;
    }

    try {
      setToken(savedToken);
      setUserData(JSON.parse(savedUser));
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/onboarding";
      return;
    }

    setIsLoaded(true);
  }, []);

  // Clock useEffect
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

  const fetchFreeSlots = async () => {
    try {
      setFetchingSlots(true);
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/leads/availability`, { headers });
      const resData = await res.json();
      setFreeSlots(resData.data || []);
    } catch (err) {
      console.error("Error fetching free slots:", err);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1 || !slot2 || !slot3) {
      setError("Please select all 3 preferred time slots.");
      return;
    }

    // Find the approved Live Consultation payment
    const livePayment = payments.find(
      (p: any) => p.productType === "LIVE_SESSION" && p.status === "APPROVED"
    );

    if (!livePayment) {
      setError("No approved Live Portfolio Review Discussion payment found. Please purchase the Portfolio Review Session first.");
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
        await fetchDashboardState();
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

  // Fetch complete database state for user when token is ready
  useEffect(() => {
    if (!token) return;
    fetchDashboardState();
  }, [token]);

  const fetchDashboardState = async () => {
    try {
      setDashboardStage("LOADING");
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Fetch user profile role updates with clientDate for daily reward check
      const todayISO = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
      const meRes = await fetch(`${backendUrl}/api/auth/me?clientDate=${todayISO}`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/onboarding";
        return;
      }
      const meData = await meRes.json();
      if (!meRes.ok) throw new Error("Auth verify failed");

      const currentRole = meData.data?.role || "GUEST";
      const currentPhone = meData.data?.phone;

      // Update local storage user just in case role changed
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const uObj = JSON.parse(savedUser);
        uObj.role = currentRole;
        uObj.phone = currentPhone;
        uObj.walletBalance = meData.data.walletBalance;
        uObj.referralCode = meData.data.referralCode;
        localStorage.setItem("user", JSON.stringify(uObj));
        setUserData(uObj);
      } else {
        setUserData(meData.data);
      }

      if (!currentPhone) {
        setShowPhoneModal(true);
      } else {
        setShowPhoneModal(false);
      }

      // 2. Fetch payments
      const payRes = await fetch(`${backendUrl}/api/payments/my-payments`, { headers });
      const payData = await payRes.json();
      const userPayments = payData.success ? payData.data : [];
      setPayments(userPayments);

      // Fetch bookings
      const leadsRes = await fetch(`${backendUrl}/api/leads/my-bookings`, { headers });
      const leadsData = await leadsRes.json();
      const userBookings = leadsData.success ? leadsData.data : [];
      setBookings(userBookings);

      // Fetch portfolio review discussions
      const sessionsRes = await fetch(`${backendUrl}/api/leads/my-sessions`, { headers });
      const sessionsData = await sessionsRes.json();
      const userSessions = sessionsData.success ? sessionsData.data : [];
      setSessions(userSessions);

      // If user is already approved CLIENT or has pending payment, show the status panel
      const hasPendingOrApproved = currentRole === "CLIENT" || userPayments.some((p: any) => p.status === "PENDING" || p.status === "APPROVED");

      // 3. Fetch assessments
      const assessRes = await fetch(`${backendUrl}/api/assess`, { headers });
      const assessData = await assessRes.json();
      const userAssessments = assessData.success ? assessData.data : [];

      if (userAssessments.length === 0) {
        setDashboardStage("QUIZ");
        return;
      }

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

      // Routing checks based on payment
      const validPayments = userPayments.filter((p: any) => p.status === "PENDING" || p.status === "APPROVED");
      const hasPaidAI = validPayments.some((p: any) => p.productType === "AI_ANALYSIS" || p.amount === 249 || p.amount === 0);
      const hasPaidLive = validPayments.some((p: any) => p.productType === "LIVE_SESSION" || p.amount === 499 || p.amount === 300 || p.amount === 699);

      if (!hasPaidAI && !hasPaidLive) {
        setDashboardStage("PAYMENT_CHOICE");
        return;
      }

      // If they paid for Live Consultation, check if they have scheduled their slots
      if (hasPaidLive) {
        const liveSession = userSessions.find((s: any) => s.payment?.status === "APPROVED" || s.payment?.productType === "LIVE_SESSION");
        // Check if preferredSlot1 is Unix epoch (value is 0) to know if they haven't scheduled yet
        const hasScheduled = liveSession && new Date(liveSession.preferredSlot1).getTime() > 0;
        if (liveSession && !hasScheduled) {
          setDashboardStage("BOOKING");
          return;
        }
      }

      // 4. Fetch portfolios
      const portRes = await fetch(`${backendUrl}/api/portfolio`, { headers });
      const portData = await portRes.json();
      const userPortfolios = portData.success ? portData.data : [];

      if (userPortfolios.length === 0) {
        setDashboardStage("ANALYZE");
        return;
      }

      const latestPortfolio = userPortfolios[0];
      setActivePortfolioId(latestPortfolio.id);

      if (latestPortfolio.score) {
        setScoreReport(latestPortfolio.score);
        if (hasPendingOrApproved) {
          setDashboardStage("CLIENT_STATUS");
        } else {
          setDashboardStage("REPORT");
        }
      } else {
        // Portfolio uploaded but not scored yet, score it now
        setDashboardStage("LOADING");
        setStatusMsg("Calculating portfolio scores...");
        await calculatePortfolioScore(latestPortfolio.id);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Please try again.");
      setDashboardStage("QUIZ");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/onboarding";
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim().length < 10) {
      setModalError("Phone number must be at least 10 digits.");
      return;
    }
    if (!dobInput) {
      setModalError("Date of birth is mandatory.");
      return;
    }
    const selectedDob = new Date(dobInput);
    if (selectedDob > new Date()) {
      setModalError("Date of birth cannot be in the future.");
      return;
    }
    if (anniversaryInput) {
      const selectedAnniversary = new Date(anniversaryInput);
      if (selectedAnniversary > new Date()) {
        setModalError("Anniversary date cannot be in the future.");
        return;
      }
    }

    setModalError(null);
    setModalSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          phone: phoneInput.trim(),
          dob: dobInput,
          anniversary: anniversaryInput || null
        })
      });
      const data = await res.json();

      if (data.success) {
        // Update local user details
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const uObj = JSON.parse(savedUser);
          uObj.phone = data.data.phone;
          uObj.dob = data.data.dob;
          uObj.anniversary = data.data.anniversary;
          localStorage.setItem("user", JSON.stringify(uObj));
          setUserData(uObj);
        }
        setShowPhoneModal(false);
        // Refresh state
        await fetchDashboardState();
      } else {
        setModalError(data.error || "Failed to update details.");
      }
    } catch (err) {
      setModalError("Network error. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleInitiatePayment = async (productType: "AI_ANALYSIS" | "LIVE_SESSION") => {
    setError(null);
    setApiLoading(true);
    setStatusMsg("Initializing checkout order...");

    try {
      const res = await fetch(`${backendUrl}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productType })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to initialize checkout.");
        setApiLoading(false);
        return;
      }

      const checkoutData = data.data;

      if (checkoutData.zeroPayable) {
        setStatusMsg("Payment covered! Processing instant activation...");
        alert("Payment successful (covered by Wallet/Free trial)!");
        await fetchDashboardState();
        setApiLoading(false);
        return;
      }

      if (checkoutData.isMock) {
        setStatusMsg("Mock payment mode. Simulating success...");
        // Auto-confirm mock payment
        const confirmRes = await fetch(`${backendUrl}/api/payments/mock-confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpayOrderId: checkoutData.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`
          })
        });
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          alert(`Mock payment successful! Paid: ₹${checkoutData.amount}`);
          await fetchDashboardState();
        } else {
          setError(confirmData.error || "Mock payment confirmation failed.");
        }
        setApiLoading(false);
        return;
      }

      // Normal Razorpay payment
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amount * 100, // paise
          currency: "INR",
          name: "FinAnalysis",
          description: productType === "AI_ANALYSIS" ? "AI Portfolio Health Report" : "Live Portfolio Review Discussion",
          order_id: checkoutData.orderId,
          handler: async function (response: any) {
            setStatusMsg("Verifying your payment...");
            alert("Payment successful! Processing verification...");
            await fetchDashboardState();
          },
          prefill: {
            name: userData?.name || "",
            email: userData?.email || "",
            contact: userData?.phone || ""
          },
          theme: {
            color: "#8A5CFF"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setError("Razorpay SDK not loaded. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error during payment initialization.");
    } finally {
      setApiLoading(false);
    }
  };



  // Submit Assessment Quiz (Stage 1)
  const handleQuizSubmit = async () => {
    if (!quizAgeRange || !quizGoal || !quizLifeStage || !quizInvestmentTenure || !quizMonthlyInvestment || !quizEmergencyFund) {
      setError("Please complete all assessment fields.");
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Registering your financial profile...");

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
        await fetchDashboardState();
      } else {
        setError(resData.error || "Failed to submit assessment");
      }
    } catch (err) {
      setError("Could not submit assessment. Verify network connection.");
    } finally {
      setApiLoading(false);
    }
  };

  // Download CSV Template
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

  // Submit Excel File Upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (!activeAssessmentId) {
      setError("Assessment context missing. Please re-run assessment.");
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg("Uploading investment document...");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("assessmentId", activeAssessmentId);

      const res = await fetch(`${backendUrl}/api/portfolio/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg("Analyzing asset allocation and discipline...");
        await calculatePortfolioScore(pId);
      } else {
        setError(data.error || "Failed to process Excel upload.");
      }
    } catch (err) {
      setError("Network error while uploading file.");
    } finally {
      setApiLoading(false);
    }
  };

  // Manual Portfolio Entry management
  const handleAddManualRow = () => {
    if (manualRows.length >= 15) {
      setError("Maximum of 15 rows allowed.");
      return;
    }
    setManualRows([...manualRows, { fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }]);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualRows.length === 1) return;
    const newRows = [...manualRows];
    newRows.splice(index, 1);
    setManualRows(newRows);
  };

  const handleManualRowChange = (index: number, field: keyof PortfolioRow, value: any) => {
    const newRows = [...manualRows];
    const row = { ...newRows[index]! };

    if (field === "type") {
      row.type = value;
      if (value === "LUMPSUM") {
        row.sipAmount = 0;
      }
    } else if (field === "sipAmount" || field === "invested" || field === "currentValue") {
      row[field] = Number(value);
    } else {
      row[field] = value;
    }

    newRows[index] = row;
    setManualRows(newRows);
  };

  // Submit Manual Entry (Stage 2 Tab 2)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentId) {
      setError("Assessment context missing.");
      return;
    }

    // Validate rows
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
      } else {
        setError(data.error || "Failed to submit manual portfolio");
      }
    } catch (err) {
      setError("Network error while submitting details.");
    } finally {
      setApiLoading(false);
    }
  };

  // Run Score Engine API Call
  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/score/${portfolioId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setScoreReport(data.data);
        // Refresh full dashboard state to capture payments / updated roles
        await fetchDashboardState();
      } else {
        setError(data.error || "Failed to score portfolio.");
        setDashboardStage("ANALYZE");
      }
    } catch (err) {
      setError("Network error running score calculation.");
      setDashboardStage("ANALYZE");
    } finally {
      setApiLoading(false);
    }
  };

  // Helper score color tagging
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

  const isAdvisorScan = payments.some((p: any) => p.amount === 499 && (p.status === "PENDING" || p.status === "APPROVED"));

  return (
    <main className="w-full min-h-screen bg-transparent text-neutral-900 flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#F2F0EF] bg-[radial-gradient(circle_at_bottom,rgba(147,197,253,0.95)_0%,rgba(186,230,253,0.65)_45%,rgba(242,240,239,0)_85%)]">
        <SoftBoxBlurBg />
      </div>

      {/* Floating header */}
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
            <Layout className="w-5 h-5 text-primary" />
            <span className="font-chillax font-bold tracking-wider text-sm uppercase">FinAnalysis Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userData && (
            <>
              {/* Wallet Balance Display */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-sm hover:scale-[1.02] transition duration-200">
                <Coins className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Wallet: ₹{userData.walletBalance?.toFixed(2) || "0.00"}</span>
              </div>
              {/* Referral Code Pill */}
              {userData.referralCode && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 font-mono">
                  <span>Code: {userData.referralCode}</span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{userData.name || userData.email}</span>
              </div>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center relative z-10">

        {/* Global Error Banner */}
        {error && (
          <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Operation failed</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-neutral-900 font-bold ml-2">×</button>
          </div>
        )}

        {/* Trial Countdown Banner */}
        {userData?.createdAt && !payments.some((p: any) => p.status === "APPROVED") && (
          (() => {
            const createdTime = new Date(userData.createdAt).getTime();
            const isFirstWeek = (Date.now() - createdTime) <= 7 * 24 * 60 * 60 * 1000;
            if (!isFirstWeek) return null;
            return (
              <div className="w-full max-w-4xl mb-8 p-6 bg-gradient-to-r from-violet-500/10 via-primary/5 to-emerald-500/10 border border-primary/20 backdrop-blur-md rounded-3xl text-xs flex flex-col sm:flex-row justify-between items-center gap-4 text-left font-sans animate-in fade-in duration-300">
                <div className="flex gap-3 items-start">
                  <span className="p-2 bg-primary/10 rounded-xl text-primary animate-pulse shrink-0 mt-0.5">
                    🎁
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-neutral-900 block mb-1">First-Week Special Offer Active!</span>
                    <span className="text-neutral-600 leading-relaxed font-medium">
                      As a new user (registered on {new Date(userData.createdAt).toLocaleDateString()}), you get exclusive discounted rates! 
                      <strong className="text-emerald-700 ml-1">AI Portfolio Health Report is FREE</strong> (usually ₹299) and 
                      <strong className="text-primary ml-1">Live 1-on-1 Portfolio Review Discussion is ₹300</strong> (usually ₹699).
                    </span>
                  </div>
                </div>
                {trialTimeLeft && (
                  <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white/60 border border-primary/10 rounded-2xl min-w-[150px] shadow-sm">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Time Remaining</span>
                    <span className="text-sm font-bold font-mono text-primary mt-0.5">{trialTimeLeft}</span>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* ----------------- STAGE 0: LOADING SCREEN ----------------- */}
        {dashboardStage === "LOADING" && (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin stroke-[1.5] mb-6" />
            <h3 className="text-lg font-medium text-neutral-900">Please Wait</h3>
            <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
              {statusMsg || "We are querying database clusters to build your investment cockpit."}
            </p>
          </div>
        )}

        {/* ----------------- STAGE 1: ASSESSMENT QUIZ (5 Steps) ----------------- */}
        {dashboardStage === "QUIZ" && (
          <div className="w-full max-w-md bg-white/30 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Step header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
              <span>Stage 01: Profile Assessment</span>
              <span>Step {quizStep} of 5</span>
            </div>

            {/* Step 1: Life Stage */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Which best describes your current stage?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Context and financial capacity.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {LIFE_STAGE_OPTIONS.map((opt) => {
                    const isSelected = quizLifeStage === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizLifeStage(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected
                          ? "bg-primary/10 border-primary text-neutral-900"
                          : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    if (!quizLifeStage) { setError("Please select your life stage."); return; }
                    setError(null);
                    setQuizStep(2);
                  }}
                  className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2: Investment Goal */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">What is the primary reason you&apos;re investing?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Goal alignment score.
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 select-none custom-scrollbar">
                  {GOAL_OPTIONS.map((goal) => {
                    const IconComponent = goal.icon;
                    const isSelected = quizGoal === goal.value;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => {
                          setQuizGoal(goal.value);
                          if (goal.value === "NOT_SURE_YET") {
                            setShowNotSureMessage(true);
                          } else {
                            setShowNotSureMessage(false);
                          }
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex items-start gap-4 cursor-pointer ${isSelected
                            ? "bg-primary/10 border-primary text-neutral-900"
                            : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900"
                          }`}
                      >
                        <div className={`p-2 rounded-xl border mt-0.5 ${isSelected ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/50 border-border text-neutral-500"
                          }`}>
                          <IconComponent className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold block">{goal.label}</span>
                          <span className="text-[10px] text-neutral-500 block font-sans mt-0.5 leading-relaxed">{goal.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Special "Not Sure Yet" motivational message */}
                {showNotSureMessage && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-sans leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="font-bold block mb-1">💡 You&apos;re not alone!</span>
                    More than 60% of investors start investing without a clearly defined goal. Let&apos;s help identify one through your portfolio health report.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizGoal) { setError("Please choose an investment goal."); return; }
                      setError(null);
                      setQuizStep(3);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Investment Tenure */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">When do you expect to use this money?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Tenure matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {INVESTMENT_TENURE_OPTIONS.map((opt) => {
                    const isSelected = quizInvestmentTenure === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizInvestmentTenure(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected
                          ? "bg-primary/10 border-primary text-neutral-900"
                          : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(2)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizInvestmentTenure) { setError("Please select your investment tenure."); return; }
                      setError(null);
                      setQuizStep(4);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Monthly Investment */}
            {quizStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Approximately how much are you able to invest every month?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Investment capacity profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {MONTHLY_INVESTMENT_OPTIONS.map((opt) => {
                    const isSelected = quizMonthlyInvestment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizMonthlyInvestment(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected
                          ? "bg-primary/10 border-primary text-neutral-900"
                          : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(3)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizMonthlyInvestment) { setError("Please select your monthly investment amount."); return; }
                      setError(null);
                      setQuizStep(5);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Emergency Fund */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Do you have an emergency fund?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Safety reserves check.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {EMERGENCY_FUND_OPTIONS.map((opt) => {
                    const isSelected = quizEmergencyFund === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizEmergencyFund(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected
                          ? "bg-primary/10 border-primary text-neutral-900"
                          : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setQuizStep(4)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={apiLoading || !quizEmergencyFund}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {apiLoading ? "Submitting..." : "Finish & Score"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {dashboardStage === "PAYMENT_CHOICE" && (
          (() => {
            const createdTime = userData?.createdAt ? new Date(userData.createdAt).getTime() : 0;
            const isFirstWeek = userData?.createdAt ? (Date.now() - createdTime) <= 7 * 24 * 60 * 60 * 1000 : false;
            
            const walletBalance = userData?.walletBalance || 0;
            
            // Product 1: AI Model Scan
            const aiBase = isFirstWeek ? 0 : 299;
            const aiWalletUse = Math.min(walletBalance, aiBase);
            const aiFinal = aiBase - aiWalletUse;

            // Product 2: Live Portfolio Review Discussion
            const liveBase = isFirstWeek ? 300 : 699;
            const liveWalletUse = Math.min(walletBalance, liveBase);
            const liveFinal = liveBase - liveWalletUse;

            return (
              <div className="w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in duration-500">
                <div className="text-center max-w-2xl space-y-3">
                  <span className="text-[10px] font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                    Unlock Your Advanced Scan
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-clash text-neutral-900 tracking-tight leading-none">
                    Choose Your Scanning Method
                  </h1>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Take the next step to analyze your mutual fund portfolio. Select AI-driven automated analysis or 1-on-1 distributor review.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  
                  {/* Option A: AI Model Scan */}
                  <div className="border border-neutral-200 bg-white/40 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between hover:border-primary/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-300"></div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="p-3 bg-primary/10 rounded-2xl">
                          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                        </span>
                        <span className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full">
                          Automated ML
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-clash text-neutral-900">Advanced AI ML Scan</h2>
                        <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                          Instant evaluation using our proprietary ML model. Uncovers asset allocations, overlap insights, and performance benchmarks instantly.
                        </p>
                      </div>

                      <ul className="space-y-3 text-xs text-neutral-600 font-sans border-t border-neutral-100 pt-6">
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Instant upload & processing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>AI Diversification & Asset Allocation breakdown</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Cost-efficient self-service portal</span>
                        </li>
                        {isFirstWeek && (
                          <li className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                            <span>✨ Free for first 7 days!</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-4">
                      {walletBalance > 0 && aiBase > 0 && (
                        <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
                          <span>Wallet Balance:</span>
                          <span>-₹{aiWalletUse.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-neutral-400 line-through block font-mono">₹999</span>
                          {aiWalletUse > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 line-through text-xs font-mono">₹{aiBase}</span>
                              <span className="text-3xl font-bold text-neutral-900 font-chillax">₹{aiFinal}</span>
                            </div>
                          ) : (
                            <span className="text-3xl font-bold text-neutral-900 font-chillax">₹{aiBase}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleInitiatePayment("AI_ANALYSIS")}
                          disabled={apiLoading}
                          className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                        >
                          Select AI Scan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option B: Trusted Distributor Scan */}
                  <div className="border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between hover:border-primary/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/25 transition-all duration-300"></div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="p-3 bg-primary/10 rounded-2xl">
                          <Users className="w-6 h-6 text-primary" />
                        </span>
                        <span className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full">
                          Human Distributor
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-clash text-neutral-900">Distributor Consult</h2>
                        <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                          1-on-1 session with SEBI registered distributor Arijit De. In-depth custom roadmap, tax restructuring advice, and active rebalancing strategy.
                        </p>
                      </div>

                      <ul className="space-y-3 text-xs text-neutral-600 font-sans border-t border-neutral-100 pt-6">
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Live 1-on-1 strategy video consultation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Tax optimization & restructuring audit</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Direct Q&A session with Arijit De</span>
                        </li>
                        {isFirstWeek && (
                          <li className="flex items-center gap-2 text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
                            <span>✨ Week 1 Special Promo Rate!</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-4">
                      {walletBalance > 0 && (
                        <div className="flex justify-between items-center text-xs font-sans text-neutral-500">
                          <span>Wallet Balance:</span>
                          <span>-₹{liveWalletUse.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-neutral-400 line-through block font-mono">₹1,999</span>
                          {liveWalletUse > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 line-through text-xs font-mono">₹{liveBase}</span>
                              <span className="text-3xl font-bold text-neutral-900 font-chillax">₹{liveFinal}</span>
                            </div>
                          ) : (
                            <span className="text-3xl font-bold text-neutral-900 font-chillax">₹{liveBase}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleInitiatePayment("LIVE_SESSION")}
                          disabled={apiLoading}
                          className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                        >
                          Select Distributor Scan
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Prominent Trust Refund Policy Banner */}
                <div className="w-full p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-xs text-blue-700 font-sans leading-relaxed text-center max-w-2xl flex flex-col sm:flex-row items-center justify-center gap-3">
                  <span className="text-lg">🛡️</span>
                  <span>
                    <strong>We value your trust.</strong> If your scheduled session does not happen for any reason, you will receive a full refund within 24 hours. No questions asked.
                  </span>
                </div>
              </div>
            );
          })()
        )}

        {/* ----------------- STAGE 1.7: DISTRIBUTOR BOOKING CALENDAR ----------------- */}
        {dashboardStage === "BOOKING" && (
          <div className="w-full max-w-xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 text-left">
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
        )}

        {/* ----------------- STAGE 2: ANALYZE PORTFOLIO ----------------- */}
        {dashboardStage === "ANALYZE" && (
          <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in duration-400">
            {/* Distributor Booking Confirmation Alert */}
            {bookings.some((b: any) => b.slot !== null) && (
              <div className="w-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-3xl p-6 flex items-start gap-4 text-left animate-in fade-in duration-300">
                <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900">Distributor Consultation Booked!</h4>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Your 1-on-1 strategy call with distributor Arijit De is scheduled for{" "}
                    <strong className="text-neutral-900 font-semibold font-mono">
                      {new Date(bookings.find((b: any) => b.slot !== null).slot).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong>. We will reach out to you at <span className="font-semibold font-mono">{bookings.find((b: any) => b.slot !== null).phone}</span>.
                  </p>
                </div>
              </div>
            )}
            {/* Context Profile Header */}
            <div className="w-full p-6 bg-white/30 border border-white/30 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Financial Profile</span>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-neutral-900 font-medium">Age: {AGE_RANGE_OPTIONS.find(o => o.value === quizAgeRange)?.label || quizAge}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-900 font-medium">Goal: {GOAL_OPTIONS.find(o => o.value === quizGoal)?.label || quizGoal}</span>
                  {quizLifeStage && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">Stage: {LIFE_STAGE_OPTIONS.find(o => o.value === quizLifeStage)?.label || quizLifeStage}</span>
                    </>
                  )}
                  {quizInvestmentTenure && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">Horizon: {INVESTMENT_TENURE_OPTIONS.find(o => o.value === quizInvestmentTenure)?.label || quizInvestmentTenure}</span>
                    </>
                  )}
                  {quizMonthlyInvestment && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">Monthly: {MONTHLY_INVESTMENT_OPTIONS.find(o => o.value === quizMonthlyInvestment)?.label || quizMonthlyInvestment}</span>
                    </>
                  )}
                  {quizEmergencyFund && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">Emergency Fund: {EMERGENCY_FUND_OPTIONS.find(o => o.value === quizEmergencyFund)?.label || quizEmergencyFund}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setQuizStep(1);
                  setDashboardStage("QUIZ");
                }}
                className="text-[10px] font-mono text-primary hover:underline cursor-pointer border border-primary/20 bg-primary/5 px-3 py-1 rounded-lg hover:bg-primary/10 transition"
              >
                Re-assess profile
              </button>
            </div>

            {isAdvisorScan ? (
              /* Premium glassmorphic Consultation Cockpit */
              <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/35 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col gap-8 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200/50 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      Exclusive Client Portal
                    </span>
                    <h2 className="text-3xl font-bold font-clash text-neutral-900 mt-3">Your Roadmap is Being Prepared</h2>
                    <p className="text-neutral-600 text-xs font-sans leading-relaxed max-w-lg">
                      You are in safe hands. Sebi-registered distributor Arijit De is currently analyzing your active financial profile parameters to prepare a tailormade strategy.
                    </p>
                  </div>
                  <div className="bg-white/60 border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm shrink-0 min-w-[160px]">
                    <Clock className="w-6 h-6 text-primary mb-2 stroke-[1.5]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">Session Type</span>
                    <span className="text-xs font-semibold text-neutral-800 mt-0.5">1-on-1 Video Call</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase font-mono">Next Steps Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Step 1 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">1. Synchronize Assessment</h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Your risk preference and investment goals were captured and stored securely in the database.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">2. Distributor Telemetry Audit</h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Arijit De will audit your selected age limits, expectations, and risk thresholds prior to the consultation call.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-neutral-100 rounded-xl text-neutral-500 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">3. Live 1-on-1 Consultation</h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Join the strategy review call at your scheduled time to design a custom asset allocation and select top-performing funds.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-neutral-100 rounded-xl text-neutral-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">4. Tailored Action Roadmap</h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Receive your personalized action PDF detailing restructuring directions, tax optimizations, and rebalancing guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-sans font-medium text-neutral-600">
                      Distributor Review status: <strong className="text-emerald-700 font-semibold font-mono">Assigned & Preparing</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Analysis Header */}
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900">Analyze Investments</h1>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Provide your current investment details. We'll run them through our scoring algorithm and flag any structural errors or anomalies.
                  </p>
                </div>

                {/* Form Section */}
                <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
                  {/* Tab Selector */}
                  <div className="flex border-b border-border mb-8">
                    <button
                      onClick={() => { setError(null); setAnalyzeTab("FILE"); }}
                      className={`pb-4 px-6 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${analyzeTab === "FILE"
                          ? "border-primary text-neutral-900"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                      Excel / CSV Upload
                    </button>
                    <button
                      onClick={() => { setError(null); setAnalyzeTab("MANUAL"); }}
                      className={`pb-4 px-6 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${analyzeTab === "MANUAL"
                          ? "border-primary text-neutral-900"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                    >
                      Manual Entry
                    </button>
                  </div>

                  {/* Tab 1: File Uploader */}
                  {analyzeTab === "FILE" && (
                    <form onSubmit={handleFileUploadSubmit} className="space-y-6">
                      <div className="space-y-3 text-left">
                        <div className="flex justify-between items-end">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">Portfolio Data File</label>
                          <button
                            type="button"
                            onClick={downloadCsvTemplate}
                            className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer bg-white/40 border border-border px-2.5 py-1 rounded-lg hover:bg-white/60 transition"
                          >
                            <Download className="w-3 h-3" />
                            Download Template CSV
                          </button>
                        </div>

                        {/* Drag & Drop uploader area */}
                        <div
                          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition duration-200 bg-white/20 ${uploadedFile
                              ? "border-primary bg-primary/[0.01]"
                              : "border-border hover:border-neutral-300"
                            }`}
                        >
                          <input
                            type="file"
                            accept=".xlsx,.csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setUploadedFile(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition ${uploadedFile ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/40 border border-border text-neutral-500"
                            }`}>
                            {uploadedFile ? <CheckCircle2 className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5 stroke-[1.5]" />}
                          </div>

                          {uploadedFile ? (
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-neutral-900 block">{uploadedFile.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono block">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-neutral-700 block">Click or Drag Excel/CSV file to upload</span>
                              <span className="text-[10px] text-neutral-500 block leading-relaxed font-sans mt-1">
                                Supported: .xlsx, .csv (Must contain exactly 6 columns in matching template order)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={apiLoading || !uploadedFile}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                      >
                        {apiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{statusMsg || "Processing file..."}</span>
                          </>
                        ) : (
                          <>
                            <span>Analyze Uploaded Portfolio</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Tab 2: Manual Entry Form */}
                  {analyzeTab === "MANUAL" && (
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                      <div className="overflow-x-auto select-text">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-border text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                              <th className="py-3 px-2 font-normal">Fund / Asset Name</th>
                              <th className="py-3 px-2 font-normal w-[100px]">Type</th>
                              <th className="py-3 px-2 font-normal w-[120px]">Start Date</th>
                              <th className="py-3 px-2 font-normal w-[110px]">Monthly SIP</th>
                              <th className="py-3 px-2 font-normal w-[110px]">Total Invested</th>
                              <th className="py-3 px-2 font-normal w-[110px]">Current Value</th>
                              <th className="py-3 px-1 font-normal w-[40px]"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {manualRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-border/40 hover:bg-white/20">
                                <td className="py-2.5 px-2">
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Parag Parikh Flexi"
                                    value={row.fundName}
                                    onChange={(e) => handleManualRowChange(idx, "fundName", e.target.value)}
                                    className="w-full bg-white/40 border border-border focus:border-primary focus:bg-white/60 rounded-lg p-2 text-neutral-900 font-sans text-xs focus:outline-none placeholder-neutral-400"
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <select
                                    value={row.type}
                                    onChange={(e) => handleManualRowChange(idx, "type", e.target.value)}
                                    className="w-full bg-white/40 border border-border rounded-lg p-2 text-neutral-900 font-sans text-xs focus:outline-none"
                                  >
                                    <option className="bg-white text-neutral-900" value="SIP">SIP</option>
                                    <option className="bg-white text-neutral-900" value="LUMPSUM">Lumpsum</option>
                                  </select>
                                </td>
                                <td className="py-2.5 px-2">
                                  <input
                                    type="date"
                                    required
                                    value={row.startDate}
                                    onChange={(e) => handleManualRowChange(idx, "startDate", e.target.value)}
                                    className="w-full bg-white/40 border border-border rounded-lg p-1.5 text-neutral-900 font-sans text-xs focus:outline-none"
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <input
                                    type="number"
                                    required
                                    min={0}
                                    disabled={row.type === "LUMPSUM"}
                                    value={row.sipAmount || ""}
                                    onChange={(e) => handleManualRowChange(idx, "sipAmount", e.target.value)}
                                    className="w-full bg-white/40 border border-border disabled:opacity-40 rounded-lg p-2 text-neutral-900 font-mono text-xs focus:outline-none text-right"
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    value={row.invested || ""}
                                    onChange={(e) => handleManualRowChange(idx, "invested", e.target.value)}
                                    className="w-full bg-white/40 border border-border rounded-lg p-2 text-neutral-900 font-mono text-xs focus:outline-none text-right"
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    value={row.currentValue || ""}
                                    onChange={(e) => handleManualRowChange(idx, "currentValue", e.target.value)}
                                    className="w-full bg-white/40 border border-border rounded-lg p-2 text-neutral-900 font-mono text-xs focus:outline-none text-right"
                                  />
                                </td>
                                <td className="py-2.5 px-1 text-center">
                                  {manualRows.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveManualRow(idx)}
                                      className="text-neutral-400 hover:text-red-600 p-1 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                        <button
                          type="button"
                          onClick={handleAddManualRow}
                          className="py-2.5 px-4 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer self-start"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Investment Row
                        </button>
                        <span className="text-[10px] text-neutral-500 font-mono self-end">
                          {manualRows.length} of 15 Max Rows
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={apiLoading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                      >
                        {apiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{statusMsg || "Creating analysis profile..."}</span>
                          </>
                        ) : (
                          <>
                            <span>Validate & Analyze Investments</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ----------------- STAGE 3: SCORE REPORT & CTA ----------------- */}
        {dashboardStage === "REPORT" && scoreReport && (
          <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-500 select-text">

            {/* Top Score Title */}
            <div className="text-center max-w-lg mx-auto space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900">Your Evaluation Scorecard</h1>
              <p className="text-neutral-500 text-xs font-sans">
                Below is the core assessment breakdown computed from your portfolio's raw telemetry.
              </p>
            </div>

            {/* Score Summary Grid (Main radial gauge + badge callout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

              {/* Left Column: Overall Gauge */}
              <div className="md:col-span-5 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6">COMPREHENSIVE RATING</span>

                {/* SVG Circular Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke="rgba(0,0,0,0.05)"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke={getScoreStroke(scoreReport.total)}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={427}
                      strokeDashoffset={427 - (427 * scoreReport.total) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-neutral-900">
                    <span className="text-5xl font-semibold font-chillax leading-none">{scoreReport.total}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">/ 100</span>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getScoreColor(scoreReport.total)}`}>
                  {getTagLabel(scoreReport.tag)}
                </div>
              </div>

              {/* Right Column: Breakdown & Description */}
              <div className="md:col-span-7 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">METRIC TELEMETRY BREAKDOWN</span>
                  <h3 className="text-xl font-semibold text-neutral-900 tracking-wide">{getTagLabel(scoreReport.tag)}</h3>
                  <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                    {getTagDesc(scoreReport.tag)}
                  </p>
                </div>

                {/* Horizontal Progress Bars */}
                <div className="space-y-4.5 mt-8 md:mt-0">

                  {/* Goal Alignment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Goal Alignment</span>
                      <span className="text-neutral-800 font-mono">{scoreReport.goalAlignment} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.goalAlignment / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Asset Allocation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Asset Allocation</span>
                      <span className="text-neutral-800 font-mono">{scoreReport.assetAlloc} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8a5cff] rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.assetAlloc / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Diversification */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Diversification</span>
                      <span className="text-neutral-800 font-mono">{scoreReport.diversification} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.diversification / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Discipline */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">SIP Discipline</span>
                      <span className="text-neutral-800 font-mono">{scoreReport.discipline} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.discipline / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Cost Efficiency</span>
                      <span className="text-neutral-800 font-mono">{scoreReport.efficiency} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.efficiency / 20) * 100}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Insights Section */}
            <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-2xl">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Generated Anomaly Insights
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scoreReport.insights.map((insight, idx) => (
                  <div key={idx} className="p-5 bg-white/40 border border-white/30 rounded-2xl flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg border border-border bg-white/60 flex items-center justify-center text-xs font-mono text-neutral-500 mt-0.5 shrink-0">
                      0{idx + 1}
                    </div>
                    <p className="text-neutral-800 text-xs leading-relaxed font-sans text-left">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Box: Book Call */}
            {!(userData?.role === "CLIENT" || payments.some((p: any) => p.status === "PENDING" || p.status === "APPROVED")) && (
              (() => {
                const createdTime = userData?.createdAt ? new Date(userData.createdAt).getTime() : 0;
                const isFirstWeek = userData?.createdAt ? (Date.now() - createdTime) <= 7 * 24 * 60 * 60 * 1000 : false;
                const liveBase = isFirstWeek ? 300 : 699;
                const walletBalance = userData?.walletBalance || 0;
                const liveWalletUse = Math.min(walletBalance, liveBase);
                const liveFinal = liveBase - liveWalletUse;

                return (
                  <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="space-y-4 max-w-xl text-left">
                      <span className="text-[10px] font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                        Premium Distributor Consulting
                      </span>
                      <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-wide">Detailed Distribution Optimization Session</h2>
                      <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                        Book your 1-on-1 strategy call with our SEBI-registered distributor Arijit De. Get a comprehensive optimization roadmap, personalized tax restructuring report, and active rebalancing insights based on your score.
                      </p>
                      <div className="flex gap-6 items-center text-neutral-500 text-xs font-sans pt-1">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>SEBI MFD Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Includes Detailed PDF</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/40 border border-white/30 rounded-2xl md:min-w-[240px] text-center">
                      <div className="text-[10px] font-mono text-neutral-400 line-through">₹1,999</div>
                      {liveWalletUse > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-neutral-400 line-through font-mono">₹{liveBase}</span>
                          <div className="text-4xl font-semibold font-chillax text-neutral-900 mt-1">₹{liveFinal}</div>
                          <span className="text-[10px] text-emerald-600 font-mono">(-₹{liveWalletUse} wallet)</span>
                        </div>
                      ) : (
                        <div className="text-4xl font-semibold font-chillax text-neutral-900 mt-1">₹{liveBase}</div>
                      )}
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">One-time booking fee</span>

                      <button
                        onClick={() => handleInitiatePayment("LIVE_SESSION")}
                        disabled={apiLoading}
                        className="w-full mt-6 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                      >
                        {apiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Pay & Book Call</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()
            )}

          </div>
        )}

        {/* ----------------- STAGE 4: CLIENT STATUS SCREEN ----------------- */}
        {dashboardStage === "CLIENT_STATUS" && (
          <div className="w-full max-w-xl bg-white/30 border border-white/30 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 backdrop-blur-xl">
            {/* Determine Status */}
            {userData?.role === "CLIENT" ? (
              // Case A: Approved PREMIUM Client
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto mb-2">
                  <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Workspace Activated</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Welcome to the Premium Client Portal! Your 1-on-1 portfolio review discussion booking has been verified.
                  </p>
                </div>

                {sessions.length > 0 ? (
                  <div className="p-5 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                    <h3 className="font-semibold text-neutral-800 text-sm border-b border-neutral-100 pb-2 flex items-center justify-between">
                      <span>Live Consult Booking</span>
                      <span className={`px-2 py-0.5 rounded text-white font-mono text-[9px] font-bold ${
                        sessions[0].status === "CONFIRMED" ? "bg-emerald-600 animate-pulse" :
                        sessions[0].status === "COMPLETED" ? "bg-blue-600" :
                        sessions[0].status === "REFUNDED" ? "bg-red-600" : "bg-amber-600"
                      }`}>
                        {sessions[0].status}
                      </span>
                    </h3>

                    {sessions[0].status === "CONFIRMED" && sessions[0].confirmedSlot ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1 text-emerald-800 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                          <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">Confirmed Time:</span>
                          <span className="text-xs font-mono">{new Date(sessions[0].confirmedSlot).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                        </div>
                        {sessions[0].googleMeetLink && (
                          <a
                            href={sessions[0].googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold rounded-xl transition duration-200 shadow-md"
                          >
                            📹 Join Google Meet Session
                          </a>
                        )}
                      </div>
                    ) : sessions[0].status === "REFUNDED" ? (
                      <div className="text-red-700 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs leading-relaxed">
                        <strong>Session Cancelled & Refunded:</strong> A full refund has been initiated to your payment source.
                      </div>
                    ) : (
                      <div className="space-y-2 text-neutral-600">
                        <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Submitted Slots:</span>
                        <ul className="space-y-1 font-mono text-[10px] pl-4 list-decimal text-neutral-700">
                          <li>{new Date(sessions[0].preferredSlot1).getTime() > 0 ? new Date(sessions[0].preferredSlot1).toLocaleString() : "Not scheduled"}</li>
                          <li>{new Date(sessions[0].preferredSlot2).getTime() > 0 ? new Date(sessions[0].preferredSlot2).toLocaleString() : "Not scheduled"}</li>
                          <li>{new Date(sessions[0].preferredSlot3).getTime() > 0 ? new Date(sessions[0].preferredSlot3).toLocaleString() : "Not scheduled"}</li>
                        </ul>
                        <p className="text-[10px] text-neutral-400 leading-normal mt-2 border-t border-neutral-100 pt-2 italic">
                          Arijit will confirm one slot and attach the Google Meet link. You will receive an email confirmation.
                        </p>
                      </div>
                    )}

                    {sessions[0].notes && (
                      <div className="border-t border-neutral-100 pt-2 space-y-1.5">
                        <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px] block">Arijit's Pre-Session Notes:</span>
                        <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl font-sans text-xs text-neutral-700 leading-relaxed max-h-[120px] overflow-y-auto italic">
                          {sessions[0].notes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Client Level:</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold">PREMIUM Tier</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Next Steps:</span>
                      <span className="text-neutral-800 font-medium text-right max-w-[200px]">Our distribution desk is preparing your PDF rebalancing plan.</span>
                    </div>
                  </div>
                )}

                {/* Prominent Trust Refund Policy Banner */}
                <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[10px] text-blue-700 font-sans leading-relaxed text-left flex gap-2">
                  <span className="text-sm">🛡️</span>
                  <span>
                    <strong>Trust Policy:</strong> If your scheduled session does not happen for any reason, you will receive a full refund within 24 hours. No questions asked.
                  </span>
                </div>

                <button
                  onClick={() => window.location.href = "/dashboard/client"}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>Enter Client Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {scoreReport && (
                  <button
                    onClick={() => setDashboardStage("REPORT")}
                    className="w-full py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            ) : (
              // Case B: Payment Pending Verification
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-500/20 flex items-center justify-center text-amber-600 mx-auto mb-2">
                  <Loader2 className="w-8 h-8 stroke-[1.5] animate-spin text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Verification Pending</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    We have received your payment.
                  </p>
                </div>

                <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-500/20 text-amber-700 font-mono text-[9px] font-bold">Pending Review</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Transaction ID:</span>
                    <span className="text-neutral-800 font-mono text-[11px]">{payments[0]?.utrId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Amount:</span>
                    <span className="text-neutral-800 font-medium font-mono">₹{payments[0]?.amount || "499"}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 font-sans leading-relaxed font-semibold">
                  Our distributor will contact you back in some time.
                </p>

                {scoreReport && (
                  <button
                    onClick={() => setDashboardStage("REPORT")}
                    className="w-full py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white/70 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-left">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">Complete Profile</h2>
            <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
              Please enter your details to proceed with your onboarding and premium distribution services.
            </p>
            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d+ ]/g, ""))}
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Anniversary Date (Optional)
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={anniversaryInput}
                  onChange={(e) => setAnniversaryInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              {modalError && (
                <p className="text-red-500 text-xs font-sans">{modalError}</p>
              )}

              <button
                type="submit"
                disabled={modalSubmitting}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
              >
                {modalSubmitting ? "Saving..." : "Save & Continue"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer Section */}
      <footer className="w-full bg-transparent border-t border-border/40 relative z-10 pt-24 pb-0 overflow-hidden mt-auto">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 text-sm font-sans mb-20 text-neutral-500 text-left">
          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">India</span>
            <span className="text-neutral-900 font-normal text-sm font-mono">{currentTime || "22:55:56"}</span>
            <span className="text-neutral-400 text-xs font-mono">(GMT+5:30)</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">About</span>
            <a href="/#about" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">About Us</a>
            <a href="/#services" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Services</a>
            <a href="/#faq" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">FAQ</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono flex items-center gap-1">
              Quick Links<span className="text-[9px] text-primary font-mono leading-none align-super">(4)</span>
            </span>
            <a href="/sip-calculator" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">SIP Calculator</a>
            <a href="/onboarding" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Onboarding</a>
            <a href="/contact" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Contact</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">Contact</span>
            <a href="mailto:contact@finanalysis.in" className="text-neutral-500 hover:text-primary transition duration-200 text-sm break-all font-mono">
              contact@finanalysis.in
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-border/40 max-w-5xl mx-auto px-6 py-6 text-xs text-neutral-500 font-sans gap-4">
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
          <h1 className="font-chillax text-[18vw] font-bold text-black tracking-tighter leading-none select-none translate-y-[20%] text-center uppercase">
            FinAnalysis
          </h1>
        </div>
      </footer>

      {isLoaded && (
        <GradualBlur preset="page-footer" height="2rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}
