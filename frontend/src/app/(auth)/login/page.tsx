"use client";

export const runtime = "edge";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-[32px] border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-100">
          Welcome back
        </div>
        <CardTitle className="text-3xl text-white">Log in to your prep studio</CardTitle>
        <CardDescription className="text-base leading-7 text-slate-400">
          Pick up where you left off with saved resumes, screening results, and mock
          interview sessions.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-2xl border-white/10 bg-[#081017] text-white placeholder:text-slate-500 focus-visible:ring-emerald-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-2xl border-white/10 bg-[#081017] text-white placeholder:text-slate-500 focus-visible:ring-emerald-300"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-emerald-400 text-base font-semibold text-[#092014] hover:bg-emerald-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-emerald-200 transition hover:text-white"
            >
              Sign up <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
