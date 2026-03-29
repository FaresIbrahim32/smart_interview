import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
        <header className="app-header flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
              <Sparkles className="h-5 w-5 app-text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight app-text-primary">
                smart interview
              </p>
              <p className="text-sm app-text-muted">Sign in to continue practicing.</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm transition app-text-secondary hover:opacity-80"
            >
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <section className="w-full max-w-md">{children}</section>
        </div>
      </div>
    </div>
  );
}
