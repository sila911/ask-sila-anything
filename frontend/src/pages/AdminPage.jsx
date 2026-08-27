import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, Lock, ShieldTick, Refresh2, ArrowLeft } from "iconsax-react";
import { sounds } from "../utils/soundEffects";
import CreateDesign from "../components/admin/CreateDesign";
import Library from "../components/admin/Library";
import AdminDashboard from "../components/admin/AdminDashboard";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";

const TAB_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? 150 : -150, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -150 : 150, opacity: 0 }),
};

const TAB_TRANSITION = {
  x: { type: "spring", stiffness: 350, damping: 30 },
  opacity: { duration: 0.15 },
};

export default function AdminPage({
  isAdminUnlocked,
  isAuthChecking,
  handleAdminAuth,
  handleVerifyOtp,
  handleResendOtp,
  activeTab,
  tabDirection,
  changeTabWithDirection,
  seedDesign,
  addDesign,
  trackEvent,
  showAdminToast,
  questions,
  comments = [],
  markAnswered,
  designs,
  orderedDesigns,
  reuseDesign,
  removeDesign,
  events,
  handleToggleVisibility,
  handleTogglePin,
  handleSoftDelete,
  handleUpdateQuestion,
  setSeedDesign,
  linkMessage,
}) {
  // ─── Step Management: 'password' | 'otp' ──────────────────────────────────
  const [step, setStep] = useState("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ─── 2FA OTP State ────────────────────────────────────────────────────────
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60s in seconds
  const [cooldown, setCooldown] = useState(30); // 30s resend cooldown
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const otpInputRefs = useRef([]);

  // ─── Timer & Cooldown Handlers ────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    let cdTimer;
    if (step === "otp" && cooldown > 0) {
      setCanResend(false);
      cdTimer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(cdTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(cdTimer);
  }, [step, cooldown]);

  // Focus first OTP input when transitioning to OTP screen
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // ─── Step 1: Submit Password ──────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await handleAdminAuth(password);
      if (!res.ok) {
        setError(res.message || "Invalid admin password.");
        setIsLoading(false);
        return;
      }

      if (res.requires2FA) {
        setToken(res.token);
        setTimeLeft(60);
        setCooldown(30);
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
        setInfoMessage("A 6-digit verification code has been dispatched.");
        sounds.playClick();
      }
    } catch (err) {
      setError(err.message || "Authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: OTP Pin Handling ─────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal && value !== "") return;

    sounds.playClick();
    const newOtp = [...otp];
    newOtp[index] = cleanVal ? cleanVal.slice(-1) : "";
    setOtp(newOtp);
    if (error) setError("");

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are filled
    if (cleanVal && newOtp.every((d) => d !== "")) {
      const fullCode = newOtp.join("");
      triggerVerify(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "");
    if (pasted.length >= 6) {
      const digits = pasted.slice(0, 6).split("");
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
      sounds.playClick();
      triggerVerify(digits.join(""));
    }
  };

  const triggerVerify = async (fullCode) => {
    if (!fullCode || fullCode.length !== 6) {
      setError("Please enter the complete 6-digit PIN.");
      return;
    }
    if (timeLeft <= 0) {
      setError("Verification code has expired. Please request a new code.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await handleVerifyOtp(fullCode, token);
      if (!res.ok) {
        setError(res.message || "Invalid or expired verification code.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      } else {
        sounds.playSuccess();
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    triggerVerify(otp.join(""));
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await handleResendOtp();
      if (res.ok) {
        setToken(res.token);
        setTimeLeft(60);
        setCooldown(30);
        setOtp(["", "", "", "", "", ""]);
        setInfoMessage("A fresh 6-digit code has been dispatched!");
        sounds.playClick();
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.message || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ─── Loading Check ────────────────────────────────────────────────────────
  if (isAuthChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-in fade-in">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Verifying admin session...</p>
      </div>
    );
  }

  // ─── Locked: Password & 2FA Flow ──────────────────────────────────────────
  if (!isAdminUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in duration-300">
        <div
          className={`glass-shell rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl transition-all duration-300 ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          {step === "password" ? (
            <>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center border border-cyan-500/30 shrink-0 shadow-inner">
                  <Lock size={24} variant="Bold" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide leading-tight">
                    ADMIN ACCESS
                  </h2>
                  <p className="text-xs text-[color:var(--app-muted)] mt-0.5">
                    Enter password to unlock studio &amp; dashboard
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter admin password..."
                    className="w-full h-12 pl-4 pr-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 font-medium px-1 animate-in fade-in">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Unlock Admin Workspace"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Step 2: Security Verification PIN Entry */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0 shadow-inner">
                  <ShieldTick size={26} variant="Bold" className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide leading-tight">
                    SECURITY VERIFICATION
                  </h2>
                  <p className="text-xs text-[color:var(--app-muted)] mt-0.5">
                    Enter the 6-digit verification code to proceed
                  </p>
                </div>
              </div>

              {infoMessage && (
                <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 animate-ping" />
                  <span>{infoMessage}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                {/* 6 PIN Input Grid */}
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      autoComplete="one-time-code"
                      className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-inner ${
                        digit
                          ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-500 dark:text-cyan-400 ring-2 ring-cyan-500/20"
                          : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-100"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500`}
                    />
                  ))}
                </div>

                {/* Expiry and Cooldown Bar */}
                <div className="flex items-center justify-between text-xs text-[color:var(--app-muted)] px-1">
                  <span className={`font-mono font-medium ${timeLeft < 60 ? "text-rose-500 animate-pulse" : ""}`}>
                    ⏱️ Expires in: {formatTimer(timeLeft)}
                  </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isResending}
                    className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-50 disabled:no-underline font-medium cursor-pointer transition-opacity"
                  >
                    <Refresh2 size={13} className={isResending ? "animate-spin" : ""} />
                    {isResending
                      ? "Sending..."
                      : canResend
                      ? "Resend Code"
                      : `Resend (${cooldown}s)`}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 font-medium px-1 animate-in fade-in">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otp.some((d) => d === "") || timeLeft <= 0}
                  className="w-full h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying PIN...
                    </>
                  ) : (
                    "Verify & Unlock"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("password");
                    setError("");
                    setInfoMessage("");
                    sounds.playClick();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-[color:var(--app-muted)] hover:text-slate-800 dark:hover:text-zinc-200 transition-colors pt-1 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back to Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Unlocked: Admin Dashboard & Tabs ─────────────────────────────────────
  return (
    <div className="glass-shell glass-shell--3d w-[95%] max-w-6xl rounded-[2rem] p-5 sm:p-8">
      {linkMessage && (
        <p className="mb-3 text-sm text-[color:var(--app-muted)]">{linkMessage}</p>
      )}

      <div className="relative overflow-hidden w-full min-h-[500px]">
        <AnimatePresence initial={false} custom={tabDirection} mode="wait">
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={TAB_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TAB_TRANSITION}
            className="w-full"
          >
            {activeTab === "create" && (
              <CreateDesign
                seedDesign={seedDesign}
                onSave={addDesign}
                onEvent={trackEvent}
                onNotify={showAdminToast}
                questions={questions}
                onQuestionAnswered={markAnswered}
              />
            )}

            {activeTab === "library" && (
              <Library
                designs={orderedDesigns}
                onReuse={reuseDesign}
                onDelete={removeDesign}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsDashboard
                questions={questions}
                designs={designs}
                comments={comments}
                events={events}
              />
            )}

            {activeTab === "admin" && (
              <AdminDashboard
                designs={designs}
                events={events}
                questions={questions}
                comments={comments}
                onToggleVisibility={handleToggleVisibility}
                onTogglePin={handleTogglePin}
                onSoftDelete={handleSoftDelete}
                onUpdateQuestion={handleUpdateQuestion}
                onAnswerQuestion={(q) => {
                  if (setSeedDesign) setSeedDesign({ questionId: q.id });
                  changeTabWithDirection("create");
                  if (showAdminToast) {
                    showAdminToast("Question Loaded", "Opened in studio to answer.", "info");
                  }
                }}
                showAdminToast={showAdminToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
