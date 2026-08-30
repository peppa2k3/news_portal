"use client";

import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const data = { title, url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(data.url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return <button type="button" onClick={share} className="btn-secondary" aria-live="polite">{copied ? "Đã sao chép" : "Chia sẻ"}</button>;
}
