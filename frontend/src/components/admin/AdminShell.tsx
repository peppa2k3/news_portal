"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminSession } from "./AdminSession";
import type { UserRole } from "@/types";

const links: { href: string; label: string; roles?: UserRole[] }[] = [
  { href: "/admin/dashboard", label: "Tổng quan" }, { href: "/admin/articles", label: "Bài viết" },
  { href: "/admin/categories", label: "Danh mục", roles: ["super_admin", "editor"] }, { href: "/admin/tags", label: "Thẻ", roles: ["super_admin", "editor"] },
  { href: "/admin/authors", label: "Tác giả", roles: ["super_admin", "editor"] }, { href: "/admin/media", label: "Thư viện media" },
  { href: "/admin/comments", label: "Bình luận", roles: ["super_admin", "editor"] }, { href: "/admin/users", label: "Người dùng", roles: ["super_admin"] },
  { href: "/admin/audit", label: "Nhật ký", roles: ["super_admin"] }, { href: "/admin/settings", label: "Cài đặt", roles: ["super_admin"] },
  { href: "/admin/profile", label: "Hồ sơ của tôi" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminSession(); const pathname = usePathname();
  return <div className="admin-root min-h-screen bg-slate-100 lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="bg-slate-950 p-5 text-slate-200 lg:min-h-screen"><Link href="/admin/dashboard" className="text-xl font-black text-white">NEWS<span className="text-red-500">CMS</span></Link><p className="mt-2 text-xs text-slate-400">{user?.full_name} · {user?.role}</p><nav className="mt-7 grid gap-1" aria-label="Quản trị">{links.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${pathname.startsWith(item.href) ? "bg-red-600 text-white" : "hover:bg-slate-800"}`}>{item.label}</Link>)}</nav><button type="button" className="mt-8 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800" onClick={() => void logout()}>Đăng xuất</button></aside>
    <section className="min-w-0 p-4 sm:p-7 lg:p-9">{children}</section>
  </div>;
}
