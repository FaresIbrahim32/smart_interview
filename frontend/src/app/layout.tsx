import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppTransitionShell } from "@/components/theme/app-transition-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Interview - AI-Powered Interview Practice",
  description: "Practice technical and behavioral interviews with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <AppTransitionShell>{children}</AppTransitionShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
