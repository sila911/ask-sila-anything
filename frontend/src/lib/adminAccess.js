import { supabase } from "./supabase";

const ADMIN_EMAIL = "semsila.dev@gmail.com";
const TWO_FACTOR_KEY = "sila_admin_2fa_verified";

export function is2FAVerified() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TWO_FACTOR_KEY) === "true";
}

export function set2FAVerified(verified = true) {
  if (typeof window === "undefined") return;
  if (verified) {
    sessionStorage.setItem(TWO_FACTOR_KEY, "true");
  } else {
    sessionStorage.removeItem(TWO_FACTOR_KEY);
  }
}

export function clear2FAVerified() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TWO_FACTOR_KEY);
}

export function hasAdminPassword() {
  // Check if there is an active session
  return !!supabase.auth.getSession();
}

export async function verifyOrSetupPassword(password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (data.session) {
      return { ok: true, created: false };
    }
  } catch (error) {
    return { ok: false, message: error.message };
  }
  return { ok: false, message: "Login failed." };
}

export async function requestTelegramOtp() {
  try {
    const res = await fetch("/api/telegram-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send" }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        message: data.message || "Failed to send OTP to Telegram.",
      };
    }
    return {
      ok: true,
      token: data.token,
      expiresAt: data.expiresAt,
      message: data.message || "Verification code sent to Telegram.",
    };
  } catch (error) {
    console.error("Error requesting Telegram OTP:", error);
    return {
      ok: false,
      message: "Network error sending OTP. Please try again.",
    };
  }
}

export async function verifyTelegramOtp(otp, token) {
  try {
    const res = await fetch("/api/telegram-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        otp: String(otp).trim(),
        token: token,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        message: data.message || "Invalid or expired OTP code.",
      };
    }
    set2FAVerified(true);
    return { ok: true, message: data.message || "2FA verified successfully." };
  } catch (error) {
    console.error("Error verifying Telegram OTP:", error);
    return {
      ok: false,
      message: "Network error verifying OTP. Please try again.",
    };
  }
}

export async function requestPasswordReset(inputEmail) {
  const email = (inputEmail || "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Email doesn't match");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL);
  if (error) throw new Error(error.message);
  return { message: "6-digit reset code sent to your Gmail!" };
}

export async function submitPasswordReset(code, newPassword, inputEmail) {
  const email = (inputEmail || ADMIN_EMAIL).trim().toLowerCase();
  const cleanCode = String(code).trim();

  if (!cleanCode || cleanCode.length < 6) {
    throw new Error("Please enter the full 6-digit verification code.");
  }
  if (!newPassword || newPassword.length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }

  // Verify OTP code with Supabase auth recovery
  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: cleanCode,
    type: "recovery",
  });

  if (error) {
    // Fallback attempt for email otp type
    const retry = await supabase.auth.verifyOtp({
      email: email,
      token: cleanCode,
      type: "email",
    });
    if (retry.error) {
      throw new Error(
        error.message ||
          retry.error.message ||
          "Invalid or expired 6-digit code.",
      );
    }
  }

  // Update password once OTP is verified
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) throw new Error(updateError.message);
  return { message: "Password reset successful! You can now unlock." };
}

export async function logoutAdmin() {
  clear2FAVerified();
  await supabase.auth.signOut();
}

// Legacy functions kept for compatibility
export async function createEncryptedAdminToken() {
  return "";
}
export async function validateEncryptedAdminToken() {
  return false;
}
