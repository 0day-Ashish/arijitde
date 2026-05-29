'use client';

import { useEffect, useState } from "react";
import { LogOut, LayoutGrid, Award } from "lucide-react";

export default function ClientDashboard() {
  const [clientData, setClientData] = useState<{ name?: string; pan?: string; role?: string } | null>(null);

  useEffect(() => {
    document.title = "Client Workspace | FinAnalysis";
    
    // Load client data from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setClientData(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing client data");
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/onboarding";
  };

  return (
    <main className="w-full min-h-screen bg-[#020204] text-white flex flex-col items-center justify-center p-6 relative font-clash select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,255,209,0.06)_0%,transparent_75%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full border border-white/5 bg-[#08080a]/60 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00ffd1] mb-6">
          <LayoutGrid className="w-6 h-6 stroke-[1.5]" />
        </div>

        <h1 className="text-2xl font-semibold tracking-wide">Client Workspace</h1>
        <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">Premium Portfolio Access</p>
        
        {/* Client Card info */}
        {clientData && (
          <div className="w-full mt-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">NAME:</span>
              <span className="text-slate-300 font-sans font-medium">{clientData.name || "Portfolio Client"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">PAN NUMBER:</span>
              <span className="text-slate-300 font-mono tracking-wider font-semibold">{clientData.pan || "PAN UNKNOWN"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">PORTFOLIO TIER:</span>
              <span className="flex items-center gap-1 text-[#00ffd1] font-sans font-semibold text-xs">
                <Award className="w-3.5 h-3.5 shrink-0" />
                Active Client
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full mt-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out & Exit
        </button>
      </div>
    </main>
  );
}
