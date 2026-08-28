import { Eye, EyeSlash } from "iconsax-react";

export default function AdminLoginView({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  lastFailedPassword,
  error,
  isSubmitting,
  handleLogin,
  onForgotPassword,
}) {
  const isPasswordBlocked = !!(lastFailedPassword && password === lastFailedPassword);

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center pt-2 mb-6">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 pointer-events-none" />
          <img
            src="https://img.icons8.com/3d-fluency/188/lock-2.png"
            alt="Admin Access"
            className="w-18 h-18 sm:w-20 sm:h-20 object-contain relative drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-2xl font-bold font-['Racing_Sans_One',sans-serif] tracking-wide text-[color:var(--app-text)]">
          Admin Login
        </h3>
        <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-1 max-w-xs">
          Enter password to open dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block text-sm">
          <span className="text-[color:var(--app-muted)] font-medium">Password</span>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLogin(e);
                }
              }}
              enterKeyHint="go"
              className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            disabled={isSubmitting || !password || isPasswordBlocked}
            className={`w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-base transition-all ${
              isPasswordBlocked
                ? "opacity-30 cursor-not-allowed filter blur-[1px] pointer-events-none"
                : "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            }`}
          >
            {isSubmitting ? "Checking..." : "Login"}
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline text-center cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </>
  );
}
