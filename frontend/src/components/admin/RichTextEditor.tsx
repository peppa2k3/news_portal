"use client";
import { useEffect, useRef } from "react";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  const command = (name: string, argument?: string) => { ref.current?.focus(); document.execCommand(name, false, argument); onChange(ref.current?.innerHTML || ""); };
  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white"><div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2" aria-label="Công cụ soạn thảo"><button type="button" className="rounded px-3 py-1 font-bold hover:bg-slate-200" onClick={() => command("bold")}>B</button><button type="button" className="rounded px-3 py-1 italic hover:bg-slate-200" onClick={() => command("italic")}>I</button><button type="button" className="rounded px-3 py-1 hover:bg-slate-200" onClick={() => command("formatBlock", "h2")}>H2</button><button type="button" className="rounded px-3 py-1 hover:bg-slate-200" onClick={() => command("formatBlock", "blockquote")}>Trích dẫn</button><button type="button" className="rounded px-3 py-1 hover:bg-slate-200" onClick={() => command("insertUnorderedList")}>Danh sách</button><button type="button" className="rounded px-3 py-1 hover:bg-slate-200" onClick={() => { const url = window.prompt("URL liên kết (https://)"); if (url?.startsWith("https://")) command("createLink", url); }}>Liên kết</button></div><div ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" className="article-content min-h-96 p-5 outline-none" onInput={(event) => onChange(event.currentTarget.innerHTML)} /></div>;
}
