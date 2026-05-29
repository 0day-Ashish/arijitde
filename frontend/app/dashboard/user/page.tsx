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
  Download, 
  CreditCard, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck,
  FileText
} from "lucide-react";
import ColorBends from "@/components/ColorBends";

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
      
      // Update local storage user just in case role changed
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const uObj = JSON.parse(savedUser);
        uObj.role = currentRole;
        localStorage.setItem("user", JSON.stringify(uObj));
        setUserData(uObj);
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
    if (score >= 75) return "text-[#00ffd1] border-[#00ffd1]/20 bg-[#00ffd1]/5";
    if (score >= 60) return "text-yellow-400 border-yellow-400/20 bg-yellow-400/5";
    return "text-red-400 border-red-400/20 bg-red-400/5";
  };

  const getScoreStroke = (score: number) => {
    if (score >= 75) return "#00ffd1";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
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
    <main className="w-full min-h-screen bg-[#020204] text-white flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <ColorBends
          colors={["#a78bfa", "#8a5cff", "#00ffd1"]}
          rotation={45}
          speed={0.15}
          scale={0.9}
          warpStrength={0.5}
          transparent
          color="#8a5cff"
        />
        <div className="absolute inset-0 bg-[#020204]/90" />
      </div>

      {/* Floating header */}
      <header className="relative z-20 w-full border-b border-white/5 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-[#00ffd1]" />
          <span className="font-chillax font-bold tracking-wider text-sm uppercase">FinAnalysis Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          {userData && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
              <User className="w-3.5 h-3.5 text-[#8a5cff]" />
              <span>{userData.name || userData.email}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-semibold transition duration-200 cursor-pointer"
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
          <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Operation failed</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* ----------------- STAGE 0: LOADING SCREEN ----------------- */}
        {dashboardStage === "LOADING" && (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm">
            <Loader2 className="w-10 h-10 text-[#00ffd1] animate-spin stroke-[1.5] mb-6" />
            <h3 className="text-lg font-medium text-white">Please Wait</h3>
            <p className="text-slate-500 text-xs font-sans mt-2 leading-relaxed">
              {statusMsg || "We are querying database clusters to build your investment cockpit."}
            </p>
          </div>
        )}

        {/* ----------------- STAGE 1: ASSESSMENT QUIZ ----------------- */}
        {dashboardStage === "QUIZ" && (
          <div className="w-full max-w-md bg-[#08080c]/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Step header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-6 uppercase tracking-widest">
              <span>Stage 01: Profile Assessment</span>
              <span>Step {quizStep} of 3</span>
            </div>

            {/* Step 1: Age Selector */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white tracking-wide">How old are you?</h2>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    Your age determines your target asset risk allocation ratio (standard lifecycle models).
                  </p>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-5xl font-semibold text-[#00ffd1] font-chillax mb-4">
                    {quizAge} <span className="text-sm text-slate-500 font-sans font-normal">years</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={85}
                    value={quizAge}
                    onChange={(e) => setQuizAge(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00ffd1]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>18 YEARS</span>
                    <span>85 YEARS</span>
                  </div>
                </div>

                <button
                  onClick={() => setQuizStep(2)}
                  className="w-full py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
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
                  <h2 className="text-2xl font-semibold text-white tracking-wide">Select Financial Goal</h2>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
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
                        className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex items-start gap-4 cursor-pointer ${
                          isSelected 
                            ? "bg-[#8a5cff]/10 border-[#8a5cff] text-white" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-xl border mt-0.5 ${
                          isSelected ? "bg-[#8a5cff]/20 border-[#8a5cff]/40 text-[#a78bfa]" : "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                          <IconComponent className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold block">{goal.label}</span>
                          <span className="text-[10px] text-slate-400 block font-sans mt-0.5 leading-relaxed">{goal.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
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
                    className="flex-1 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
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
                  <h2 className="text-2xl font-semibold text-white tracking-wide">Investment Tenure</h2>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
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
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                          isSelected 
                            ? "bg-[#00ffd1]/10 border-[#00ffd1] text-white" 
                            : "bg-white/[0.01] border-white/5 hover:border-white/10 text-slate-400 hover:text-white"
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
                    className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={apiLoading || !quizTenure}
                    className="flex-1 py-3.5 bg-[#00ffd1] hover:bg-[#00ffd1]/90 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
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
            <div className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Financial Profile</span>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-white font-medium">Age: {quizAge}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-white font-medium">Goal: {GOAL_OPTIONS.find(o => o.value === quizGoal)?.label || quizGoal}</span>
                  {quizTenure && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-white font-medium">Tenure: {quizTenure}</span>
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
                className="text-[10px] font-mono text-[#00ffd1] hover:underline cursor-pointer border border-[#00ffd1]/20 bg-[#00ffd1]/5 px-3 py-1 rounded-lg"
              >
                Re-assess profile
              </button>
            </div>

            {/* Analysis Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white">Analyze Investments</h1>
              <p className="text-slate-400 text-xs font-sans leading-relaxed">
                Provide your current investment details. We'll run them through our scoring algorithm and flag any structural errors or anomalies.
              </p>
            </div>

            {/* Form Section */}
            <div className="w-full border border-white/10 bg-[#08080c]/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
              {/* Tab Selector */}
              <div className="flex border-b border-white/5 mb-8">
                <button
                  onClick={() => { setError(null); setAnalyzeTab("FILE"); }}
                  className={`pb-4 px-6 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${
                    analyzeTab === "FILE" 
                      ? "border-[#00ffd1] text-white" 
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Excel / CSV Upload
                </button>
                <button
                  onClick={() => { setError(null); setAnalyzeTab("MANUAL"); }}
                  className={`pb-4 px-6 text-xs font-semibold tracking-wider uppercase border-b-2 transition duration-200 cursor-pointer ${
                    analyzeTab === "MANUAL" 
                      ? "border-[#00ffd1] text-white" 
                      : "border-transparent text-slate-500 hover:text-slate-300"
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
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Portfolio Data File</label>
                      <button
                        type="button"
                        onClick={downloadCsvTemplate}
                        className="text-[10px] font-mono text-[#00ffd1] hover:underline flex items-center gap-1 cursor-pointer bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
                      >
                        <Download className="w-3 h-3" />
                        Download Template CSV
                      </button>
                    </div>

                    {/* Drag & Drop uploader area */}
                    <div 
                      className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition duration-200 bg-black/20 ${
                        uploadedFile 
                          ? "border-[#00ffd1] bg-[#00ffd1]/[0.01]" 
                          : "border-white/10 hover:border-white/20"
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
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition ${
                        uploadedFile ? "bg-[#00ffd1]/10 border-[#00ffd1]/20 text-[#00ffd1]" : "bg-white/5 border-white/10 text-slate-400"
                      }`}>
                        {uploadedFile ? <CheckCircle2 className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5 stroke-[1.5]" />}
                      </div>

                      {uploadedFile ? (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-white block">{uploadedFile.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-300 block">Click or Drag Excel/CSV file to upload</span>
                          <span className="text-[10px] text-slate-500 block leading-relaxed font-sans mt-1">
                            Supported: .xlsx, .csv (Must contain exactly 6 columns in matching template order)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={apiLoading || !uploadedFile}
                    className="w-full py-4 bg-[#00ffd1] hover:bg-[#00ffd1]/90 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
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
                        <tr className="border-b border-white/5 text-[9px] font-mono uppercase tracking-wider text-slate-400">
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
                          <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Parag Parikh Flexi"
                                value={row.fundName}
                                onChange={(e) => handleManualRowChange(idx, "fundName", e.target.value)}
                                className="w-full bg-white/5 border border-white/5 focus:border-white/10 rounded-lg p-2 text-white font-sans text-xs focus:outline-none placeholder-slate-700"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <select
                                value={row.type}
                                onChange={(e) => handleManualRowChange(idx, "type", e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-white font-sans text-xs focus:outline-none"
                              >
                                <option className="bg-[#020204]" value="SIP">SIP</option>
                                <option className="bg-[#020204]" value="LUMPSUM">Lumpsum</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-2">
                              <input
                                type="date"
                                required
                                value={row.startDate}
                                onChange={(e) => handleManualRowChange(idx, "startDate", e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-none"
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
                                className="w-full bg-white/5 border border-white/5 disabled:opacity-20 rounded-lg p-2 text-white font-mono text-xs focus:outline-none text-right"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                required
                                min={1}
                                value={row.invested || ""}
                                onChange={(e) => handleManualRowChange(idx, "invested", e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-white font-mono text-xs focus:outline-none text-right"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                required
                                min={1}
                                value={row.currentValue || ""}
                                onChange={(e) => handleManualRowChange(idx, "currentValue", e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-white font-mono text-xs focus:outline-none text-right"
                              />
                            </td>
                            <td className="py-2.5 px-1 text-center">
                              {manualRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveManualRow(idx)}
                                  className="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
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
                      className="py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer self-start"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Investment Row
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono self-end">
                      {manualRows.length} of 15 Max Rows
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={apiLoading}
                    className="w-full py-4 bg-[#8a5cff] hover:bg-[#8a5cff]/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
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
              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-white">Your Evaluation Scorecard</h1>
              <p className="text-slate-400 text-xs font-sans">
                Below is the core assessment breakdown computed from your portfolio's raw telemetry.
              </p>
            </div>

            {/* Score Summary Grid (Main radial gauge + badge callout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Overall Gauge */}
              <div className="md:col-span-5 border border-white/10 bg-[#08080c]/85 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6">COMPREHENSIVE RATING</span>

                {/* SVG Circular Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke="rgba(255,255,255,0.03)"
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
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-semibold font-chillax leading-none">{scoreReport.total}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">/ 100</span>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getScoreColor(scoreReport.total)}`}>
                  {getTagLabel(scoreReport.tag)}
                </div>
              </div>

              {/* Right Column: Breakdown & Description */}
              <div className="md:col-span-7 border border-white/10 bg-[#08080c]/85 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">METRIC TELEMETRY BREAKDOWN</span>
                  <h3 className="text-xl font-semibold text-white tracking-wide">{getTagLabel(scoreReport.tag)}</h3>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    {getTagDesc(scoreReport.tag)}
                  </p>
                </div>

                {/* Horizontal Progress Bars */}
                <div className="space-y-4.5 mt-8 md:mt-0">
                  
                  {/* Goal Alignment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-slate-400">Goal Alignment</span>
                      <span className="text-white font-mono">{scoreReport.goalAlignment} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00ffd1] rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.goalAlignment / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Asset Allocation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-slate-400">Asset Allocation</span>
                      <span className="text-white font-mono">{scoreReport.assetAlloc} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8a5cff] rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.assetAlloc / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Diversification */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-slate-400">Diversification</span>
                      <span className="text-white font-mono">{scoreReport.diversification} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.diversification / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Discipline */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-slate-400">SIP Discipline</span>
                      <span className="text-white font-mono">{scoreReport.discipline} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.discipline / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-slate-400">Cost Efficiency</span>
                      <span className="text-white font-mono">{scoreReport.efficiency} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-400 rounded-full transition-all duration-1000" style={{ width: `${(scoreReport.efficiency / 20) * 100}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Insights Section */}
            <div className="w-full border border-white/10 bg-[#08080c]/80 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-2xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00ffd1]" />
                AI Generated Anomaly Insights
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scoreReport.insights.map((insight, idx) => (
                  <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs font-mono text-slate-400 mt-0.5 shrink-0">
                      0{idx + 1}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans text-left">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Box: Book Call */}
            <div className="w-full border border-[#00ffd1]/20 bg-[radial-gradient(circle_at_top_right,rgba(0,255,209,0.06)_0%,transparent_60%)] bg-[#08080c]/85 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden">
              <div className="space-y-4 max-w-xl text-left">
                <span className="text-[10px] font-mono text-[#00ffd1] border border-[#00ffd1]/30 bg-[#00ffd1]/5 px-3 py-1 rounded-full uppercase tracking-wider">
                  Premium Advisor Consulting
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-wide">Detailed Advisory Optimization Session</h2>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  Book your 1-on-1 strategy call with our SEBI-registered advisor Arijit De. Get a comprehensive optimization roadmap, personalized tax restructuring report, and active rebalancing insights based on your score.
                </p>
                <div className="flex gap-6 items-center text-slate-400 text-xs font-sans pt-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00ffd1]" />
                    <span>SEBI MFD Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#8a5cff]" />
                    <span>Includes Detailed PDF</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl md:min-w-[240px] text-center">
                <div className="text-[10px] font-mono text-slate-500 line-through">₹1,999</div>
                <div className="text-4xl font-semibold font-chillax text-white mt-1">₹499</div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">One-time booking fee</span>
                
                <a
                  href="/book"
                  className="w-full mt-6 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg"
                >
                  <span>Book Advisory Call</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- STAGE 4: CLIENT STATUS SCREEN ----------------- */}
        {dashboardStage === "CLIENT_STATUS" && (
          <div className="w-full max-w-xl bg-[#08080c]/80 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Determine Status */}
            {userData?.role === "CLIENT" ? (
              // Case A: Approved PREMIUM Client
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00ffd1]/10 border border-[#00ffd1]/20 flex items-center justify-center text-[#00ffd1] mx-auto mb-2">
                  <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white tracking-wide">Workspace Activated</h2>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    Welcome to the Premium Advisory Portal! Your 1-on-1 advisory session booking has been verified.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Client Level:</span>
                    <span className="px-2 py-0.5 rounded bg-[#00ffd1]/10 border border-[#00ffd1]/20 text-[#00ffd1] font-mono text-[9px] font-bold">PREMIUM Tier</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Next Steps:</span>
                    <span className="text-slate-300 font-medium text-right max-w-[200px]">Our advisory desk is preparing your PDF rebalancing plan and will contact you via email to schedule your consulting slot.</span>
                  </div>
                </div>

                {scoreReport && (
                  <button 
                    onClick={() => setDashboardStage("REPORT")}
                    className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            ) : (
              // Case B: Payment Pending Verification
              <>
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mx-auto mb-2">
                  <Loader2 className="w-8 h-8 stroke-[1.5] animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white tracking-wide">Verification Pending</h2>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    We have received your payment reference UTR and screenshot upload.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-[9px] font-bold">Pending Review</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">UTR ID:</span>
                    <span className="text-slate-300 font-mono text-[11px]">{payments[0]?.utrId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Amount:</span>
                    <span className="text-slate-300 font-medium font-mono">₹{payments[0]?.amount || "499"}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Advisors typically approve payments and activate premium workspaces within 1-2 hours. You will receive a booking confirmation email as soon as verification completes.
                </p>

                {scoreReport && (
                  <button 
                    onClick={() => setDashboardStage("REPORT")}
                    className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
