import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< HEAD
import { ThemeProvider } from "@/components/theme-provider";
=======
import { AppTransitionShell } from "@/components/theme/app-transition-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
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
<<<<<<< HEAD
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("smart-interview-theme") || "dark";
                  document.documentElement.dataset.theme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = "dark";
                }
              })();
            `,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
=======
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <AppTransitionShell>{children}</AppTransitionShell>
        </ThemeProvider>
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
      </body>
    </html>
  );
}
