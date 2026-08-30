import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/components/providers/AppProviders";
import { absoluteUrl, siteUrl } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "News Portal",
    template: "%s | News Portal",
  },
  description: "Tin tức mới nhất, chính xác và đáng tin cậy.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "News Portal", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppProviders><Header />{children}<Footer /></AppProviders>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "News Portal", url: absoluteUrl("/") }).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
