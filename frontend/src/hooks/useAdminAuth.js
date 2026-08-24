import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { verifyOrSetupPassword, logoutAdmin } from "../lib/adminAccess";

/**
 * Manages admin authentication state and Supabase auth listeners.
 */
export function useAdminAuth() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Check existing session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAdminUnlocked(true);
      }
      setIsAuthChecking(false);
    }).catch(() => {
      setIsAuthChecking(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setIsAdminUnlocked(true);
      } else if (event === "SIGNED_OUT") {
        setIsAdminUnlocked(false);
      }
      setIsAuthChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAdminAuth = async (password) => {
    if (!password || password.length < 4) {
      return { ok: false, message: "Password must be at least 4 characters." };
    }

    const verify = await verifyOrSetupPassword(password);
    if (!verify.ok) {
      return { ok: false, message: verify.message || "Wrong admin password." };
    }

    setIsAdminUnlocked(true);
    return { ok: true };
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdminUnlocked(false);
  };

  return {
    isAdminUnlocked,
    setIsAdminUnlocked,
    isAuthChecking,
    handleAdminAuth,
    handleLogout,
  };
}
