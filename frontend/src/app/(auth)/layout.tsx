import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
              <Sparkles className="h-5 w-5 app-text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-tight app-text-primary">
                smart interview
              </p>
              <p className="text-sm app-text-muted">Sign in to continue your interview prep.</p>
            </div>
          </Link>

          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-md">{children}</section>
        </div>
      </div>
    </div>
  );
}
