import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Test Ease",
  description: "Your Next.js app with Supabase and React Query",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <RootErrorBoundary>
          <Providers>
            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
