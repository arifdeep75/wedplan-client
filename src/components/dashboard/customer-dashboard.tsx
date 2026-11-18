"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  MapPin,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import StatCard from "@/components/dashboard/stat-card";
import StatusBadge from "@/components/dashboard/status-badge";
import { useRoleGuard } from "@/components/dashboard/use-role-guard";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  eventDate: string;
  message: string | null;
  status: string;
  image: string | null;
  createdAt: string | null;
}

type LoadState = "loading" | "ready" | "error";

export default function CustomerDashboard() {
  const { user, ready } = useRoleGuard("customer");
  const reduceMotion = useReducedMotion();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    let active = true;

    api<{ success: boolean; data: Booking[] }>("/api/bookings/mine")
      .then((result) => {
        if (!active) return;
        setBookings(result.data);
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

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted");
    const confirmedValue = accepted.reduce((sum, b) => sum + b.price, 0);

    return {
      total: bookings.length,
      pending,
      accepted: accepted.length,
      confirmedValue,
    };
  }, [bookings]);

  async function cancelBooking(id: string) {
    setUpdatingId(id);

    try {
      await api(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });

      toast.success("Booking cancelled");
      setCancellingId(null);
      setState("loading");
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel booking"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <DashboardShell
      kicker="Customer dashboard"
      title={
        <>
          Welcome back
          {user?.name ? (
            <span className="italic text-[#b9a6a0]">, {user.name.split(" ")[0]}</span>
          ) : null}
        </>
      }
      description="Track every request, revisit your bookings, and keep your celebration moving forward."
      user={user}
      actions={
        <Link
          href="/services"
          className="group flex h-11 items-center gap-2 bg-[#252525] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
        >
          <Compass size={15} />
          Find services
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={state === "ready" ? stats.total : "—"}
          icon={CalendarDays}
        />
        <StatCard
          label="Awaiting reply"
          value={state === "ready" ? stats.pending : "—"}
          icon={Clock}
        />
        <StatCard
          label="Accepted"
          value={state === "ready" ? stats.accepted : "—"}
          hint="Confirmed by vendors"
          icon={CheckCircle2}
        />
        <StatCard
          label="Confirmed value"
          value={state === "ready" ? formatPrice(stats.confirmedValue) : "—"}
          icon={Heart}
        />
      </div>

      {/* Bookings */}
      <section className="mt-10 sm:mt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#e9e7e4] pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
              Your requests
            </p>
            <h2 className="mt-1 font-heading text-2xl text-[#252525]">
              Bookings
            </h2>
          </div>

          {state === "ready" && bookings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setReloadKey((key) => key + 1);
              }}
              className="text-xs font-semibold text-[#737373] transition hover:text-[#252525]"
            >
              Refresh
            </button>
          )}
        </div>

        {state === "loading" && (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-4 border border-[#e9e7e4] bg-white p-4"
              >
                <div className="h-20 w-20 shrink-0 animate-pulse bg-[#f4f4f2] sm:h-24 sm:w-28" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 w-24 animate-pulse bg-[#f4f4f2]" />
                  <div className="h-5 w-2/3 animate-pulse bg-[#f4f4f2]" />
                  <div className="h-3 w-1/3 animate-pulse bg-[#f4f4f2]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="border border-[#e9e7e4] bg-white p-8 text-center">
            <p className="font-heading text-xl text-[#252525]">
              We couldn&rsquo;t load your bookings
            </p>
            <p className="mt-2 text-sm text-[#737373]">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setReloadKey((key) => key + 1);
              }}
              className="mt-5 border border-[#252525] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && bookings.length === 0 && (
          <div className="border border-[#e9e7e4] bg-white px-6 py-14 text-center">
            <Heart
              size={26}
              strokeWidth={1.4}
              className="mx-auto mb-5 text-[#c9bcb7]"
            />
            <h3 className="font-heading text-2xl text-[#252525]">
              Your planning journey starts here
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#737373]">
              Browse trusted wedding professionals and send your first booking
              request — it will appear here.
            </p>
            <Link
              href="/services"
              className="mt-7 inline-flex items-center gap-2 bg-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
            >
              Explore Wedding Services
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {state === "ready" && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <motion.article
                key={booking.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="border border-[#e9e7e4] bg-white transition-colors hover:border-[#d8cdc8]"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                  {/* Thumbnail */}
                  <div className="h-40 w-full shrink-0 overflow-hidden bg-[#f4f4f2] sm:h-24 sm:w-28">
                    {booking.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.image}
                        alt={booking.serviceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Heart
                          size={22}
                          strokeWidth={1.3}
                          className="text-[#c9bcb7]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={booking.status} />
                      <span className="text-[11px] text-[#999999]">
                        Requested {formatDate(booking.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-2 truncate font-heading text-xl text-[#252525]">
                      {booking.serviceName}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#737373]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-[#b9a6a0]" />
                        {formatDate(booking.eventDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#b9a6a0]" />
                        {formatPrice(booking.price)}
                      </span>
                    </div>

                    {booking.message && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#999999]">
                        “{booking.message}”
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    {booking.status === "pending" ||
                    booking.status === "accepted" ? (
                      cancellingId === booking.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking.id)}
                            disabled={updatingId === booking.id}
                            className="border border-[#b91c1c] bg-[#b91c1c] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#991b1b] disabled:opacity-60"
                          >
                            {updatingId === booking.id
                              ? "Cancelling…"
                              : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancellingId(null)}
                            disabled={updatingId === booking.id}
                            aria-label="Keep booking"
                            className="flex h-9 w-9 items-center justify-center border border-[#e9e7e4] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCancellingId(booking.id)}
                          className="border border-[#e9e7e4] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#b91c1c] hover:text-[#b91c1c]"
                        >
                          Cancel booking
                        </button>
                      )
                    ) : null}

                    <Link
                      href={`/services/${booking.serviceId}`}
                      className="inline-flex items-center gap-1.5 px-1 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:text-[#9b8179]"
                    >
                      View service
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
