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
    <Card className="app-panel rounded-[32px] shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl app-text-primary">Log in</CardTitle>
        <CardDescription className="text-base leading-7 app-text-muted">
          Access your saved setup, resume screening, and interview sessions.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="app-text-secondary">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="app-input h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="app-text-secondary">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="app-input h-12 rounded-2xl"
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
            className="app-primary-button h-12 w-full rounded-2xl text-base font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <p className="text-center text-sm app-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 app-text-secondary hover:opacity-80"
            >
              Sign up <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
