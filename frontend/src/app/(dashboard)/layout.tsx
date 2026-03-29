"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Mic, ScanSearch, Settings2, Sparkles } from "lucide-react";
<<<<<<< HEAD
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
=======
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/setup", label: "Setup", icon: Settings2 },
  { href: "/screen", label: "Screen", icon: ScanSearch },
  { href: "/interview", label: "Interview", icon: Mic },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("interview_chunks");
    localStorage.removeItem("interview_language");
    router.push("/");
  };

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-border/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card/80">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                smart interview
              </p>
              <p className="text-sm text-muted-foreground">
                Consistent prep studio across every workflow
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
                      active
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-border/70 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-11 rounded-2xl border-border/70 bg-transparent px-5 text-foreground hover:bg-accent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <PageTransition className="flex-1 py-8">{children}</PageTransition>
=======
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header flex flex-col gap-6 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="app-panel-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                <Sparkles className="h-5 w-5 app-text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight app-text-primary">
                  smart interview
                </p>
                <p className="text-sm app-text-muted">Interview preparation workspace</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="app-secondary-button h-11 rounded-2xl px-5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
                    active
                      ? "app-chip"
                      : "app-panel-soft app-text-secondary hover:opacity-90"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 py-10">{children}</div>
>>>>>>> 42efe1bb243244ae35ef5b91d278e6d44e8f85df
      </div>
    </div>
  );
}
