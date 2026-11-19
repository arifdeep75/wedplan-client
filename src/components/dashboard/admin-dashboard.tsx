"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleDollarSign,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardShell, {
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import StatCard from "@/components/dashboard/stat-card";
import StatusBadge from "@/components/dashboard/status-badge";
import { useRoleGuard } from "@/components/dashboard/use-role-guard";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatPrice } from "@/lib/format";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBlocked: boolean;
  subscriptionPlan: string;
  businessName: string | null;
  createdAt: string | null;
}

interface AdminService {
  id: string;
  serviceName: string;
  category: string;
  price: number;
  location: string;
  image: string | null;
  status: string;
  isActive: boolean;
  vendor: {
    id: string;
    name: string;
    image: string | null;
    businessName: string | null;
  };
}

interface Stats {
  totalUsers: number;
  customers: number;
  vendors: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  totalBookings: number;
  pendingBookings: number;
  premiumVendors: number;
  totalTransactions: number;
  totalRevenue: number;
  paidTransactions: number;
}

interface AdminTransaction {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string | null;
  paidAt: string | null;
}

type LoadState = "loading" | "ready" | "error";
type Section = "overview" | "users" | "services" | "transactions";
type RoleFilter = "all" | "customer" | "vendor" | "admin";
type ServiceFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const { user, ready } = useRoleGuard("admin");

  const [section, setSection] = useState<Section>("overview");
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    let active = true;

    Promise.all([
      api<{ success: boolean; data: Stats }>("/api/admin/stats"),
      api<{ success: boolean; data: AdminUser[] }>("/api/admin/users"),
      api<{ success: boolean; data: AdminService[] }>("/api/services/admin/all"),
      api<{ success: boolean; data: AdminTransaction[] }>(
        "/api/admin/transactions"
      ),
    ])
      .then(([statsResult, usersResult, servicesResult, transactionsResult]) => {
        if (!active) return;
        setStats(statsResult.data);
        setUsers(usersResult.data);
        setServices(servicesResult.data);
        setTransactions(transactionsResult.data);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
      });

    return () => {
      active = false;
    };
  }, [ready, reloadKey]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      if (roleFilter !== "all" && item.role !== roleFilter) return false;

      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
      );
    });
  }, [users, search, roleFilter]);

  const sortedServices = useMemo(() => {
    const rank: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    const query = serviceSearch.trim().toLowerCase();

    return [...services]
      .filter((service) => {
        if (serviceFilter !== "all" && service.status !== serviceFilter) {
          return false;
        }

        if (!query) return true;

        return (
          service.serviceName.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.location.toLowerCase().includes(query) ||
          (service.vendor.businessName || service.vendor.name)
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3));
  }, [services, serviceSearch, serviceFilter]);

  const navItems: DashboardNavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "users",
      label: "Manage users",
      icon: Users,
      badge: users.length,
    },
    {
      id: "services",
      label: "Manage services",
      icon: Store,
      badge: stats?.pendingServices ?? 0,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: CircleDollarSign,
      badge: transactions.length,
    },
  ];

  function refresh() {
    setState("loading");
    setReloadKey((key) => key + 1);
  }

  async function toggleBlock(target: AdminUser) {
    setUpdatingUserId(target.id);

    try {
      await api(`/api/admin/users/${target.id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: !target.isBlocked }),
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === target.id
            ? { ...item, isBlocked: !item.isBlocked }
            : item
        )
      );

      toast.success(target.isBlocked ? "User unblocked" : "User blocked");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function moderateService(id: string, status: "approved" | "rejected") {
    setUpdatingServiceId(id);

    try {
      await api(`/api/services/admin/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      toast.success(`Service ${status}`);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update service"
      );
    } finally {
      setUpdatingServiceId(null);
    }
  }

  async function deleteService(id: string) {
    setUpdatingServiceId(id);

    try {
      await api(`/api/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted");
      setDeletingServiceId(null);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    } finally {
      setUpdatingServiceId(null);
    }
  }

  return (
    <DashboardShell
      kicker="Admin dashboard"
      title={
        <>
          Platform overview,
          <span className="italic text-[#b9a6a0]"> at a glance</span>
        </>
      }
      description="Moderate services, manage accounts, and keep WedPlan a trusted place to plan."
      user={user}
      nav={{
        items: navItems,
        active: section,
        onSelect: (id) => setSection(id as Section),
      }}
    >
      {/* OVERVIEW */}
      {section === "overview" && (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard
              label="Total users"
              value={state === "ready" && stats ? stats.totalUsers : "—"}
              hint={
                stats
                  ? `${stats.customers} customers · ${stats.vendors} vendors`
                  : undefined
              }
              icon={Users}
            />
            <StatCard
              label="Total vendors"
              value={state === "ready" && stats ? stats.vendors : "—"}
              hint={stats ? `${stats.premiumVendors} premium` : undefined}
              icon={Store}
            />
            <StatCard
              label="Total customers"
              value={state === "ready" && stats ? stats.customers : "—"}
              icon={Users}
            />
            <StatCard
              label="Total services"
              value={state === "ready" && stats ? stats.totalServices : "—"}
              hint={
                stats ? `${stats.pendingServices} pending review` : undefined
              }
              icon={ShieldCheck}
            />
            <StatCard
              label="Transactions"
              value={
                state === "ready" && stats ? stats.totalTransactions : "—"
              }
              hint={
                stats
                  ? `${formatCurrency(stats.totalRevenue)} collected`
                  : undefined
              }
              icon={CircleDollarSign}
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="border border-[#e9e7e4] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0eeeb] px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
                    Moderation queue
                  </p>
                  <h2 className="mt-1 font-heading text-xl text-[#252525]">
                    Pending review
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSection("services")}
                  className="text-xs font-semibold text-[#737373] transition hover:text-[#252525]"
                >
                  Manage all services
                </button>
              </div>

              {state === "ready" &&
                services.filter((service) => service.status === "pending")
                  .length === 0 && (
                  <p className="px-5 py-8 text-sm text-[#737373]">
                    Nothing is waiting for review right now.
                  </p>
                )}

              {state === "ready" &&
                services.filter((service) => service.status === "pending")
                  .length > 0 && (
                  <ul className="divide-y divide-[#f0eeeb]">
                    {services
                      .filter((service) => service.status === "pending")
                      .slice(0, 3)
                      .map((service) => (
                        <li
                          key={service.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#252525]">
                              {service.serviceName}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-[#999999]">
                              {service.vendor.businessName ||
                                service.vendor.name}{" "}
                              · {service.category}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                moderateService(service.id, "approved")
                              }
                              disabled={updatingServiceId === service.id}
                              className="inline-flex items-center gap-1.5 bg-[#252525] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#444444] disabled:opacity-60"
                            >
                              <Check size={12} />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moderateService(service.id, "rejected")
                              }
                              disabled={updatingServiceId === service.id}
                              className="inline-flex items-center gap-1.5 border border-[#e9e7e4] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373] transition hover:border-[#b91c1c] hover:text-[#b91c1c] disabled:opacity-60"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
            </div>

            <div className="border border-[#e9e7e4] bg-white p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
                Revenue
              </p>
              <h2 className="mt-2 font-heading text-3xl text-[#252525]">
                {stats ? formatCurrency(stats.totalRevenue) : "—"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#737373]">
                {stats
                  ? `${stats.paidTransactions} paid transactions · ${stats.premiumVendors} premium vendors`
                  : "Loading platform totals…"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f0eeeb] pt-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#999999]">
                    Bookings
                  </p>
                  <p className="mt-1 font-heading text-2xl text-[#252525]">
                    {stats ? stats.totalBookings : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#999999]">
                    Pending
                  </p>
                  <p className="mt-1 font-heading text-2xl text-[#252525]">
                    {stats ? stats.pendingBookings : "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSection("transactions")}
                className="mt-5 inline-flex items-center gap-2 border border-[#252525] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
              >
                View transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="mt-8 border border-[#e9e7e4] bg-white p-8 text-center">
          <p className="font-heading text-xl text-[#252525]">
            We couldn&rsquo;t load the admin data
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-5 border border-[#252525] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* USERS TAB */}
      {section === "users" && state !== "error" && (
        <div>
          <div className="mb-6 border-b border-[#e9e7e4] pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
              Accounts
            </p>
            <h2 className="mt-1 font-heading text-2xl text-[#252525]">
              Manage users
            </h2>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or role…"
                className="h-11 w-full border border-[#e9e7e4] bg-white pl-11 pr-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto sm:shrink-0">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "customer", label: "Customers" },
                  { id: "vendor", label: "Vendors" },
                  { id: "admin", label: "Admins" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRoleFilter(item.id)}
                  className={`h-11 shrink-0 border px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    roleFilter === item.id
                      ? "border-[#252525] bg-[#252525] text-white"
                      : "border-[#e9e7e4] bg-white text-[#737373] hover:border-[#c9bcb7] hover:text-[#252525]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {state === "loading" && (
            <div className="space-y-2" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse border border-[#e9e7e4] bg-white"
                />
              ))}
            </div>
          )}

          {state === "ready" && filteredUsers.length === 0 && (
            <div className="border border-[#e9e7e4] bg-white px-6 py-12 text-center text-sm text-[#737373]">
              {search.trim()
                ? `No users match “${search}”${roleFilter === "all" ? "" : ` in ${roleFilter}s`}.`
                : `No ${roleFilter === "all" ? "users" : `${roleFilter}s`} found.`}
            </div>
          )}

          {state === "ready" && filteredUsers.length > 0 && (
            <div className="divide-y divide-[#f0eeeb] border border-[#e9e7e4] bg-white">
              {filteredUsers.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <InitialAvatar image={item.image} name={item.name} />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[#252525]">
                          {item.name || "Unnamed user"}
                        </p>
                        <span className="border border-[#e9e7e4] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999999]">
                          {item.role}
                        </span>
                        {item.isBlocked && <StatusBadge status="blocked" />}
                      </div>

                      <p className="mt-1 truncate text-xs text-[#999999]">
                        {item.email}
                        {item.businessName ? ` · ${item.businessName}` : ""}
                      </p>

                      <p className="mt-1 text-[11px] text-[#bbbbbb]">
                        Joined {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {item.role === "admin" ? (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
                      Protected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleBlock(item)}
                      disabled={updatingUserId === item.id}
                      className={`shrink-0 self-start border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition disabled:opacity-60 sm:self-auto ${
                        item.isBlocked
                          ? "border-[#e9e7e4] text-[#252525] hover:border-[#252525]"
                          : "border-[#e9e7e4] text-[#737373] hover:border-[#b91c1c] hover:text-[#b91c1c]"
                      }`}
                    >
                      {updatingUserId === item.id
                        ? "Updating…"
                        : item.isBlocked
                          ? "Unblock"
                          : "Block"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SERVICES TAB */}
      {section === "services" && state !== "error" && (
        <div>
          <div className="mb-6 border-b border-[#e9e7e4] pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
              Moderation
            </p>
            <h2 className="mt-1 font-heading text-2xl text-[#252525]">
              Manage services
            </h2>
          </div>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />
              <input
                value={serviceSearch}
                onChange={(event) => setServiceSearch(event.target.value)}
                placeholder="Search by service, category, location, or vendor…"
                className="h-11 w-full border border-[#e9e7e4] bg-white pl-11 pr-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto lg:shrink-0">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceFilter(item.id)}
                  className={`h-11 shrink-0 border px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    serviceFilter === item.id
                      ? "border-[#252525] bg-[#252525] text-white"
                      : "border-[#e9e7e4] bg-white text-[#737373] hover:border-[#c9bcb7] hover:text-[#252525]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {state === "loading" && (
            <div className="space-y-2" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse border border-[#e9e7e4] bg-white"
                />
              ))}
            </div>
          )}

          {state === "ready" && sortedServices.length === 0 && (
            <div className="border border-[#e9e7e4] bg-white px-6 py-12 text-center text-sm text-[#737373]">
              {serviceSearch.trim() || serviceFilter !== "all"
                ? "No services match these filters."
                : "No services have been submitted yet."}
            </div>
          )}

          {state === "ready" && sortedServices.length > 0 && (
            <div className="space-y-3">
              {sortedServices.map((service) => (
                <article
                  key={service.id}
                  className="border border-[#e9e7e4] bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <div className="h-14 w-14 shrink-0 overflow-hidden bg-[#f4f4f2]">
                        {service.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={service.image}
                            alt={service.serviceName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Store
                              size={18}
                              strokeWidth={1.3}
                              className="text-[#c9bcb7]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={service.status} />
                          {!service.isActive && (
                            <StatusBadge status="inactive" />
                          )}
                        </div>

                        <h3 className="mt-1.5 truncate font-heading text-lg text-[#252525]">
                          {service.serviceName}
                        </h3>

                        <p className="mt-1 truncate text-xs text-[#999999]">
                          {service.vendor.businessName || service.vendor.name} ·{" "}
                          {service.category} · {service.location} ·{" "}
                          {formatPrice(service.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {service.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() =>
                            moderateService(service.id, "approved")
                          }
                          disabled={updatingServiceId === service.id}
                          className="flex items-center justify-center gap-1.5 bg-[#252525] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#444444] disabled:opacity-60"
                        >
                          <Check size={13} />
                          {service.status === "rejected" ? "Restore" : "Approve"}
                        </button>
                      )}

                      {service.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() =>
                            moderateService(service.id, "rejected")
                          }
                          disabled={updatingServiceId === service.id}
                          className="flex items-center justify-center gap-1.5 border border-[#e9e7e4] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373] transition hover:border-[#b91c1c] hover:text-[#b91c1c] disabled:opacity-60"
                        >
                          <X size={13} />
                          {service.status === "approved"
                            ? "Unpublish"
                            : "Reject"}
                        </button>
                      )}

                      {deletingServiceId === service.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => deleteService(service.id)}
                            disabled={updatingServiceId === service.id}
                            className="bg-[#b91c1c] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#991b1b] disabled:opacity-60"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingServiceId(null)}
                            aria-label="Keep service"
                            className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingServiceId(service.id)}
                          aria-label={`Delete ${service.serviceName}`}
                          className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#999999] transition hover:border-[#b91c1c] hover:text-[#b91c1c]"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {section === "transactions" && state !== "error" && (
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
                Platform transactions
              </p>
              <h2 className="mt-1 font-heading text-2xl text-[#252525]">
                Subscription payments
              </h2>
            </div>

            <p className="text-xs text-[#999999]">
              {stats
                ? `${formatCurrency(stats.totalRevenue)} collected · ${
                    stats.paidTransactions
                  } paid`
                : "—"}
            </p>
          </div>

          {state === "loading" && (
            <div className="space-y-2" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse border border-[#e9e7e4] bg-white"
                />
              ))}
            </div>
          )}

          {state === "ready" && transactions.length === 0 && (
            <div className="border border-[#e9e7e4] bg-white px-6 py-12 text-center">
              <CircleDollarSign
                size={22}
                strokeWidth={1.3}
                className="mx-auto text-[#c9bcb7]"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm text-[#737373]">
                No subscription payments have been recorded yet.
              </p>
            </div>
          )}

          {state === "ready" && transactions.length > 0 && (
            <div className="border border-[#e9e7e4] bg-white">
              <div className="hidden grid-cols-[1.6fr_0.9fr_0.7fr_1fr_0.7fr] gap-4 border-b border-[#f0eeeb] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999999] sm:grid">
                <span>Vendor</span>
                <span>Plan</span>
                <span>Status</span>
                <span>Date</span>
                <span className="text-right">Amount</span>
              </div>

              <ul className="divide-y divide-[#f0eeeb]">
                {transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="px-4 py-4 sm:grid sm:grid-cols-[1.6fr_0.9fr_0.7fr_1fr_0.7fr] sm:items-center sm:gap-4 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#252525]">
                        {transaction.vendorName ||
                          transaction.vendorEmail ||
                          "Unknown vendor"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#999999]">
                        {transaction.vendorEmail}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0">
                      <span className="text-xs capitalize text-[#555555]">
                        {transaction.plan}
                      </span>
                      {transaction.provider === "demo" && (
                        <span className="border border-[#e9e7e4] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999999]">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-0">
                      <StatusBadge status={transaction.status} />
                    </div>

                    <p className="mt-2 text-[11px] text-[#999999] sm:mt-0">
                      {formatDate(transaction.paidAt || transaction.createdAt)}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#252525] sm:mt-0 sm:text-right">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}

function InitialAvatar({
  image,
  name,
}: {
  image: string | null;
  name: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] font-heading text-sm italic text-[#b9a6a0]">
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
