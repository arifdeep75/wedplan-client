"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useRoleGuard } from "@/components/dashboard/use-role-guard";
import type { SubscriptionStatus } from "@/components/dashboard/vendor-subscription";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

type Phase = "checking" | "waiting" | "active" | "error";

const POLL_ATTEMPTS = 10;
const POLL_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PaymentSuccess() {
  const { ready } = useRoleGuard("vendor");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [phase, setPhase] = useState<Phase>(
    sessionId ? "checking" : "error"
  );
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState<string | null>(
    sessionId ? null : "This link is missing its checkout session."
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ready || !sessionId) return;

    let active = true;

    async function verifyAndWait() {
      try {
        // Verifies the session belongs to this vendor and is paid. Premium is
        // still granted only by the signature-verified Stripe webhook.
        await api("/api/payments/confirm", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });

        for (let index = 0; index < POLL_ATTEMPTS; index += 1) {
          const result = await api<{ success: boolean; data: SubscriptionStatus }>(
            "/api/payments/status"
          );

          if (!active) return;

          if (result.data.plan === "premium") {
            setStatus(result.data);
            setPhase("active");
            authClient.$store.notify("$sessionSignal");
            return;
          }

          if (index === 0) setPhase("waiting");
          setAttempt(index + 1);

          await sleep(POLL_DELAY_MS);
          if (!active) return;
        }

        setPhase("waiting");
      } catch (verifyError) {
        if (!active) return;
        setPhase("error");
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : "We couldn't confirm your payment"
        );
      }
    }

    verifyAndWait();

    return () => {
      active = false;
    };
  }, [ready, sessionId]);

  if (!ready) {
    return (
      <Centered>
        <Loader2 size={22} className="animate-spin text-[#b9a6a0]" />
        <p className="mt-4 text-sm text-[#737373]">Checking your account…</p>
      </Centered>
    );
  }

  if (phase === "active") {
    return (
      <Centered>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f4f2] text-[#252525]">
          <CheckCircle2 size={28} strokeWidth={1.4} />
        </span>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a58f88]">
          Payment successful
        </p>

        <h1 className="mt-3 font-heading text-3xl text-[#252525] sm:text-4xl">
          Premium is active
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#737373]">
          Your verified payment is confirmed by Stripe. You can now publish
          unlimited services and your premium badge is visible to customers.
        </p>

        {status?.expiresAt && (
          <p className="mt-4 inline-flex items-center gap-2 border border-[#e9e7e4] bg-white px-4 py-2 text-xs text-[#737373]">
            <ShieldCheck size={14} className="text-[#b9a6a0]" />
            Premium until {formatDate(status.expiresAt)}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/vendor"
            className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
          >
            Go to vendor dashboard
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/services"
            className="flex h-11 items-center justify-center border border-[#e9e7e4] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
          >
            Browse services
          </Link>
        </div>
      </Centered>
    );
  }

  if (phase === "error") {
    return (
      <Centered>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbf6f6] text-[#b91c1c]">
          <XCircle size={28} strokeWidth={1.4} />
        </span>

        <h1 className="mt-6 font-heading text-3xl text-[#252525]">
          We couldn&rsquo;t confirm this payment
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#737373]">
          {error || "Please return to your dashboard and check your plan."}
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/vendor"
            className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
          >
            Back to dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      </Centered>
    );
  }

  // checking + waiting
  return (
    <Centered>
      <Loader2 size={24} className="animate-spin text-[#b9a6a0]" />

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a58f88]">
        {phase === "checking" ? "Verifying payment" : "Waiting for Stripe"}
      </p>

      <h1 className="mt-3 font-heading text-3xl text-[#252525] sm:text-4xl">
        {phase === "checking"
          ? "Confirming your checkout…"
          : "Payment received"}
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#737373]">
        {phase === "checking"
          ? "We're checking the session with Stripe. This only takes a moment."
          : "Stripe is still confirming the payment. Premium activates automatically as soon as its verified webhook arrives — this page will update on its own."}
      </p>

      {phase === "waiting" && attempt > 0 && (
        <p className="mt-3 text-xs text-[#999999]">
          Checked {attempt} of {POLL_ATTEMPTS} times…
        </p>
      )}

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-7 inline-flex items-center gap-2 border border-[#252525] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
      >
        <RotateCw size={13} />
        Refresh status
      </button>

      <p className="mt-6 text-xs text-[#999999]">
        <Link
          href="/dashboard/vendor"
          className="underline underline-offset-4 hover:text-[#252525]"
        >
          Return to your dashboard
        </Link>
      </p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-[#fafaf8] px-5 py-20 md:py-28">
      <div className="mx-auto max-w-xl border border-[#e9e7e4] bg-white px-6 py-14 text-center sm:px-10">
        {children}
      </div>
    </section>
  );
}
