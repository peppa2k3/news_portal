"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/types";
import { adminApi } from "@/services/admin-api";

type Session = { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const Context = createContext<Session | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const pathname = usePathname(); const router = useRouter();
  const refresh = useCallback(async () => { try { setUser(await adminApi<User>("/auth/me")); } catch { setUser(null); } finally { setLoading(false); } }, []);
  useEffect(() => {
    adminApi<User>("/auth/me")
      .then((account) => setUser(account))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (!loading && !user && !pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/forgot-password") && !pathname.startsWith("/admin/reset-password")) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`); }, [loading, user, pathname, router]);
  const logout = useCallback(async () => { try { await adminApi("/auth/logout", { method: "POST", body: "{}" }); } finally { setUser(null); router.replace("/admin/login"); router.refresh(); } }, [router]);
  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAdminSession() { const value = useContext(Context); if (!value) throw new Error("AdminSessionProvider missing"); return value; }

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminSession();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return null;
  return <>{children}</>;
}
