"use client";

export const runtime = "edge";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

const benefits = [
  "Save your resume-driven interview setup",
  "Switch between English, Spanish, and ASL support",
  "Return to screening and mock sessions anytime",
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: fullName,
          language_preference: "english",
        });

        if (profileError) throw profileError;

        router.push("/setup");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-[32px] border-white/10 bg-[#0d141b] shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
          Create account
        </div>
        <CardTitle className="text-3xl text-white">Start practicing with Smart Interview</CardTitle>
        <CardDescription className="text-base leading-7 text-slate-400">
          Create your account, upload your resume, and move straight into realistic
          mock sessions built around your background.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSignup}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-200">
              Full name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-2xl border-white/10 bg-[#081017] text-white placeholder:text-slate-500 focus-visible:ring-emerald-300"
            />
          </div>

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
              minLength={6}
              className="h-12 rounded-2xl border-white/10 bg-[#081017] text-white placeholder:text-slate-500 focus-visible:ring-emerald-300"
            />
            <p className="text-xs text-slate-500">Use at least 6 characters.</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="mb-3 text-sm font-medium text-slate-200">What you unlock</p>
            <div className="space-y-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-sm text-slate-400">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-emerald-200 transition hover:text-white"
            >
              Log in <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
