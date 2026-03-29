"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ScanSearch, Settings2, Sparkles, LogOut, Mic } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(87,225,164,0.10),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.08),_transparent_18%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  smart interview
                </p>
                <p className="text-sm text-slate-400">
                  Consistent prep studio across every workflow
                </p>
              </div>
            </Link>
          </div>

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
                        ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-11 rounded-2xl border-white/10 bg-transparent px-5 text-slate-100 hover:bg-white/5"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 py-8">{children}</div>
      </div>
    </div>
  );
}
