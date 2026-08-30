"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug, initialCount }: { slug: string; initialCount: string }) {
  const [count, setCount] = useState(initialCount);
  useEffect(() => {
    const key = `viewed:${slug}`;
    const post = async () => {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      const response = await fetch(`/api/backend/articles/${encodeURIComponent(slug)}/views`, { method: "POST", credentials: "include" });
      const body = await response.json().catch(() => null) as { success?: boolean; data?: { view_count?: string } } | null;
      if (body?.success && body.data?.view_count) setCount(body.data.view_count);
    };
    void post();
  }, [slug]);
  return <span>{count} lượt xem</span>;
}
