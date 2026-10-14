import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/toolkit/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Everything ZCode",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ZCode",
    "Z.ai",
    "GLM",
    "агенты",
    "скиллы",
    "хуки",
    "Next.js",
    "AI development",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Everything ZCode",
    description:
      "Агенты, команды, скиллы, правила и хуки для ZCode / Z.ai — конфиги из реальной разработки.",
    url: "/",
    siteName: "Everything ZCode",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything ZCode",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground flex flex-col`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
