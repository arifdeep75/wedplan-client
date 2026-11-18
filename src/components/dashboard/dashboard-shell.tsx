"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";

import type { AuthUser } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/auth-client";

interface DashboardShellProps {
  kicker: string;
  title: ReactNode;
  description?: string;
  user?: AuthUser;
  actions?: ReactNode;
  children: ReactNode;
}

// Shared layout for every dashboard: editorial header, identity, quick links,
// and a consistent responsive content area.
export default function DashboardShell({
  kicker,
  title,
  description,
  user,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="bg-[#fafaf8]">
      {/* Header */}
      <div className="border-b border-[#e9e7e4] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:py-12 md:px-8 lg:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
                <span className="h-px w-8 bg-[#d8c8c3]" />
                {kicker}
              </p>

              <h1 className="font-heading text-3xl leading-tight text-[#252525] sm:text-4xl md:text-5xl">
                {title}
              </h1>

              {description && (
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#737373]">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {user && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0eeeb] pt-5">
              <div className="flex min-w-0 items-center gap-3">
                <HeaderAvatar user={user} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#252525]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-[#999999]">{user.email}</p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold">
                <Link
                  href={dashboardPath(user.role)}
                  className="text-[#252525] transition-colors hover:text-[#b9a6a0]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-[#737373] transition-colors hover:text-[#252525]"
                >
                  Profile settings
                </Link>
                <Link
                  href="/services"
                  className="text-[#737373] transition-colors hover:text-[#252525]"
                >
                  Browse services
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-12 md:px-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}

function HeaderAvatar({ user }: { user: AuthUser }) {
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name || "Profile"}
        className="h-11 w-11 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] text-[#b9a6a0]">
      <Heart size={17} strokeWidth={1.6} />
    </span>
  );
}
