export const siteUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return value || "http://localhost:3000";
};

export const absoluteUrl = (path: string) =>
  new URL(path.startsWith("/") ? path : `/${path}`, siteUrl()).toString();

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "Chưa xác định";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa xác định";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
