import { Eye, EyeSlash } from "iconsax-react";

export default function AdminForgotResetView({
  view,
  setView,
  code,
  setCode,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  error,
  message,
  isSubmitting,
  handleForgot,
  handleReset,
}) {
  if (view === "forgot") {
    return (
      <>
        <h3 className="text-xl font-bold">Forgot Password</h3>
        <p className="text-sm text-[color:var(--app-muted)] mt-1">
          A reset code will be sent to semsila.dev@gmail.com
        </p>
        <form onSubmit={handleForgot} className="mt-6 space-y-4">
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl h-11 bg-cyan-600 text-white font-bold disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </button>
          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full text-sm text-[color:var(--app-muted)] cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      </>
    );
  }

  if (view === "reset") {
    return (
      <>
        <h3 className="text-xl font-bold">Reset Password</h3>
        <p className="text-sm text-[color:var(--app-muted)] mt-1">
          Enter the 6-digit code from your email and your new password.
        </p>
        <form onSubmit={handleReset} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)] font-medium">6-Digit Code</span>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] text-center tracking-widest text-lg font-bold"
              placeholder="000000"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)] font-medium">New Password</span>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-xl pl-3 pr-10 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {message && <p className="text-sm text-emerald-500 font-medium">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl h-11 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Resetting..." : "Update Password"}
          </button>
          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full text-sm text-[color:var(--app-muted)] cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      </>
    );
  }

  return null;
}
