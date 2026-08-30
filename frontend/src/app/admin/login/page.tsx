"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminApi } from "@/services/admin-api";
import { useAdminSession } from "@/components/admin/AdminSession";

const schema = z.object({ email: z.email("Email không hợp lệ"), password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự") });
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const router = useRouter(); const search = useSearchParams(); const { refresh } = useAdminSession();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const submit = form.handleSubmit(async (values) => { try { await adminApi("/auth/login", { method: "POST", body: JSON.stringify(values) }); await refresh(); const next = search.get("next"); router.replace(next?.startsWith("/admin/") ? next : "/admin/dashboard"); router.refresh(); } catch (error) { form.setError("root", { message: error instanceof Error ? error.message : "Đăng nhập thất bại" }); } });
  return <main className="admin-root flex min-h-screen items-center justify-center bg-slate-950 px-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl"><p className="text-sm font-bold uppercase tracking-widest text-red-600">News CMS</p><h1 className="mt-2 text-3xl font-black">Đăng nhập quản trị</h1><div className="mt-6 grid gap-4"><label className="field-label">Email<input className="field-input" type="email" autoComplete="username" {...form.register("email")} />{form.formState.errors.email && <span className="text-red-700">{form.formState.errors.email.message}</span>}</label><label className="field-label">Mật khẩu<input className="field-input" type="password" autoComplete="current-password" {...form.register("password")} />{form.formState.errors.password && <span className="text-red-700">{form.formState.errors.password.message}</span>}</label>{form.formState.errors.root && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{form.formState.errors.root.message}</p>}<button disabled={form.formState.isSubmitting} className="btn-primary w-full">{form.formState.isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}</button><LinkFallback /></div></form></main>;
}
function LinkFallback() { return <a className="text-center text-sm font-semibold text-red-700" href="/admin/forgot-password">Quên mật khẩu?</a>; }
