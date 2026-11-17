"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Mirrors the `user.additionalFields` configuration in the server's
// Better Auth instance (wedplan-server/src/lib/auth.ts) so the client
// knows about `role`, `isBlocked` and `subscriptionPlan`.
export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "customer",
          input: true,
        },
        isBlocked: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
        subscriptionPlan: {
          type: "string",
          defaultValue: "free",
          input: false,
        },
      },
    }),
  ],
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "customer" | "vendor" | "admin" | null;
};

// The role always comes from the authenticated session returned by the
// server — never from an unverified client value.
export function dashboardPath(role?: string | null): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "vendor") return "/dashboard/vendor";
  return "/dashboard/customer";
}
