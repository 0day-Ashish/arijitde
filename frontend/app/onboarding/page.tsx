'use client';

import { useState, useEffect, useRef } from "react";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import Lenis from "lenis";
import GradualBlur from "@/components/GradualBlur";
import { ArrowLeft, UserPlus, ShieldAlert, Key, Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";

type FlowState = "SELECT" | "NEW_USER" | "OTP_VERIFY" | "EXISTING_CLIENT";

export default function Onboarding() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Navigation Flow State
  const [flow, setFlow] = useState<FlowState>("SELECT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  const [otpSentMsg, setOtpSentMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(false);

  const [clientForgotFlow, setClientForgotFlow] = useState<"LOGIN" | "SEND_OTP" | "VERIFY_RESET" | "ACTIVATE_SEND" | "ACTIVATE_VERIFY">("LOGIN");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [showNewClientPassword, setShowNewClientPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Clock
  const [currentTime, setCurrentTime] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const setAuthSession = (token: string, user: any, remember: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : ""; // 30 days or session cookie
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; ${expiry}; SameSite=Lax; Secure`;
  };

  // Lenis smooth scrolling initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  // Mount animation
  useEffect(() => {
    document.title = "Book a Call | FinAnalysis - Arijit De";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Footer clock tracking
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

  // Load Google GSI Script dynamically for Google Sign-In
  useEffect(() => {
    if (flow === "NEW_USER" || flow === "EXISTING_CLIENT") {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

      const renderBtn = () => {
        if (typeof window !== "undefined" && (window as any).google) {
          initializeGoogleSignIn();
        } else {
          const interval = setInterval(() => {
            if (typeof window !== "undefined" && (window as any).google) {
              initializeGoogleSignIn();
              clearInterval(interval);
            }
          }, 100);
          return () => clearInterval(interval);
        }
      };

      let cleanupInterval: (() => void) | undefined;

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          cleanupInterval = renderBtn();
        };
        document.body.appendChild(script);
      } else {
        const timer = setTimeout(() => {
          cleanupInterval = renderBtn();
        }, 50);
        return () => {
          clearTimeout(timer);
          if (cleanupInterval) cleanupInterval();
        };
      }

      return () => {
        if (cleanupInterval) cleanupInterval();
      };
    }
  }, [flow]);

  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLoginSuccess,
        });

        const newUserBtn = document.getElementById("google-signin-button");
        if (newUserBtn) {
          (window as any).google.accounts.id.renderButton(
            newUserBtn,
            {
              theme: "dark",
              size: "large",
              width: "100%",
              text: "signup_with",
              shape: "pill"
            }
          );
        }

        const clientBtn = document.getElementById("google-signin-button-client");
        if (clientBtn) {
          (window as any).google.accounts.id.renderButton(
            clientBtn,
            {
              theme: "dark",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "pill"
            }
          );
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign In: ", err);
      }
    }
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    setLoading(true);
    setError(null);
    const idToken = response.credential;

    try {
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();

      if (data.success) {
        // Save token and user details to cookies/localStorage
        setAuthSession(data.data.token, data.data.user, true);

        // Redirect dynamically based on user role
        if (data.data.user?.role === "ADMIN") {
          window.location.href = "/dashboard/admin";
        } else if (data.data.user?.role === "CLIENT") {
          window.location.href = "/dashboard/client";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        setError(data.error || "Google Authentication failed");
        setLoading(false);
      }
    } catch (err) {
      setError("Unable to reach authentication server");
      setLoading(false);
    }
  };

  // Submit Send OTP (New User Flow)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Admin login only requires email, normal signup requires name/email/password
    if (isAdminLogin) {
      if (!email) {
        setError("Please enter your administrator email address.");
        return;
      }
    } else {
      if (!name || !email || !password) {
        setError("Please fill in all registration fields.");
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Call endpoint to send OTP
      const res = await fetch(`${backendUrl}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          isRegistration: !isUserLogin && !isAdminLogin
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSentMsg(`Verification OTP has been sent to ${email}`);
        setFlow("OTP_VERIFY");
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (err) {
      setError("Unable to connect to authentication server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (New User Flow)
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 2: Call endpoint to verify OTP
      const res = await fetch(`${backendUrl}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          name: (!isUserLogin && !isAdminLogin) ? name : undefined,
          password: (!isUserLogin && !isAdminLogin) ? password : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Save registration details in cookies/localStorage
        setAuthSession(data.data.token, {
          ...data.data.user,
          name: isAdminLogin ? (data.data.user.name || "Administrator") : name // Use custom name provided in form or default to admin
        }, rememberMe);

        // Redirect dynamically based on user role
        if (data.data.user?.role === "ADMIN") {
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        setError(data.error || "Incorrect or expired OTP verification code");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Existing Client Login (Real PAN + Password Auth)
  const handleClientLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PAN validation regex: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const formattedPan = panNumber.trim().toUpperCase();

    if (!formattedPan || !clientPassword) {
      setError("Please enter your PAN number and password.");
      return;
    }

    if (!panRegex.test(formattedPan)) {
      setError("Invalid PAN structure. Standard format: ABCDE1234F");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/pan/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan: formattedPan, password: clientPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthSession(data.data.token, data.data.user, rememberMe);
        window.location.href = "/dashboard/client";
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMsg("");
    const trimmedEmail = resetEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/password/reset/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg(`Verification code sent successfully to ${trimmedEmail}`);
        setClientForgotFlow('VERIFY_RESET');
      } else {
        setError(data.error || "Failed to send reset code.");
      }
    } catch (err) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMsg("");
    const trimmedEmail = resetEmail.trim().toLowerCase();
    const trimmedOtp = resetOtp.trim();
    const trimmedPass = newClientPassword.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (!trimmedPass || trimmedPass.length < 8 || !/[A-Z]/.test(trimmedPass) || !/[0-9]/.test(trimmedPass)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/password/reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp, password: trimmedPass }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg("Password reset successfully! Please log in using your new credentials.");
        setClientForgotFlow('LOGIN');
        // Clear forms
        setResetEmail('');
        setResetOtp('');
        setNewClientPassword('');
        setPanNumber('');
        setClientPassword('');
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientSendActivationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMsg("");
    const formattedPan = panNumber.trim().toUpperCase();
    const trimmedEmail = resetEmail.trim().toLowerCase();

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formattedPan)) {
      setError("Invalid PAN structure. Standard format: ABCDE1234F");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/activation/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan: formattedPan, email: trimmedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg(`Activation code sent successfully to ${trimmedEmail}`);
        setClientForgotFlow('ACTIVATE_VERIFY');
      } else {
        setError(data.error || "Failed to send activation code.");
      }
    } catch (err) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientConfirmActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMsg("");
    const formattedPan = panNumber.trim().toUpperCase();
    const trimmedEmail = resetEmail.trim().toLowerCase();
    const trimmedOtp = resetOtp.trim();
    const trimmedPass = newClientPassword.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    if (!trimmedPass || trimmedPass.length < 8 || !/[A-Z]/.test(trimmedPass) || !/[0-9]/.test(trimmedPass)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/activation/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pan: formattedPan,
          email: trimmedEmail,
          otp: trimmedOtp,
          password: trimmedPass
        }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg("Account activated successfully! Please log in with your credentials.");
        setClientForgotFlow('LOGIN');
        setResetEmail('');
        setResetOtp('');
        setNewClientPassword('');
        setPanNumber('');
        setClientPassword('');
      } else {
        setError(data.error || "Failed to activate account.");
      }
    } catch (err) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none bg-[#F2F0EF] bg-[radial-gradient(circle_at_bottom,rgba(147,197,253,0.95)_0%,rgba(186,230,253,0.65)_45%,rgba(242,240,239,0)_85%)]">
        <SoftBoxBlurBg />
      </div>

      {/* Reusable Navbar */}
      <Navbar isLoaded={isLoaded} activePath="/onboarding" />

      {/* Main Form/Content Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-36 pb-24 max-w-5xl mx-auto w-full">

        {/* Back Button */}
        {flow !== "SELECT" && (
          <button
            onClick={() => {
              setFlow("SELECT");
              setError(null);
              setOtp("");
              setIsAdminLogin(false);
            }}
            className="self-start flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary mb-8 transition-colors duration-200 bg-white/30 border border-white/30 backdrop-blur-xl rounded-xl px-4 py-2 hover:bg-white/50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Selection
          </button>
        )}

        {/* 1. SELECT FLOW */}
        {flow === "SELECT" && (
          <div
            className={`w-full text-center flex flex-col items-center justify-center transition-all duration-[1200ms] ease-out ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
          >
            <h1 className="text-4xl md:text-6xl font-normal leading-tight text-foreground mb-4 font-clash">
              Book a Call
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mb-12">
              Choose your profile below to enter your customized AMFI-registered Mutual Fund distribution dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mt-4">

              {/* Existing Client Card */}
              <button
                onClick={() => setFlow("EXISTING_CLIENT")}
                className="relative text-left rounded-3xl border border-white/30 bg-white/30 p-8 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 backdrop-blur-xl hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary group-hover:text-primary/80 group-hover:border-primary/40 transition-all duration-300">
                    <Key className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">Existing Client</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-sans mt-2 pr-4">
                      Registered portfolios under Arindam De or Arijit De. Log in using PAN and Password.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-xs font-mono text-primary opacity-60 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                  Access Portal &rarr;
                </div>
              </button>

              {/* New User Card */}
              <button
                onClick={() => setFlow("NEW_USER")}
                className="relative text-left rounded-3xl border border-white/30 bg-white/30 p-8 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 backdrop-blur-xl hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary group-hover:text-primary/80 group-hover:border-primary/40 transition-all duration-300">
                    <UserPlus className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">New User</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-sans mt-2 pr-4">
                      Create an account to start analyzing, optimizing, and tracking your assets under management.
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-xs font-mono text-primary opacity-60 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                  Register Account &rarr;
                </div>
              </button>

            </div>

            {/* Admin Login Prompts */}
            <div className="mt-12 text-xs text-muted-foreground font-sans">
              Are you an administrator?{" "}
              <button
                onClick={() => {
                  setIsAdminLogin(true);
                  setFlow("NEW_USER");
                  setError(null);
                }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Click here to login
              </button>
            </div>
          </div>
        )}

        {/* 2. NEW USER FORM */}
        {flow === "NEW_USER" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">
              {isAdminLogin ? "Admin Sign In" : (isUserLogin ? "User Sign In" : "Create Account")}
            </h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {isAdminLogin
                ? "Enter your administrator email to receive a 6-digit OTP code."
                : (isUserLogin ? "Enter your email to receive a 6-digit OTP code." : "Complete details to receive an OTP and register your workspace.")}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              {!isAdminLogin && !isUserLogin && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                  />
                </div>
              </div>

              {!isAdminLogin && !isUserLogin && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-sans">Must be at least 8 characters with 1 uppercase letter and 1 number.</p>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="userRememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="userRememberMe" className="text-xs text-muted-foreground select-none cursor-pointer font-sans">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : (isAdminLogin || isUserLogin ? "Send OTP Code" : "Verify & Register")}
              </button>
            </form>

            {!isAdminLogin && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <span className="relative z-10 px-3 bg-white/50 backdrop-blur-md text-[10px] font-mono text-muted-foreground uppercase tracking-widest rounded-full">Or Continue With</span>
                </div>

                {/* Google OAuth Button Container */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div id="google-signin-button" className="w-full min-h-[40px] flex justify-center" />
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground font-sans">
                  {isUserLogin ? (
                    <>
                      New to FinAnalysis?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserLogin(false);
                          setError(null);
                        }}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Register here
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered as user?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserLogin(true);
                          setError(null);
                        }}
                        className="text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Login here
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. OTP VERIFICATION */}
        {flow === "OTP_VERIFY" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center text-primary mx-auto mb-6">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">Verify Email</h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {otpSentMsg || "We sent a 6-digit OTP code to your registered email."}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOtpVerifySubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 text-center">6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full tracking-[1.5em] text-center py-4 text-xl bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Complete Verification"}
              </button>
            </form>
          </div>
        )}

        {/* 4. EXISTING CLIENT FORM */}
        {flow === "EXISTING_CLIENT" && (
          <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative text-left">
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-clash">
              {clientForgotFlow === 'LOGIN' && "Client Log In"}
              {clientForgotFlow === 'SEND_OTP' && "Reset Account Password"}
              {clientForgotFlow === 'VERIFY_RESET' && "Verify Reset Code"}
              {clientForgotFlow === 'ACTIVATE_SEND' && "Activate Client Account"}
              {clientForgotFlow === 'ACTIVATE_VERIFY' && "Verify Activation Code"}
            </h2>
            <p className="text-muted-foreground text-xs font-sans mb-6">
              {clientForgotFlow === 'LOGIN' && "Enter your Permanent Account Number (PAN) and security password."}
              {clientForgotFlow === 'SEND_OTP' && "Enter your registered email address to receive a 6-digit verification code."}
              {clientForgotFlow === 'VERIFY_RESET' && "Enter the verification code sent to your email and your new password."}
              {clientForgotFlow === 'ACTIVATE_SEND' && "Enter your PAN and registered Email Address to receive an activation code."}
              {clientForgotFlow === 'ACTIVATE_VERIFY' && "Enter the activation code sent to your email and set your new security password."}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {resetSuccessMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans animate-in fade-in slide-in-from-top-2">
                <span className="font-bold shrink-0 mt-0.5">✓</span>
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {clientForgotFlow === 'LOGIN' && (
              <>
                <form onSubmit={handleClientLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">PAN Card Number</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ABCDE1234F"
                        maxLength={10}
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans tracking-wide transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Account Password</label>
                      <button
                        type="button"
                        onClick={() => { setClientForgotFlow('SEND_OTP'); setError(null); setResetSuccessMsg(""); }}
                        className="text-[10px] text-primary hover:underline font-semibold font-sans cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showClientPassword ? "text" : "password"}
                        required
                        placeholder="Enter account password"
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                      >
                        {showClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="clientRememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label htmlFor="clientRememberMe" className="text-xs text-muted-foreground select-none cursor-pointer font-sans">
                      Remember me on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Client Access Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground font-sans">
                  First time logging in?{" "}
                  <button
                    type="button"
                    onClick={() => { setClientForgotFlow('ACTIVATE_SEND'); setError(null); setResetSuccessMsg(""); }}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Activate your account
                  </button>
                </div>

                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <span className="relative z-10 px-3 bg-white/50 backdrop-blur-md text-[10px] font-mono text-muted-foreground uppercase tracking-widest rounded-full">Or Continue With</span>
                </div>

                {/* Google OAuth Button Container */}
                <div className="w-full flex flex-col items-center justify-center">
                  <div id="google-signin-button-client" className="w-full min-h-[40px] flex justify-center" />
                </div>
              </>
            )}

            {clientForgotFlow === 'SEND_OTP' && (
              <form onSubmit={handleClientSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send Verification OTP"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setClientForgotFlow('LOGIN'); setError(null); setResetSuccessMsg(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </form>
            )}

            {clientForgotFlow === 'VERIFY_RESET' && (
              <form onSubmit={handleClientConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 text-center">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter verification code"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[1.5em] text-center py-3.5 text-lg bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewClientPassword ? "text" : "password"}
                      required
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={newClientPassword}
                      onChange={(e) => setNewClientPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewClientPassword(!showNewClientPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                    >
                      {showNewClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setClientForgotFlow('LOGIN'); setError(null); setResetSuccessMsg(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </form>
            )}

            {clientForgotFlow === 'ACTIVATE_SEND' && (
              <form onSubmit={handleClientSendActivationOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">PAN Card Number</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans tracking-wide transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Sending Activation Code..." : "Send Activation OTP"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setClientForgotFlow('LOGIN'); setError(null); setResetSuccessMsg(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </form>
            )}

            {clientForgotFlow === 'ACTIVATE_VERIFY' && (
              <form onSubmit={handleClientConfirmActivation} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 text-center">6-Digit Activation Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter activation code"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[1.5em] text-center py-3.5 text-lg bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Set Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewClientPassword ? "text" : "password"}
                      required
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={newClientPassword}
                      onChange={(e) => setNewClientPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-white/40 border border-white/20 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/60 font-sans transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewClientPassword(!showNewClientPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
                    >
                      {showNewClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Activating Account..." : "Confirm & Activate"}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setClientForgotFlow('LOGIN'); setError(null); setResetSuccessMsg(""); }}
                    className="text-xs text-neutral-600 hover:text-primary font-semibold font-sans cursor-pointer"
                  >
                    &larr; Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Footer Section */}
      <footer className="w-full bg-transparent border-t border relative z-10 pt-24 pb-0 overflow-hidden mt-auto">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-12 text-sm font-sans mb-20 text-muted-foreground text-left">
          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">India</span>
            <span className="text-foreground font-normal text-sm font-mono">{currentTime || "22:55:56"}</span>
            <span className="text-slate-500 text-xs font-mono">(GMT+5:30)</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">About</span>
            <a href="/#about" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">About Us</a>
            <a href="/#services" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Services</a>
            <a href="/#faq" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">FAQ</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono flex items-center gap-1">
              Quick Links<span className="text-[9px] text-primary font-mono leading-none align-super">(4)</span>
            </span>
            <a href="/sip-calculator" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">SIP Calculator</a>
            <a href="/onboarding" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Onboarding</a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition duration-200 text-sm">Contact</a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-primary font-medium text-xs tracking-wider uppercase font-mono">Contact</span>
            <a href="mailto:contact@finanalysis.in" className="text-muted-foreground hover:text-primary transition duration-200 text-sm break-all font-mono">
              contact@finanalysis.in
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border max-w-5xl mx-auto px-6 py-6 text-xs text-muted-foreground font-sans gap-4">
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

