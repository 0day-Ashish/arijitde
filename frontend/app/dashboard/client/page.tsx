'use client';

import { useEffect, useState } from "react";
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

// Global Goals Config
const GOAL_OPTIONS = [
  { value: "WEALTH_CREATION", label: "Wealth Creation", desc: "Long-term compounding to build a substantial corpus", icon: Sparkles },
  { value: "RETIREMENT", label: "Retirement Planning", desc: "Securing financial independence for your post-work years", icon: ShieldCheck },
  { value: "SHORT_TERM", label: "Short-Term Goals", desc: "Funding immediate capital needs (1-3 years)", icon: Calendar },
  { value: "LONG_TERM", label: "Long-Term Goals", desc: "Buying a house, children's education, or other major life plans", icon: Sparkles },
  { value: "EXPLORING", label: "Exploring Markets", desc: "Learning options and testing investment strategies", icon: CompassIcon },
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

export default function ClientDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<{ id: string; name?: string; email?: string; role?: string; phone?: string } | null>(null);
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
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizGoal, setQuizGoal] = useState<string>("WEALTH_CREATION");
  const [quizTenure, setQuizTenure] = useState<string>("1 to 3 years");

  // Database contexts
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);

  // Client specifics
  const [finPoints, setFinPoints] = useState<number>(500);
  const [lastQuoteFlipTime, setLastQuoteFlipTime] = useState<string | null>(null);
  const [isClientQuoteFlipped, setIsClientQuoteFlipped] = useState(false);
  const [usePointsForDiscount, setUsePointsForDiscount] = useState(false);
  const [clientBookings, setClientBookings] = useState<string[]>([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [pointsEarnedToday, setPointsEarnedToday] = useState(0);

  // Uploader tabs
  const [analyzeTab, setAnalyzeTab] = useState<"FILE" | "MANUAL">("FILE");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualRows, setManualRows] = useState<PortfolioRow[]>([
    { fundName: "", type: "SIP", startDate: "", sipAmount: 0, invested: 0, currentValue: 0 }
  ]);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello Premium Client! I am your FinSync AI assistant. Ask me anything about your current score or anomalies." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // View full scorecard inline toggle
  const [viewFullReport, setViewFullReport] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Clock Synchronizer
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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
        localStorage.setItem("finPointsBalance", "500");
        setFinPoints(500);
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
      setStatusMsg("Loading premium advisory workspace...");
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Me check
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
      const meData = await meRes.json();
      if (meRes.ok && meData.data?.role === "CLIENT") {
        const uObj = meData.data;
        setUserData(uObj);
        localStorage.setItem("user", JSON.stringify(uObj));
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
      }

      // 3. Fetch portfolios
      const portRes = await fetch(`${backendUrl}/api/portfolio`, { headers });
      const portData = await portRes.json();
      const userPortfolios = portData.success ? portData.data : [];

      if (userPortfolios.length > 0) {
        const latestPortfolio = userPortfolios[0];
        setActivePortfolioId(latestPortfolio.id);
        if (latestPortfolio.score) {
          setScoreReport(latestPortfolio.score);
        } else {
          // Score it inline
          await calculatePortfolioScore(latestPortfolio.id);
        }
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

  // Flip quote reward
  const handleClientQuoteFlip = () => {
    if (!isClientQuoteFlipped) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const lastFlip = lastQuoteFlipTime ? Number(lastQuoteFlipTime) : 0;

      if (now - lastFlip >= oneDay) {
        const earned = Math.floor(Math.random() * 51) + 100; // Earn 100-150 FinPoints
        const newBalance = finPoints + earned;
        setFinPoints(newBalance);
        setPointsEarnedToday(earned);
        localStorage.setItem("finPointsBalance", newBalance.toString());
        localStorage.setItem("lastQuoteFlipTime", now.toString());
        setLastQuoteFlipTime(now.toString());
      } else {
        setPointsEarnedToday(0);
      }
      setIsClientQuoteFlipped(true);
    } else {
      setIsClientQuoteFlipped(false);
    }
  };

  const getRemainingFlipTime = () => {
    if (!lastQuoteFlipTime) return "";
    const lastFlip = Number(lastQuoteFlipTime);
    const target = lastFlip + 24 * 60 * 60 * 1000;
    const diff = target - Date.now();
    if (diff <= 0) return "Ready to flip!";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Next flip in: ${hours}h ${minutes}m`;
  };

  // 1-Click Booking
  const handleClientBookCall = async () => {
    setError(null);
    setApiLoading(true);
    setStatusMsg("Registering premium advisory call booking...");

    try {
      const discountAmount = usePointsForDiscount ? Math.min(finPoints, 499) : 0;
      const amountPaid = 499 - discountAmount;

      const res = await fetch(`${backendUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData?.name || "Premium Client",
          phone: userData?.phone || "0000000000",
          slot: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
      const data = await res.json();

      if (data.success) {
        const newBooking = `1-on-1 Strategy Session - Confirmed (Paid ₹${amountPaid} using FinPoints)`;
        const updatedBookings = [newBooking, ...clientBookings];
        setClientBookings(updatedBookings);
        localStorage.setItem("clientBookings", JSON.stringify(updatedBookings));

        if (usePointsForDiscount) {
          const newPointsBalance = finPoints - discountAmount;
          setFinPoints(newPointsBalance);
          localStorage.setItem("finPointsBalance", newPointsBalance.toString());
          setUsePointsForDiscount(false);
        }
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
    if (!quizAge || !quizGoal) {
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
          goal: quizGoal
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

  // Chatbot
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "I'm on it! Tell me what details you need regarding your portfolio, points, or booking.";
      const query = inputVal.toLowerCase();
      if (query.includes("points") || query.includes("wallet") || query.includes("finpoint")) {
        replyText = `You currently have ${finPoints} FinPoints in your FinWallet. You can apply them on booking a call to get a discount (up to ₹499 off). You flip the Daily Wisdom card to earn more points!`;
      } else if (query.includes("wisdom") || query.includes("quote") || query.includes("flip")) {
        replyText = "The Daily Wisdom quotes card resets every 24 hours. Tapping the card flips it, giving you a daily wisdom quote and a reward of 100-150 FinPoints!";
      } else if (query.includes("booking") || query.includes("call") || query.includes("schedule")) {
        replyText = "Booking a call is instant. Click the 'Book Call Instantly' button. If you select 'Apply points discount', it deducts points from your wallet and decreases the cash booking fee.";
      } else if (query.includes("score") || query.includes("diagnose") || query.includes("analyse")) {
        replyText = `Your current score is ${scoreReport?.total || "N/A"}/100. You can upload an Excel/CSV spreadsheet or add rows manually to re-calculate your score as many times as you like.`;
      }
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

        localStorage.setItem("token", fetchedToken);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        setToken(fetchedToken);
        setUserData(fetchedUser);

        // Load client states
        const savedPoints = localStorage.getItem("finPointsBalance");
        if (savedPoints) {
          setFinPoints(Number(savedPoints));
        } else {
          localStorage.setItem("finPointsBalance", "500");
          setFinPoints(500);
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

    if (!trimmedPass || trimmedPass.length < 6) {
      setLoginError("Password must be at least 6 characters long.");
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
                onClick={handleSignOut}
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
                        placeholder="Minimum 6 characters"
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
              <span>Step {quizStep} of 2</span>
            </div>

            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Enter Current Age</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Used to calculate asset allocation targets.
                  </p>
                </div>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={quizAge}
                  onChange={(e) => setQuizAge(Number(e.target.value))}
                  className="w-full px-4 py-3.5 bg-white/40 border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-sm"
                />
                <button
                  onClick={() => setQuizStep(2)}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Investment Goal</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Choose your priority target.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-left">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = quizGoal === goal.value;
                    const IconComponent = goal.icon;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => setQuizGoal(goal.value)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                          isSelected ? "bg-primary/10 border-primary" : "bg-white/40 border-white/20"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-white border border-border text-neutral-500">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold block">{goal.label}</span>
                          <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">{goal.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer"
                  >
                    Finish & Update
                  </button>
                </div>
              </div>
            )}
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
                    Premium Member
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
                    <span>Active Goal:</span>
                    <span className="font-semibold text-neutral-800">
                      {GOAL_OPTIONS.find(o => o.value === quizGoal)?.label || quizGoal}
                    </span>
                  </div>
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
                  <span className="text-[9px] font-mono text-primary font-bold">1 FP = ₹1</span>
                </div>

                <div className="py-2.5 text-center bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest block font-bold">FinPoints</span>
                  <div className="text-3xl font-bold font-mono text-neutral-900 mt-1">
                    {finPoints} <span className="text-xs font-sans font-medium text-neutral-500 font-semibold">FP</span>
                  </div>
                </div>

                {finPoints > 0 && (
                  <button
                    type="button"
                    onClick={() => setUsePointsForDiscount(!usePointsForDiscount)}
                    className={`w-full p-3 rounded-2xl border text-xs flex justify-between items-center transition cursor-pointer ${
                      usePointsForDiscount 
                        ? "bg-primary/10 border-primary/40 text-primary font-semibold" 
                        : "bg-white/40 border-white/30 text-neutral-600 hover:bg-white/60"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-primary" />
                      Apply Points Discount
                    </span>
                    <span className="font-mono font-bold">-₹{Math.min(finPoints, 499)}</span>
                  </button>
                )}
              </div>

              {/* 1-Click Booking Widget */}
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Book advisor call
                  </h3>
                  <span className="text-[9px] font-mono text-neutral-400">1-CLICK</span>
                </div>

                <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                  Book a priority review session. Applied FinPoints deduct from standard ₹499 fee.
                </p>

                <div className="p-3 bg-neutral-900/5 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-semibold">Total Price</span>
                  <span className="text-neutral-900 font-bold font-mono text-sm">
                    ₹{Math.max(0, 499 - (usePointsForDiscount ? Math.min(finPoints, 499) : 0))}
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
                      THANK YOU FOR BEING A PREMIUM CLIENT
                    </div>
                  </div>
                </div>
              </div>

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
                Your 1-on-1 premium advisory session is scheduled. A SEBI-registered advisor will contact you within 24 hours at <strong className="text-neutral-800 font-mono font-medium">{userData?.phone || "your registered number"}</strong>.
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

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-80 md:w-96 h-[450px] md:h-[500px] mb-4 rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 origin-bottom-right">
            <div className="px-5 py-4 bg-transparent border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-primary tracking-wide font-clash">FinSync Advisor Bot</span>
                  <span className="text-[10px] text-neutral-400 font-mono">AI COMPANION • ONLINE</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-400 hover:text-primary transition duration-150 p-1 cursor-pointer font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-border select-text">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${msg.sender === "user"
                    ? "bg-primary/10 border-primary/15 text-primary rounded-br-none self-end text-left font-clash"
                    : "bg-neutral-100 border-neutral-200 text-neutral-800 rounded-bl-none self-start text-left font-clash"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-neutral-100 border border-neutral-200 text-neutral-500 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm self-start flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[100ms]" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[200ms]" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-[300ms]" />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-transparent flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about points, score, bookings..."
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/40 border border-neutral-200 text-neutral-800 focus:outline-none focus:border-primary placeholder-neutral-400 font-clash"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition duration-200 cursor-pointer font-sans text-xs font-bold"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center shadow-2xl transition duration-200 hover:rotate-12 cursor-pointer relative"
        >
          <HelpCircle className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>

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
