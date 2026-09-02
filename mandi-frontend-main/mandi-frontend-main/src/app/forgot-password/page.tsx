"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api-client";
import { forgotPasswordSchema } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", result.data);
      setDone(true);
    } catch (err) {
      // Still show success — don't reveal whether an email exists.
      if (err instanceof ApiError && err.status >= 500) {
        setError("Something went wrong. Try again in a moment.");
      } else {
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Check your inbox">
        <div className="flex flex-col items-center gap-3 rounded-sm border border-line bg-white p-8 text-center">
          <MailCheck className="h-8 w-8 text-forest" strokeWidth={1.5} />
          <p className="text-sm text-ink/70">
            If an account exists for <strong className="text-ink">{email}</strong>, we&apos;ve sent
            a link to reset your password.
          </p>
          <Link href="/login" className="mt-2 text-sm font-medium text-forest hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to set a new one.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/login" className="font-medium text-forest hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
