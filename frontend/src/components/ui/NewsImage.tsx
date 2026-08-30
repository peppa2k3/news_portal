interface NewsImageProps {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function NewsImage({ src, alt, priority = false, className = "" }: NewsImageProps) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {src ? (
        // Remote media hosts are controlled by the backend media allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={1200}
          height={675}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-sm text-slate-500">Chưa có ảnh</div>
      )}
    </div>
  );
}
