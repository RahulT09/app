"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    api
      .get<User>("/profile/me")
      .then((data) => {
        setUser(data);
        setName(data.name);
        setPhoneNumber(data.phoneNumber ?? "");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login?next=/profile");
        }
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (name.trim().length < 2) {
      setErrors({ name: "At least 2 characters" });
      return;
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      setErrors({ phoneNumber: "Enter a 10-digit phone number" });
      return;
    }

    setSaving(true);
    try {
      const updated = await api.patch<User>("/profile/me", {
        name: name.trim(),
        phoneNumber: phoneNumber || "",
      });
      setUser(updated);
      show("Profile updated");
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "Couldn't update profile" });
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-ink/50">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>

      <div className="mt-6 flex items-center gap-2 rounded-sm border border-line bg-white px-4 py-3 text-sm">
        {user.emailVerified ? (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
            <span className="text-ink/70">Email verified</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-4 w-4 shrink-0 text-brick" />
            <span className="text-ink/70">Email not verified</span>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-sm border border-line bg-white p-5">
        <Input id="email" label="Email" value={user.email} disabled className="bg-paper text-ink/50" />
        <Input
          id="name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          id="phoneNumber"
          label="Phone number"
          inputMode="numeric"
          placeholder="10-digit number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={errors.phoneNumber}
        />
        {errors.form && <p className="text-sm text-brick">{errors.form}</p>}
        <Button type="submit" disabled={saving} className="mt-1">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-ink/40">
        Member since {user.createdAt ? formatDate(user.createdAt) : "—"}
      </p>
    </div>
  );
}
