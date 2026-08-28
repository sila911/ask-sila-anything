export default function AdminOtpView({
  otp,
  otpInputRefs,
  timeLeft,
  message,
  error,
  isSubmitting,
  isResending,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  handleOtpVerify,
  handleResend,
  formatTimer,
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center pt-2 mb-5">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 pointer-events-none" />
          <img
            src="https://img.icons8.com/3d-fluency/188/shield.png"
            alt="Security Verification"
            className="w-18 h-18 sm:w-20 sm:h-20 object-contain relative drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide text-[color:var(--app-text)]">
          Verification
        </h3>
        <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-1 max-w-xs">
          Enter the code to proceed
        </p>
      </div>

      {/* Status message */}
      {timeLeft <= 0 ? (
        <p className="text-xs text-rose-500 font-medium text-center">
          Verification code has expired.
        </p>
      ) : message ? (
        <p className="text-xs text-cyan-600 dark:text-cyan-400 text-center">{message}</p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleOtpVerify(otp.join(""));
        }}
        className="mt-4 space-y-4"
      >
        <div className="flex justify-between gap-1.5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (otpInputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={timeLeft <= 0 || isSubmitting}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              onPaste={handleOtpPaste}
              className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border transition-all ${
                timeLeft <= 0
                  ? "opacity-35 cursor-not-allowed bg-slate-100/40 dark:bg-white/5 border-slate-200 dark:border-white/5 pointer-events-none"
                  : digit
                  ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-500 ring-2 ring-cyan-500/20"
                  : "bg-[color:var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--app-text)]"
              } focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
            />
          ))}
        </div>

        {timeLeft > 0 && (
          <div className="flex items-center justify-center text-xs px-1">
            <span
              className={`font-mono text-sm tracking-widest font-bold ${
                timeLeft < 20
                  ? "text-rose-500 animate-pulse"
                  : "text-cyan-600/80 dark:text-cyan-400/80"
              }`}
            >
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}

        {timeLeft > 0 && error && <p className="text-sm text-rose-500 text-center">{error}</p>}

        {timeLeft <= 0 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full rounded-xl h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base disabled:opacity-50 cursor-pointer"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || otp.some((d) => d === "")}
            className="w-full rounded-xl h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        )}
      </form>
    </>
  );
}
