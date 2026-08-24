import { useState, useEffect } from "react";

/**
 * Manages the admin toast notification state with auto-dismiss.
 */
export function useAdminToast() {
  const [adminToast, setAdminToast] = useState(null);

  useEffect(() => {
    if (!adminToast) return undefined;
    const timer = setTimeout(() => setAdminToast(null), 2600);
    return () => clearTimeout(timer);
  }, [adminToast]);

  const showAdminToast = (title, detail = "", type = "success") => {
    setAdminToast({
      id: crypto.randomUUID(),
      title,
      detail,
      type,
    });
  };

  return { adminToast, setAdminToast, showAdminToast };
}
