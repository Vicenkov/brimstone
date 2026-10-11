import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { MotionProvider } from "@/components/layout/MotionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brimstone",
  description: "Trợ lý trò chuyện AI Brimstone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="relative isolate min-h-dvh">
        <MotionProvider>
          <AnimatedBackground />
          <div className="relative z-10 min-h-dvh">{children}</div>
        </MotionProvider>
      </body>
    </html>
  );
}