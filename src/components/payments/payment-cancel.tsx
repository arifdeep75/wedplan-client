"use client";

import Link from "next/link";
import { ArrowRight, Loader2, XCircle } from "lucide-react";

import { useRoleGuard } from "@/components/dashboard/use-role-guard";

export default function PaymentCancel() {
  const { ready } = useRoleGuard("vendor");

  if (!ready) {
    return (
      <section className="bg-[#fafaf8] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-xl border border-[#e9e7e4] bg-white px-6 py-14 text-center sm:px-10">
          <Loader2 size={22} className="mx-auto animate-spin text-[#b9a6a0]" />
          <p className="mt-4 text-sm text-[#737373]">Checking your account…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fafaf8] px-5 py-20 md:py-28">
      <div className="mx-auto max-w-xl border border-[#e9e7e4] bg-white px-6 py-14 text-center sm:px-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f4f2] text-[#999999]">
          <XCircle size={28} strokeWidth={1.4} />
        </span>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a58f88]">
          Payment cancelled
        </p>

        <h1 className="mt-3 font-heading text-3xl text-[#252525] sm:text-4xl">
          Your plan is unchanged
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#737373]">
          You left checkout before completing the payment, so nothing was
          charged. You can upgrade to premium whenever you&rsquo;re ready.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/vendor"
            className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
          >
            Back to dashboard
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/services"
            className="flex h-11 items-center justify-center border border-[#e9e7e4] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
          >
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
