"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { authClient, dashboardPath, type AuthUser } from "@/lib/auth-client";

// Landing page after Google OAuth completes. The session returned by the
// server decides where the user is sent — never a client-supplied role.
export default function AuthCompletePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;

  useEffect(() => {
    if (isPending) return;

    if (user) {
      router.replace(dashboardPath(user.role));
    } else {
      router.replace("/sign-in");
    }
  }, [isPending, user, router]);

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f4f4f2] px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 size={22} className="animate-spin text-[#b9a6a0]" />
        <p className="font-heading text-2xl text-[#252525]">
          Signing you in…
        </p>
        <p className="text-sm text-[#737373]">One moment, please.</p>
      </div>
    </div>
  );
}
