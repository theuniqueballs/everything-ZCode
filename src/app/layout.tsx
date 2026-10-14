import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/toolkit/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Everything ZCode — конфиги для ZCode / Z.ai",
  description:
    "Полная коллекция production-ready конфигов для ZCode / Z.ai: агенты, команды, скиллы, правила, хуки и контексты для продуктивной AI-разработки с моделями GLM.",
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
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Everything ZCode",
    description:
      "Агенты, команды, скиллы, правила и хуки для ZCode / Z.ai — конфиги из реальной разработки.",
    siteName: "Everything ZCode",
    type: "website",
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
