import type { Metadata } from "next";
import { AdminSessionProvider } from "@/components/admin/AdminSession";
export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | News CMS" }, robots: { index: false, follow: false, noarchive: true } };
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminSessionProvider>{children}</AdminSessionProvider>; }
