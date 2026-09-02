import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { backendJson } from "@/lib/backend";
import { AuthCard } from "@/components/auth/AuthCard";
import type { ApiResponse } from "@/lib/types";

async function verify(token: string) {
  const res = await backendJson<ApiResponse<null>>(`/api/auth/verify-email/${token}`, {
    method: "GET",
  });
  return res.status === 200 && !!res.body?.success;
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const success = await verify(token);

  return (
    <AuthCard title={success ? "Email verified" : "Verification failed"}>
      <div className="flex flex-col items-center gap-3 rounded-sm border border-line bg-white p-8 text-center">
        {success ? (
          <>
            <CheckCircle2 className="h-8 w-8 text-forest" strokeWidth={1.5} />
            <p className="text-sm text-ink/70">Your email is verified. You can log in now.</p>
            <Link href="/login" className="mt-2 text-sm font-medium text-forest hover:underline">
              Go to login
            </Link>
          </>
        ) : (
          <>
            <XCircle className="h-8 w-8 text-brick" strokeWidth={1.5} />
            <p className="text-sm text-ink/70">
              This link is invalid or has expired. Request a new one by trying to log in.
            </p>
            <Link href="/login" className="mt-2 text-sm font-medium text-forest hover:underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthCard>
  );
}
