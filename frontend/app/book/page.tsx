'use client';

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  CreditCard, 
  HelpCircle, 
  Image as ImageIcon, 
  Loader2, 
  QrCode, 
  ShieldAlert, 
  ShieldCheck 
} from "lucide-react";
import ColorBends from "@/components/ColorBends";

export default function BookAdvisoryCall() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Form states
  const [utrId, setUtrId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const upiId = "arijitde@upi";

  useEffect(() => {
    document.title = "Book Advisory Call | FinAnalysis";
    
    // Auth Guard
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      window.location.href = "/onboarding";
      return;
    }
    setToken(savedToken);
    setIsLoaded(true);
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrId.trim()) {
      setError("Please enter your transaction UTR / Reference ID.");
      return;
    }
    if (!screenshot) {
      setError("Please upload a screenshot of your payment confirmation.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("amount", "499");
      formData.append("utrId", utrId.trim());
      formData.append("screenshot", screenshot);

      const res = await fetch(`${backendUrl}/api/payments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard/user";
        }, 5000);
      } else {
        setError(data.error || "Failed to submit payment details.");
      }
    } catch (err) {
      setError("Network error while submitting payment proof.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="w-full min-h-screen bg-[#020204] text-white flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={135}
          speed={0.12}
          scale={0.95}
          warpStrength={0.6}
          transparent
          color="#8a5cff"
        />
        <div className="absolute inset-0 bg-[#020204]/90" />
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col justify-center relative z-10">
        
        {/* Back Link */}
        <a
          href="/dashboard/user"
          className="self-start flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00ffd1] mb-10 transition-colors duration-200 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </a>

        {/* Global Error Banner */}
        {error && (
          <div className="w-full max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Booking error</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="w-full max-w-md mx-auto bg-[#08080c]/85 border border-white/10 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#00ffd1]/10 border border-[#00ffd1]/20 flex items-center justify-center text-[#00ffd1] mx-auto mb-2 animate-pulse">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white tracking-wide">Booking Submitted!</h2>
              <p className="text-slate-400 text-xs font-sans leading-relaxed">
                Thank you for subscribing! Your Advisory Call and PDF Optimization plan booking is pending validation.
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Verification Fee:</span>
                <span className="text-white font-mono font-medium">₹499.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Reference UTR:</span>
                <span className="text-slate-300 font-mono">{utrId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Status:</span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-[9px] font-bold">Pending Review</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed pt-2">
              Our audit desk typically activates premium accounts within 1-2 hours after validating the UTR. You will be redirected back to your workspace momentarily.
            </p>
            <a
              href="/dashboard/user"
              className="inline-block w-full py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs rounded-xl transition duration-200 cursor-pointer shadow-lg"
            >
              Go to Workspace Now
            </a>
          </div>
        ) : (
          /* Normal Payment Flow */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column: QR and Instructions */}
            <div className="lg:col-span-6 border border-white/10 bg-[#08080c]/85 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
              <div className="space-y-6 text-left">
                <span className="text-[10px] font-mono text-[#00ffd1] border border-[#00ffd1]/20 bg-[#00ffd1]/5 px-3 py-1 rounded-full uppercase tracking-wider">
                  Payment Gateway
                </span>
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-wide">Scan & Pay ₹499</h1>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    Complete your payment of ₹499 to activate your premium workspace and book your detailed 1-on-1 optimization consultation.
                  </p>
                </div>

                {/* Styled SVG QR Code */}
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-[280px] mx-auto text-center gap-4">
                  <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden select-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                      {/* Stylized QR Code Matrix representation */}
                      <rect x="0" y="0" width="28" height="28" fill="currentColor" />
                      <rect x="4" y="4" width="20" height="20" fill="white" />
                      <rect x="8" y="8" width="12" height="12" fill="currentColor" />
                      
                      <rect x="72" y="0" width="28" height="28" fill="currentColor" />
                      <rect x="76" y="4" width="20" height="20" fill="white" />
                      <rect x="80" y="8" width="12" height="12" fill="currentColor" />
                      
                      <rect x="0" y="72" width="28" height="28" fill="currentColor" />
                      <rect x="4" y="76" width="20" height="20" fill="white" />
                      <rect x="8" y="80" width="12" height="12" fill="currentColor" />
                      
                      {/* Random QR pixels representation */}
                      <rect x="36" y="4" width="8" height="8" fill="currentColor" /><rect x="48" y="12" width="8" height="4" fill="currentColor" />
                      <rect x="60" y="8" width="4" height="12" fill="currentColor" /><rect x="36" y="20" width="12" height="4" fill="currentColor" />
                      <rect x="8" y="36" width="4" height="12" fill="currentColor" /><rect x="20" y="48" width="12" height="8" fill="currentColor" />
                      <rect x="48" y="36" width="16" height="8" fill="currentColor" /><rect x="36" y="48" width="4" height="16" fill="currentColor" />
                      <rect x="76" y="36" width="12" height="12" fill="currentColor" /><rect x="68" y="52" width="8" height="4" fill="currentColor" />
                      <rect x="64" y="64" width="16" height="8" fill="currentColor" /><rect x="84" y="60" width="8" height="4" fill="currentColor" />
                      <rect x="36" y="76" width="12" height="8" fill="currentColor" /><rect x="52" y="80" width="8" height="12" fill="currentColor" />
                      <rect x="68" y="84" width="24" height="8" fill="currentColor" /><rect x="80" y="72" width="8" height="8" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">UPI ID ADDRESS</span>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="text-xs font-semibold font-mono text-slate-200 select-all">{upiId}</span>
                      <button 
                        onClick={handleCopyUpi} 
                        className="text-slate-400 hover:text-[#00ffd1] p-1 transition cursor-pointer"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {copied && <span className="text-[9px] text-[#00ffd1] font-mono block">Copied to clipboard!</span>}
                  </div>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="space-y-3.5 border-t border-white/5 pt-6 mt-8 lg:mt-0 font-sans text-xs text-slate-400 text-left">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-mono text-[10px] text-slate-300 font-bold border border-white/10 shrink-0">1</div>
                  <p className="leading-relaxed">Scan the QR code using Google Pay, PhonePe, Paytm, or any UPI client.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-mono text-[10px] text-slate-300 font-bold border border-white/10 shrink-0">2</div>
                  <p className="leading-relaxed">Send exactly ₹499 and save the 12-digit transaction UTR reference number.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-mono text-[10px] text-slate-300 font-bold border border-white/10 shrink-0">3</div>
                  <p className="leading-relaxed">Take a screenshot of the payment success screen and upload it here as proof.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Submission Form */}
            <div className="lg:col-span-6 border border-white/10 bg-[#08080c]/85 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl text-left">
              <form onSubmit={handleSubmitPayment} className="space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">TRANSACTION REFERENCE</span>
                  
                  {/* UTR reference ID */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">12-Digit UTR / Transaction ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 415865239104"
                      maxLength={16}
                      value={utrId}
                      onChange={(e) => setUtrId(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest"
                    />
                    <span className="text-[9px] text-slate-500 block leading-relaxed font-sans">
                      Verify that your UTR matches the receipt exactly. Mismatched UTRs will cause activation delays.
                    </span>
                  </div>

                  {/* Screenshot file upload */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Payment Screenshot</label>
                    <div 
                      className={`relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition bg-black/20 ${
                        screenshot ? "border-[#00ffd1]" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setScreenshot(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`p-2 rounded-lg border mb-2 text-slate-400 ${screenshot ? "text-[#00ffd1] border-[#00ffd1]/20 bg-[#00ffd1]/5" : "border-white/10"}`}>
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      
                      {screenshot ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-white block select-none truncate max-w-[240px]">{screenshot.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono block">{(screenshot.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-slate-300 block">Upload receipt image</span>
                          <span className="text-[9px] text-slate-500 block">PNG, JPG, JPEG formats accepted (Max 5MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 lg:pt-0">
                  <div className="flex gap-4 items-center text-[10px] text-slate-400 font-sans leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-[#00ffd1] shrink-0" />
                    <span>Your transaction reference is encrypted and processed via secure local audit logs.</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#00ffd1] hover:bg-[#00ffd1]/90 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Reference...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Booking Payment</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
