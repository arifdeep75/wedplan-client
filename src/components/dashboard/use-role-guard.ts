"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient, dashboardPath, type AuthUser } from "@/lib/auth-client";

type Role = "customer" | "vendor" | "admin";

/**
 * Client-side role guard. The API enforces authorization server-side; this
 * only keeps users on the dashboard that matches their session role.
 * Returns `ready` once the session is resolved and the role matches.
 */
export function useRoleGuard(role: Role) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = (session?.user as AuthUser | undefined) ?? undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (user.role !== role) {
      router.replace(dashboardPath(user.role));
    }
  }, [isPending, user, role, router]);

  return {
    user,
    ready: !isPending && Boolean(user) && user?.role === role,
  };
}

/**
 * Any authenticated user (used by /profile).
 */
export function useAuthGuard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = (session?.user as AuthUser | undefined) ?? undefined;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/sign-in");
    }
  }, [isPending, user, router]);

  return {
    user,
    ready: !isPending && Boolean(user),
  };
}
