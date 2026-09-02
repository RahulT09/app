"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api-client";
import { registerSchema } from "@/lib/validation";

type Errors = Partial<Record<"name" | "email" | "password" | "phoneNumber" | "form", string>>;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Errors = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        ...result.data,
        phoneNumber: result.data.phoneNumber || undefined,
      });
      setDone(true);
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong" });
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
            We sent a verification link to <strong className="text-ink">{form.email}</strong>.
            Verify your email, then log in.
          </p>
          <Link href="/login" className="mt-2 text-sm font-medium text-forest hover:underline">
            Go to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Mandi to start shopping.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="name"
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          id="phoneNumber"
          label="Phone number (optional)"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="10-digit number"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          error={errors.phoneNumber}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        {errors.form && <p className="text-sm text-brick">{errors.form}</p>}
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-forest hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
