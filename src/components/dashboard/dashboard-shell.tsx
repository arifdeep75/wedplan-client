"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Heart } from "lucide-react";

import type { AuthUser } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/auth-client";

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardNav {
  items: DashboardNavItem[];
  active: string;
  onSelect: (id: string) => void;
}

interface DashboardShellProps {
  kicker: string;
  title: ReactNode;
  description?: string;
  user?: AuthUser;
  actions?: ReactNode;
  nav?: DashboardNav;
  children: ReactNode;
}

// Shared layout for every dashboard: editorial header, a role-based sidebar
// and a consistent responsive content area. The sidebar is vertical on
// desktop and a scrollable tab strip on mobile.
export default function DashboardShell({
  kicker,
  title,
  description,
  user,
  actions,
  nav,
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

              <span className="border border-[#e9e7e4] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999999]">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar + content */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:self-start lg:py-10">
            {nav && (
              <nav
                aria-label="Dashboard sections"
                className="-mx-5 flex gap-1.5 overflow-x-auto border-b border-[#e9e7e4] px-5 py-4 md:mx-0 md:px-0 lg:mx-0 lg:flex-col lg:gap-1 lg:border-0 lg:py-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {nav.items.map((item) => {
                  const Icon = item.icon;
                  const active = nav.active === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => nav.onSelect(item.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex shrink-0 items-center gap-2.5 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                        active
                          ? "bg-[#252525] text-white"
                          : "text-[#737373] hover:bg-white hover:text-[#252525]"
                      }`}
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.6}
                        className={active ? "text-[#e8dcd8]" : "text-[#b9a6a0]"}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>

                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span
                          className={`ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none ${
                            active
                              ? "bg-white text-[#252525]"
                              : "bg-[#252525] text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {user && (
              <div className="mt-6 hidden space-y-1 border-t border-[#e9e7e4] pt-5 lg:block">
                <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b9a6a0]">
                  Quick links
                </p>

                <SideLink href={dashboardPath(user.role)} label="Dashboard" />
                <SideLink href="/profile" label="Profile settings" />
                <SideLink href="/services" label="Browse services" />
              </div>
            )}
          </aside>

          <main className="min-w-0 py-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SideLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between px-4 py-2 text-xs font-medium text-[#737373] transition-colors hover:text-[#252525]"
    >
      {label}
      <ArrowUpRight
        size={13}
        className="text-[#c9bcb7] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
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
