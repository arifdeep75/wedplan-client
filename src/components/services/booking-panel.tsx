"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { authClient, dashboardPath, type AuthUser } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

interface BookingPanelProps {
  serviceId: string;
  serviceName: string;
  price: number;
  vendorName: string;
}

// Booking request card shown beside the service details. All authorization
// and price/vendor derivation happen on the server; this only collects input.
export default function BookingPanel({
  serviceId,
  serviceName,
  price,
  vendorName,
}: BookingPanelProps) {
  const { data: session, isPending } = authClient.useSession();
  const user = (session?.user as AuthUser | undefined) ?? undefined;

  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!eventDate) {
      setError("Please choose your event date");
      return;
    }

    const timestamp = Date.parse(eventDate);

    if (Number.isNaN(timestamp) || timestamp <= Date.now()) {
      setError("Your event date must be in the future");
      return;
    }

    setSubmitting(true);

    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          eventDate,
          ...(message.trim() ? { message: message.trim() } : {}),
        }),
      });

      setSubmitted(true);
      toast.success("Booking request sent");
    } catch (submitError) {
      const text =
        submitError instanceof Error
          ? submitError.message
          : "Failed to send your request";

      setError(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  }

  // Submitted confirmation
  if (submitted) {
    return (
      <div className="border border-[#252525] bg-white p-6 sm:p-7">
        <CheckCircle2 size={30} strokeWidth={1.4} className="text-[#252525]" />

        <h2 className="mt-4 font-heading text-2xl text-[#252525]">
          Request sent
        </h2>

        <p className="mt-2 text-sm leading-7 text-[#737373]">
          {vendorName} received your request for{" "}
          <span className="font-medium text-[#252525]">{serviceName}</span> on{" "}
          {formatDate(eventDate)}. You&rsquo;ll see their reply on your
          dashboard.
        </p>

        <div className="mt-6 space-y-2">
          <Link
            href={dashboardPath(user?.role)}
            className="flex h-11 w-full items-center justify-center gap-2 bg-[#252525] text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
          >
            View my bookings
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/services"
            className="flex h-11 w-full items-center justify-center border border-[#e9e7e4] text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#e9e7e4] bg-white p-6 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
        Starting from
      </p>

      <p className="mt-2 font-heading text-3xl text-[#252525]">
        {formatPrice(price)}
      </p>

      <p className="mt-1 text-xs text-[#999999]">
        Final pricing is agreed directly with the vendor.
      </p>

      <div className="my-6 h-px bg-[#f0eeeb]" />

      {isPending && (
        <div className="flex items-center gap-2 py-6 text-sm text-[#999999]">
          <Loader2 size={16} className="animate-spin text-[#b9a6a0]" />
          Checking your account…
        </div>
      )}

      {!isPending && !user && (
        <div>
          <h2 className="font-heading text-xl text-[#252525]">
            Sign in to book
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#737373]">
            Create a free customer account to send a request and track the
            vendor&rsquo;s reply.
          </p>

          <div className="mt-5 space-y-2">
            <Link
              href="/sign-in"
              className="flex h-11 w-full items-center justify-center gap-2 bg-[#252525] text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
            >
              Sign in
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/sign-up"
              className="flex h-11 w-full items-center justify-center border border-[#e9e7e4] text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
            >
              Create an account
            </Link>
          </div>
        </div>
      )}

      {!isPending && user && user.role !== "customer" && (
        <div>
          <h2 className="font-heading text-xl text-[#252525]">
            Customer accounts only
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#737373]">
            You&rsquo;re signed in as a {user.role ?? "user"} — only customer
            accounts can send booking requests. You can still browse every
            service.
          </p>

          <Link
            href={dashboardPath(user.role)}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 border border-[#e9e7e4] text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
          >
            Go to your dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!isPending && user && user.role === "customer" && (
        <form onSubmit={handleSubmit}>
          <h2 className="font-heading text-xl text-[#252525]">
            Request this service
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#737373]">
            {vendorName} will confirm or decline your request.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="booking-event-date"
                className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]"
              >
                <CalendarDays size={12} className="text-[#b9a6a0]" />
                Event date
              </label>
              <input
                id="booking-event-date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                required
                className="h-12 w-full border border-[#e9e7e4] bg-white px-4 text-sm text-[#252525] outline-none transition-colors focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />
            </div>

            <div>
              <label
                htmlFor="booking-message"
                className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]"
              >
                <MessageSquare size={12} className="text-[#b9a6a0]" />
                Message
                <span className="normal-case tracking-normal text-[#aaaaaa]">
                  (optional)
                </span>
              </label>
              <textarea
                id="booking-message"
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share your venue, guest count, or anything the vendor should know…"
                className="w-full border border-[#e9e7e4] bg-white px-4 py-3 text-sm leading-6 text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 border border-[#f0d9d9] bg-[#fbf6f6] px-4 py-3 text-xs text-[#b91c1c]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-[#252525] text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ArrowRight size={15} />
            )}
            {submitting ? "Sending request…" : "Send request"}
          </button>

          <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#999999]">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#b9a6a0]" />
            No payment is taken now. Your contact details are shared with this
            vendor only.
          </p>
        </form>
      )}
    </div>
  );
}
