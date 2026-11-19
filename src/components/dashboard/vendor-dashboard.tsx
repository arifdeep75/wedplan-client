"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CircleDollarSign,
  Mail,
  Pencil,
  Plus,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import StatCard from "@/components/dashboard/stat-card";
import StatusBadge from "@/components/dashboard/status-badge";
import ServiceForm, {
  type ServiceFormValues,
} from "@/components/dashboard/service-form";
import VendorSubscription, {
  type SubscriptionStatus,
} from "@/components/dashboard/vendor-subscription";
import { useRoleGuard } from "@/components/dashboard/use-role-guard";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatPrice } from "@/lib/format";

interface VendorService {
  id: string;
  serviceName: string;
  category: string;
  description: string | null;
  price: number;
  location: string;
  image: string | null;
  images: string[];
  status: string;
  isActive: boolean;
}

interface VendorBooking {
  id: string;
  serviceName: string;
  price: number;
  eventDate: string;
  message: string | null;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
  };
  createdAt: string | null;
}

type LoadState = "loading" | "ready" | "error";
type Tab = "services" | "bookings" | "subscription";

export default function VendorDashboard() {
  const { user, ready } = useRoleGuard("vendor");
  const reduceMotion = useReducedMotion();

  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<VendorService[]>([]);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  // form state: null = closed, "new" = create, service = edit
  const [formMode, setFormMode] = useState<"new" | string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    let active = true;

    Promise.all([
      api<{ success: boolean; data: VendorService[] }>("/api/services/mine"),
      api<{ success: boolean; data: VendorBooking[] }>("/api/bookings/vendor"),
      api<{ success: boolean; data: SubscriptionStatus }>(
        "/api/payments/status"
      ).catch(() => null),
    ])
      .then(([servicesResult, bookingsResult, subscriptionResult]) => {
        if (!active) return;
        setServices(servicesResult.data);
        setBookings(bookingsResult.data);
        setSubscription(subscriptionResult?.data ?? null);
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

  // Coming back from Stripe Checkout: verify the session, then wait for the
  // signature-verified webhook to grant premium. Nothing is unlocked here.
  useEffect(() => {
    if (!ready) return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (!payment) return;

    window.history.replaceState({}, "", window.location.pathname);

    if (payment === "cancelled") {
      toast.info("Checkout cancelled — your plan is unchanged");
      return;
    }

    if (payment !== "success" || !sessionId) return;

    let active = true;

    async function confirmAndWait() {
      await api("/api/payments/confirm", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const result = await api<{ success: boolean; data: SubscriptionStatus }>(
          "/api/payments/status"
        );

        if (!active) return;

        if (result.data.plan === "premium") {
          setSubscription(result.data);
          setTab("subscription");
          setReloadKey((key) => key + 1);
          authClient.$store.notify("$sessionSignal");
          toast.success("Premium activated");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (!active) return;
      }

      setTab("subscription");
      setReloadKey((key) => key + 1);
      toast.info(
        "Payment received — premium will activate as soon as Stripe confirms it."
      );
    }

    confirmAndWait().catch((error) => {
      if (!active) return;
      toast.error(
        error instanceof Error ? error.message : "We couldn't confirm your payment"
      );
    });

    return () => {
      active = false;
    };
  }, [ready]);

  const stats = useMemo(() => {
    const approved = services.filter((s) => s.status === "approved").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted");
    const acceptedValue = accepted.reduce((sum, b) => sum + b.price, 0);

    return {
      totalServices: services.length,
      approved,
      pending,
      accepted: accepted.length,
      acceptedValue,
    };
  }, [services, bookings]);

  const editingService =
    formMode && formMode !== "new"
      ? services.find((service) => service.id === formMode)
      : undefined;

  function refresh() {
    setState("loading");
    setReloadKey((key) => key + 1);
  }

  async function handleSaveService(values: ServiceFormValues) {
    setSubmitting(true);

    const body = JSON.stringify({
      serviceName: values.serviceName,
      category: values.category,
      price: Number(values.price),
      location: values.location,
      ...(values.description ? { description: values.description } : {}),
      images: values.image ? [values.image] : [],
    });

    try {
      if (formMode === "new") {
        await api("/api/services", { method: "POST", body });
        toast.success("Service submitted for admin approval");
      } else {
        await api(`/api/services/${formMode}`, { method: "PATCH", body });
        toast.success("Service updated");
      }

      setFormMode(null);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save service"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(service: VendorService) {
    try {
      await api(`/api/services/${service.id}/active`, { method: "PATCH" });
      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? { ...item, isActive: !item.isActive } : item
        )
      );
      toast.success(service.isActive ? "Service paused" : "Service activated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update service"
      );
    }
  }

  async function deleteService(id: string) {
    try {
      await api(`/api/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted");
      setDeletingId(null);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    }
  }

  async function updateBooking(id: string, status: "accepted" | "rejected") {
    setUpdatingBookingId(id);

    try {
      await api(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Booking ${status}`);
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update booking"
      );
    } finally {
      setUpdatingBookingId(null);
    }
  }

  return (
    <DashboardShell
      kicker="Vendor dashboard"
      title={
        <>
          Your studio,
          <span className="italic text-[#b9a6a0]"> beautifully managed</span>
        </>
      }
      description="Publish services, respond to couples, and keep every booking in view."
      user={user}
      actions={
        <button
          type="button"
          onClick={() => {
            setTab("services");
            setFormMode("new");
          }}
          className="flex h-11 items-center gap-2 bg-[#252525] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
        >
          <Plus size={15} />
          Add service
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Services"
          value={state === "ready" ? stats.totalServices : "—"}
          hint={
            subscription?.plan === "premium"
              ? "Premium · unlimited"
              : `${state === "ready" ? stats.approved : "—"} approved`
          }
          icon={Store}
        />
        <StatCard
          label="Pending requests"
          value={state === "ready" ? stats.pending : "—"}
          hint="Awaiting your reply"
          icon={CalendarDays}
        />
        <StatCard
          label="Accepted"
          value={state === "ready" ? stats.accepted : "—"}
          icon={BadgeCheck}
        />
        <StatCard
          label="Booked value"
          value={state === "ready" ? formatPrice(stats.acceptedValue) : "—"}
          icon={CircleDollarSign}
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-[#e9e7e4]">
        {(
          [
            { id: "services", label: `Services (${services.length})` },
            { id: "bookings", label: `Bookings (${bookings.length})` },
            { id: "subscription", label: "Plan" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-2 pb-4 pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors sm:flex-none sm:px-6 sm:text-[11px] sm:tracking-[0.14em] ${
              tab === item.id
                ? "text-[#252525]"
                : "text-[#999999] hover:text-[#555555]"
            }`}
          >
            {item.label}
            {item.id === "bookings" && stats.pending > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#252525] px-1 text-[9px] leading-none text-white">
                {stats.pending}
              </span>
            )}
            {tab === item.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#252525]" />
            )}
          </button>
        ))}
      </div>

      {state === "error" && (
        <div className="mt-8 border border-[#e9e7e4] bg-white p-8 text-center">
          <p className="font-heading text-xl text-[#252525]">
            We couldn&rsquo;t load your studio
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

      {/* SERVICES TAB */}
      {tab === "services" && (
        <div className="mt-8">
          {formMode && (
            <div className="mb-6">
              <ServiceForm
                title={formMode === "new" ? "Add a new service" : "Edit service"}
                initialValues={
                  editingService
                    ? {
                        serviceName: editingService.serviceName,
                        category: editingService.category,
                        price: String(editingService.price),
                        location: editingService.location,
                        description: editingService.description ?? "",
                        image: editingService.images[0] ?? "",
                      }
                    : undefined
                }
                submitting={submitting}
                onSubmit={handleSaveService}
                onCancel={() => setFormMode(null)}
              />
            </div>
          )}

          {state === "loading" && (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse border border-[#e9e7e4] bg-white"
                />
              ))}
            </div>
          )}

          {state === "ready" && services.length === 0 && !formMode && (
            <div className="border border-[#e9e7e4] bg-white px-6 py-14 text-center">
              <Store
                size={26}
                strokeWidth={1.4}
                className="mx-auto mb-5 text-[#c9bcb7]"
              />
              <h3 className="font-heading text-2xl text-[#252525]">
                Your first service awaits
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#737373]">
                Add a service so couples can discover your work. New services are
                reviewed by our team before going live.
              </p>
              <button
                type="button"
                onClick={() => setFormMode("new")}
                className="mt-7 inline-flex items-center gap-2 bg-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
              >
                <Plus size={14} />
                Add your first service
              </button>
            </div>
          )}

          {state === "ready" && services.length > 0 && (
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.article
                  key={service.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="border border-[#e9e7e4] bg-white"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="h-36 w-full shrink-0 overflow-hidden bg-[#f4f4f2] sm:h-20 sm:w-24">
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
                            size={20}
                            strokeWidth={1.3}
                            className="text-[#c9bcb7]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={service.status} />
                        {!service.isActive && (
                          <StatusBadge status="inactive" />
                        )}
                      </div>

                      <h3 className="mt-2 truncate font-heading text-xl text-[#252525]">
                        {service.serviceName}
                      </h3>

                      <p className="mt-1 truncate text-xs text-[#999999]">
                        {service.category} · {service.location} ·{" "}
                        {formatPrice(service.price)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(service)}
                        className="border border-[#e9e7e4] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
                      >
                        {service.isActive ? "Pause" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormMode(service.id)}
                        aria-label={`Edit ${service.serviceName}`}
                        className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
                      >
                        <Pencil size={14} />
                      </button>

                      {deletingId === service.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => deleteService(service.id)}
                            className="bg-[#b91c1c] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#991b1b]"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            aria-label="Keep service"
                            className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(service.id)}
                          aria-label={`Delete ${service.serviceName}`}
                          className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#999999] transition hover:border-[#b91c1c] hover:text-[#b91c1c]"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {tab === "bookings" && (
        <div className="mt-8">
          {state === "loading" && (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse border border-[#e9e7e4] bg-white"
                />
              ))}
            </div>
          )}

          {state === "ready" && bookings.length === 0 && (
            <div className="border border-[#e9e7e4] bg-white px-6 py-14 text-center">
              <CalendarDays
                size={26}
                strokeWidth={1.4}
                className="mx-auto mb-5 text-[#c9bcb7]"
              />
              <h3 className="font-heading text-2xl text-[#252525]">
                No bookings yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#737373]">
                When a couple requests one of your services it will appear here,
                ready for your reply.
              </p>
            </div>
          )}

          {state === "ready" && bookings.length > 0 && (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="border border-[#e9e7e4] bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={booking.status} />
                        <span className="text-[11px] text-[#999999]">
                          Requested {formatDate(booking.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 font-heading text-xl text-[#252525]">
                        {booking.serviceName}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#737373]">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-[#b9a6a0]" />
                          {formatDate(booking.eventDate)}
                        </span>

                        <span>{formatPrice(booking.price)}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#f0eeeb] pt-3 text-xs text-[#737373]">
                        <CustomerAvatar
                          image={booking.customer.image}
                          name={booking.customer.name}
                        />
                        <span className="font-medium text-[#252525]">
                          {booking.customer.name}
                        </span>

                        {booking.customer.email && (
                          <a
                            href={`mailto:${booking.customer.email}`}
                            className="inline-flex items-center gap-1 text-[#999999] transition hover:text-[#252525]"
                          >
                            <Mail size={12} />
                            {booking.customer.email}
                          </a>
                        )}
                      </div>

                      {booking.message && (
                        <p className="mt-3 border-l-2 border-[#e9e7e4] pl-3 text-xs leading-6 text-[#737373]">
                          “{booking.message}”
                        </p>
                      )}
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex shrink-0 gap-2 sm:flex-col">
                        <button
                          type="button"
                          onClick={() => updateBooking(booking.id, "accepted")}
                          disabled={updatingBookingId === booking.id}
                          className="flex flex-1 items-center justify-center gap-1.5 bg-[#252525] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#444444] disabled:opacity-60 sm:flex-none"
                        >
                          <Check size={13} />
                          Accept
                        </button>

                        <button
                          type="button"
                          onClick={() => updateBooking(booking.id, "rejected")}
                          disabled={updatingBookingId === booking.id}
                          className="flex flex-1 items-center justify-center gap-1.5 border border-[#e9e7e4] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737373] transition hover:border-[#b91c1c] hover:text-[#b91c1c] disabled:opacity-60 sm:flex-none"
                        >
                          <X size={13} />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTION TAB */}
      {tab === "subscription" && (
        <div className="mt-8">
          {state === "loading" && (
            <div className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
              <div className="h-80 animate-pulse border border-[#e9e7e4] bg-white" />
              <div className="h-80 animate-pulse border border-[#e9e7e4] bg-white" />
            </div>
          )}

          {state !== "loading" && !subscription && (
            <div className="border border-[#e9e7e4] bg-white p-8 text-center">
              <p className="font-heading text-xl text-[#252525]">
                Subscription information is unavailable
              </p>
              <p className="mt-2 text-sm text-[#737373]">
                We couldn&rsquo;t load your plan details. Please try again.
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

          {subscription && (
            <VendorSubscription
              status={subscription}
              onChanged={setSubscription}
              onServicesChanged={refresh}
            />
          )}
        </div>
      )}
    </DashboardShell>
  );
}

function CustomerAvatar({
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
        className="h-6 w-6 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f4f2] text-[10px] font-semibold text-[#b9a6a0]">
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
