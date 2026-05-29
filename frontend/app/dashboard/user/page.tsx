'use client';

import { useEffect, useState } from "react";
import {
  LogOut,
  Layout,
  User,
  Sparkles,
  TrendingUp,
  Calendar,
  Compass,
  ShieldAlert,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
  CreditCard,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  FileText
} from "lucide-react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";

// Goal mapping
const GOAL_OPTIONS = [
  { value: "WEALTH_CREATION", label: "Wealth Creation", desc: "Long-term compounding to build a substantial corpus", icon: Sparkles },
  { value: "RETIREMENT", label: "Retirement Planning", desc: "Securing financial independence for your post-work years", icon: ShieldCheck },
  { value: "SHORT_TERM", label: "Short-Term Goals", desc: "Funding immediate capital needs (1-3 years)", icon: Calendar },
  { value: "LONG_TERM", label: "Long-Term Goals", desc: "Buying a house, children's education, or other major life plans", icon: TrendingUp },
  { value: "EXPLORING", label: "Exploring Markets", desc: "Learning options and testing investment strategies", icon: Compass },
];

const TENURE_OPTIONS = [
  "Not started yet",
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years"
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
  const [userData, setUserData] = useState<{ id: string; name?: string; email?: string; role?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Flow & State control
  const [dashboardStage, setDashboardStage] = useState<"LOADING" | "QUIZ" | "ANALYZE" | "REPORT" | "CLIENT_STATUS">("LOADING");
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Phone Modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I am your FinAnalysis AI assistant. How can I help you optimize your portfolio today?" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizGoal, setQuizGoal] = useState<string>("");
  const [quizTenure, setQuizTenure] = useState<string>("");

  // DB Identifiers
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

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

  // Fetch complete database state for user when token is ready
  useEffect(() => {
    if (!token) return;
    fetchDashboardState();
  }, [token]);

  const fetchDashboardState = async () => {
    try {
      setDashboardStage("LOADING");
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Fetch user profile role updates
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
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
        localStorage.setItem("user", JSON.stringify(uObj));
        setUserData(uObj);
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

    setModalError(null);
    setModalSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ phone: phoneInput.trim() })
      });
      const data = await res.json();

      if (data.success) {
        // Update local user details
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const uObj = JSON.parse(savedUser);
          uObj.phone = data.data.phone;
          localStorage.setItem("user", JSON.stringify(uObj));
          setUserData(uObj);
        }
        setShowPhoneModal(false);
        // Refresh state
        await fetchDashboardState();
      } else {
        setModalError(data.error || "Failed to update phone number.");
      }
    } catch (err) {
      setModalError("Network error. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleMockPaySubmit = async () => {
    setError(null);
    setApiLoading(true);
    setStatusMsg("Processing mock payment secure transaction...");

    try {
      const res = await fetch(`${backendUrl}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 499
        })
      });
      const data = await res.json();

      if (data.success) {
        // Refresh dashboard state, which will detect the pending payment and route to CLIENT_STATUS
        await fetchDashboardState();
      } else {
        setError(data.error || "Failed to register mock payment");
      }
    } catch (err) {
      setError("Network error while submitting mock payment.");
    } finally {
      setApiLoading(false);
    }
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
      } else if (query.includes("demo") || query.includes("book") || query.includes("consult")) {
        replyText = "To book a 1-on-1 strategy call with our SEBI-registered advisor Arijit De, simply complete the ₹499 booking on the dashboard Evaluation page!";
      } else if (query.includes("anomaly") || query.includes("ml") || query.includes("fastapi")) {
        replyText = "Our FastAPI ML microservice runs an isolation forest model in python to flag strange anomalies or structural issues in your portfolio records.";
      } else if (query.includes("pricing") || query.includes("cost") || query.includes("pay")) {
        replyText = "The optimization review fee is ₹499. You can complete the payment directly on this scorecard dashboard to unlock your booking!";
      } else if (query.includes("hello") || query.includes("hi")) {
        replyText = "Hello! Hope you're having a great day. Ask me anything about FinAnalysis!";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 1000);
  };

  // Submit Assessment Quiz (Stage 1)
  const handleQuizSubmit = async () => {
    if (!quizAge || !quizGoal) {
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
          goal: quizGoal
        })
      });
      const resData = await res.json();

      if (resData.success) {
        setActiveAssessmentId(resData.data.assessmentId);
        // Save investing experience in local storage as context
        localStorage.setItem(`investing_tenure_${resData.data.assessmentId}`, quizTenure);
        setDashboardStage("ANALYZE");
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
        setApiLoading(false);
      }
    } catch (err) {
      setError("Network error while uploading file.");
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
        setApiLoading(false);
      }
    } catch (err) {
      setError("Network error while submitting details.");
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
        setApiLoading(false);
      }
    } catch (err) {
      setError("Network error running score calculation.");
      setDashboardStage("ANALYZE");
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{userData.name || userData.email}</span>
            </div>
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

        {/* ----------------- STAGE 1: ASSESSMENT QUIZ ----------------- */}
        {dashboardStage === "QUIZ" && (
          <div className="w-full max-w-md bg-white/30 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Step header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
              <span>Stage 01: Profile Assessment</span>
              <span>Step {quizStep} of 3</span>
            </div>

            {/* Step 1: Age Selector */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">How old are you?</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Your age determines your target asset risk allocation ratio (standard lifecycle models).
                  </p>
                </div>

                <div className="bg-white/40 border border-white/30 rounded-2xl p-6 text-center">
                  <div className="text-5xl font-semibold text-primary font-chillax mb-4">
                    {quizAge} <span className="text-sm text-neutral-500 font-sans font-normal">years</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={85}
                    value={quizAge}
                    onChange={(e) => setQuizAge(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-2">
                    <span>18 YEARS</span>
                    <span>85 YEARS</span>
                  </div>
                </div>

                <button
                  onClick={() => setQuizStep(2)}
                  className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2: Financial Goal */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Select Financial Goal</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    What primary objective drives your investment capital?
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 select-none custom-scrollbar">
                  {GOAL_OPTIONS.map((goal) => {
                    const IconComponent = goal.icon;
                    const isSelected = quizGoal === goal.value;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => setQuizGoal(goal.value)}
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

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizGoal) {
                        setError("Please choose a financial goal.");
                        return;
                      }
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

            {/* Step 3: Investing Experience */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Investment Tenure</h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    How long have you been actively putting capital to work?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {TENURE_OPTIONS.map((opt) => {
                    const isSelected = quizTenure === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setQuizTenure(opt)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected
                            ? "bg-primary/10 border-primary text-neutral-900"
                            : "bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                          }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setQuizStep(2)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={apiLoading || !quizTenure}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {apiLoading ? "Submitting..." : "Finish & Score"}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STAGE 2: ANALYZE PORTFOLIO ----------------- */}
        {dashboardStage === "ANALYZE" && (
          <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in duration-400">
            {/* Context Profile Header */}
            <div className="w-full p-6 bg-white/30 border border-white/30 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Financial Profile</span>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-neutral-900 font-medium">Age: {quizAge}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-900 font-medium">Goal: {GOAL_OPTIONS.find(o => o.value === quizGoal)?.label || quizGoal}</span>
                  {quizTenure && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">Tenure: {quizTenure}</span>
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
              <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 max-w-xl text-left">
                  <span className="text-[10px] font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                    Premium Advisor Consulting
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-wide">Detailed Advisory Optimization Session</h2>
                  <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                    Book your 1-on-1 strategy call with our SEBI-registered advisor Arijit De. Get a comprehensive optimization roadmap, personalized tax restructuring report, and active rebalancing insights based on your score.
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
                  <div className="text-4xl font-semibold font-chillax text-neutral-900 mt-1">₹499</div>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">One-time booking fee</span>

                  <button
                    onClick={handleMockPaySubmit}
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
                        <span>Pay ₹499 & Book Call</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                    Welcome to the Premium Advisory Portal! Your 1-on-1 advisory session booking has been verified.
                  </p>
                </div>

                <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Client Level:</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold">PREMIUM Tier</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">Next Steps:</span>
                    <span className="text-neutral-800 font-medium text-right max-w-[200px]">Our advisory desk is preparing your PDF rebalancing plan and will contact you via email to schedule your consulting slot.</span>
                  </div>
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
                  Our advisor will contact you back in some time.
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
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">Enter Phone Number</h2>
            <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
              Please enter your phone number to proceed with your onboarding and premium advisory services.
            </p>
            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Mobile / Phone Number
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
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chatbot Modal */}
        {isChatOpen && (
          <div className="w-80 md:w-96 h-[450px] md:h-[500px] mb-4 rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 origin-bottom-right">
            {/* Header */}
            <div className="px-5 py-4 bg-transparent border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-primary tracking-wide font-clash">Finsync AI</span>
                  <span className="text-[10px] text-neutral-400 font-mono">AI AGENT • ONLINE</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-400 hover:text-primary transition duration-150 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message List */}
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

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 bg-transparent flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about scoring criteria, anomalies..."
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/40 border border-neutral-200 text-neutral-800 focus:outline-none focus:border-primary placeholder-neutral-400 font-clash"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition duration-200 cursor-pointer"
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
          <div className="absolute bottom-16 right-2 mb-2.5 bg-white/80 border border-primary/10 rounded-xl px-3 py-1.5 text-xs text-black tracking-wide shadow-lg whitespace-nowrap select-none font-clash">
            Ask me <span className="font-semibold">anything !</span>
          </div>
        )}

        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-[#3A8293] hover:bg-[#3A8293]/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {isChatOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2H6C3.79 2 2 3.79 2 6v6c0 2.21 1.79 4 4 4h9l5 4v-4c1.66 0 3-1.34 3-3V6c0-2.21-1.79-4-4-4z" />
            </svg>
          )}
        </button>
      </div>

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
            <a href="/pricing" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Pricing</a>
            <a href="/onboarding" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Onboarding</a>
            <a href="/contact" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Contact</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">Socials</span>
            <a href="/" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Instagram</a>
            <a href="/" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">LinkedIn</a>
            <a href="/" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Newsletter</a>
            <a href="/" className="text-neutral-500 hover:text-primary transition duration-200 text-sm">Medium</a>
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
        <GradualBlur preset="page-footer" height="3rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}
