"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ApiResponse, ArticleCommentsData } from "@/types";
import { formatDate } from "@/lib/site";

export function CommentSection({ slug }: { slug: string }) {
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const comments = useQuery({
    queryKey: ["comments", slug],
    queryFn: async () => {
      const response = await fetch(`/api/backend/articles/${encodeURIComponent(slug)}/comments`, { credentials: "include" });
      const body = await response.json() as ApiResponse<ArticleCommentsData>;
      if (!response.ok || !body.success) throw new Error(!body.success ? body.error.message : "Không thể tải bình luận");
      return body.data;
    },
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/backend/articles/${encodeURIComponent(slug)}/comments`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), email: form.get("email"), content: form.get("content") }),
    });
    const body = await response.json().catch(() => null) as ApiResponse<unknown> | null;
    setSending(false);
    if (!response.ok || !body?.success) { setMessage(body && !body.success ? body.error.message : "Gửi bình luận thất bại"); return; }
    event.currentTarget.reset(); setMessage("Bình luận đã được gửi và đang chờ kiểm duyệt.");
    await client.invalidateQueries({ queryKey: ["comments", slug] });
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-2xl font-black">Bình luận</h2>
      <form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl bg-slate-100 p-5 sm:grid-cols-2">
        <label className="field-label">Tên hiển thị<input className="field-input" name="name" required maxLength={80} /></label>
        <label className="field-label">Email<input className="field-input" name="email" type="email" required maxLength={254} /></label>
        <label className="field-label sm:col-span-2">Nội dung<textarea className="field-input min-h-28" name="content" required minLength={3} maxLength={2000} /></label>
        <div className="sm:col-span-2"><button disabled={sending} className="btn-primary">{sending ? "Đang gửi…" : "Gửi bình luận"}</button>{message && <p className="mt-3 text-sm" role="status">{message}</p>}</div>
      </form>
      {comments.isLoading && <p className="mt-6 text-slate-500">Đang tải bình luận…</p>}
      {comments.isError && <p className="mt-6 text-red-700" role="alert">Không thể tải bình luận.</p>}
      <div className="mt-6 divide-y divide-slate-200">
        {comments.data?.items.map((comment) => <article key={comment.id} className="py-5"><div className="flex justify-between gap-3"><strong>{comment.name}</strong><time className="text-sm text-slate-500" dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></div><p className="mt-2 whitespace-pre-wrap text-slate-700">{comment.content}</p></article>)}
      </div>
    </section>
  );
}
