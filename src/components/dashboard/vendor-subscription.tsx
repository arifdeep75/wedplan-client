"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  Crown,
  Loader2,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/status-badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

export interface SubscriptionTransaction {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string | null;
  paidAt: string | null;
}

export interface SubscriptionStatus {
  plan: "free" | "premium";
  expiresAt: string | null;
  stripeConfigured: boolean;
  webhookConfigured: boolean;
  price: { amount: number; currency: string; months: number };
  freeServiceLimit: number;
  paidTransactions: number;
  transactions: SubscriptionTransaction[];
}

interface VendorSubscriptionProps {
  status: SubscriptionStatus;
}

function getRenewalEndDate(expiresAt: string, months: number): Date {
  const currentExpiry = new Date(expiresAt);
  const renewalBase =
    currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
  const renewalEnd = new Date(renewalBase);
  renewalEnd.setMonth(renewalEnd.getMonth() + months);
  return renewalEnd;
}

export default function VendorSubscription({ status }: VendorSubscriptionProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = status.plan === "premium";
  const price = formatCurrency(status.price.amount, status.price.currency);
  const projectedRenewalEnd =
    isPremium && status.expiresAt
      ? getRenewalEndDate(status.expiresAt, status.price.months)
      : null;

  async function startCheckout() {
    setBusy(true);
    setError(null);

    try {
      const result = await api<{
        success: boolean;
        data: { url?: string };
      }>("/api/payments/checkout", { method: "POST", body: "{}" });

      if (!result.data?.url) {
        throw new Error("Stripe did not return a checkout URL");
      }

      window.location.assign(result.data.url);
    } catch (checkoutError) {
      const text =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Failed to start checkout";
      setError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        {/* Current plan */}
        <div
          className={`flex flex-col justify-between p-6 sm:p-8 ${
            isPremium
              ? "bg-[#252525] text-white"
              : "border border-[#e9e7e4] bg-white"
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    isPremium ? "text-[#c9bcb7]" : "text-[#a58f88]"
                  }`}
                >
                  Current plan
                </p>

                <h2
                  className={`mt-2 font-heading text-3xl ${
                    isPremium ? "text-white" : "text-[#252525]"
                  }`}
                >
                  {isPremium ? "Premium" : "Free"}
                </h2>
              </div>

              {isPremium && (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25">
                  <Crown size={18} strokeWidth={1.4} className="text-[#e5d6cf]" />
                </span>
              )}
            </div>

            <p
              className={`mt-3 text-sm leading-7 ${
                isPremium ? "text-[#cfcfcf]" : "text-[#737373]"
              }`}
            >
              {isPremium
                ? `Active until ${formatDate(status.expiresAt)}. Your premium badge is shown on every listing.`
                : `You can publish up to ${status.freeServiceLimit} services. Upgrade to list without a limit.`}
            </p>

            <ul className="mt-6 space-y-3">
              {(isPremium
                ? [
                    "Unlimited service listings",
                    "Premium badge on every listing",
                    "Priority support for your studio",
                  ]
                : [
                    `${status.freeServiceLimit} service listings`,
                    "Standard listing placement",
                    "Booking requests from couples",
                  ]
              ).map((benefit) => (
                <li
                  key={benefit}
                  className={`flex items-start gap-2.5 text-xs ${
                    isPremium ? "text-[#e5e5e5]" : "text-[#555555]"
                  }`}
                >
                  <Check
                    size={14}
                    className={`mt-0.5 shrink-0 ${
                      isPremium ? "text-[#c9bcb7]" : "text-[#b9a6a0]"
                    }`}
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {isPremium && status.expiresAt && (
            <p className="mt-8 flex items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-[#bfbfbf]">
              <CalendarClock size={13} />
              Current period ends {formatDate(status.expiresAt)} · renew any time
            </p>
          )}
        </div>

        {/* Upgrade / renew */}
        <div className="border border-[#e9e7e4] bg-white p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
            <Sparkles size={13} />
            {isPremium ? "Extend premium" : "Upgrade"}
          </p>

          <h2 className="mt-2 font-heading text-2xl text-[#252525]">
            {isPremium ? "Add another year" : `Premium — ${status.price.months} months`}
          </h2>

          <p className="mt-2 font-heading text-4xl text-[#252525]">{price}</p>

          <p className="mt-2 text-xs leading-6 text-[#737373]">
            {isPremium
              ? "Renewing early stacks another 12 months on top of your current expiry."
              : `A one-time payment for ${status.price.months} months of unlimited listings.`}
          </p>

          {projectedRenewalEnd && (
            <p className="mt-4 flex items-start gap-2 border border-[#f0eeeb] bg-[#fafaf8] px-4 py-3 text-xs leading-5 text-[#737373]">
              <CalendarClock size={14} className="mt-0.5 shrink-0 text-[#a58f88]" />
              Renewing today extends Premium until{" "}
              <strong className="font-semibold text-[#252525]">
                {formatDate(projectedRenewalEnd)}
              </strong>
              .
            </p>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={startCheckout}
              disabled={
                busy || !status.stripeConfigured || !status.webhookConfigured
              }
              className="flex h-12 w-full items-center justify-center gap-2 bg-[#252525] text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <BadgeCheck size={15} />
              )}
              {busy
                ? "Starting checkout…"
                : isPremium
                  ? `Renew for ${price}`
                  : `Upgrade for ${price}`}
            </button>
          </div>

          {error && (
            <p className="mt-4 border border-[#f0d9d9] bg-[#fbf6f6] px-4 py-3 text-xs text-[#b91c1c]">
              {error}
            </p>
          )}

          {!status.stripeConfigured && (
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#999999]">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#b9a6a0]" />
              Real Stripe checkout is unavailable until the API server has a
              valid STRIPE_SECRET_KEY configured.
            </p>
          )}

          {status.stripeConfigured && !status.webhookConfigured && (
            <p className="mt-4 border border-[#f0d9d9] bg-[#fbf6f6] px-4 py-3 text-[11px] leading-5 text-[#b91c1c]">
              Real checkout is disabled until STRIPE_WEBHOOK_SECRET is
              configured on the API server.
            </p>
          )}

          {status.stripeConfigured && status.webhookConfigured && (
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#999999]">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#b9a6a0]" />
              Secure checkout by Stripe. One-time payment, no auto-renewal.
              Premium activates after Stripe confirms the payment.
            </p>
          )}
        </div>
      </div>

      {/* Transaction history */}
      <section className="border border-[#e9e7e4] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0eeeb] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
              Billing
            </p>
            <h2 className="mt-1 font-heading text-xl text-[#252525]">
              Payment history
            </h2>
          </div>

          <p className="text-[11px] text-[#999999]">
            {status.paidTransactions} completed{" "}
            {status.paidTransactions === 1 ? "payment" : "payments"}
          </p>
        </div>

        {status.transactions.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#999999] sm:px-6">
            No payments yet. Your subscription history will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0eeeb]">
            {status.transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fafaf8]">
                    <RotateCw
                      size={14}
                      className="text-[#b9a6a0]"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold capitalize text-[#252525]">
                        {transaction.plan} plan
                      </p>
                      <StatusBadge status={transaction.status} />
                    </div>

                    <p className="mt-1 text-[11px] text-[#999999]">
                      {formatDate(transaction.paidAt || transaction.createdAt)}
                      {transaction.provider === "stripe" ? " · Stripe" : ""}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-semibold text-[#252525]">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
