"use client";
import { useQuery } from "@tanstack/react-query"; import { useState } from "react"; import { adminApi } from "@/services/admin-api"; import type { SiteSettings } from "@/types"; import { AdminPageHeader } from "./AdminPageHeader";

export function SettingsForm() {
  const query = useQuery({ queryKey: ["settings"], queryFn: () => adminApi<SiteSettings>("/admin/settings") });
  if (query.isLoading) return <p>Đang tải cài đặt…</p>;
  if (query.isError) return <p className="text-red-700">{query.error.message}</p>;
  return <SettingsEditor key={JSON.stringify(query.data)} initial={query.data!} />;
}

function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState(initial); const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) { e.preventDefault(); if (form.maintenance_mode && !window.confirm("Bật chế độ bảo trì sẽ ảnh hưởng độc giả. Tiếp tục?")) return; try { const saved = await adminApi<SiteSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(form) }); setForm(saved); setMessage("Đã lưu cài đặt."); } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể lưu"); } }
  return <><AdminPageHeader title="Cài đặt website" description="Chỉ lưu cấu hình không nhạy cảm; secret nằm trong môi trường triển khai." /><form onSubmit={submit} className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm"><div className="grid gap-4"><label className="field-label">Tên website<input className="field-input" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} /></label><label className="field-label">Mô tả<textarea className="field-input" value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} /></label><label className="field-label">Email liên hệ<input className="field-input" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></label><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={form.comments_enabled} onChange={(e) => setForm({ ...form, comments_enabled: e.target.checked })} /> Bật bình luận</label><label className="flex items-center gap-2 font-bold text-red-700"><input type="checkbox" checked={form.maintenance_mode} onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })} /> Chế độ bảo trì</label>{message && <p role="status">{message}</p>}<button className="btn-primary">Lưu cài đặt</button></div></form></>;
}
