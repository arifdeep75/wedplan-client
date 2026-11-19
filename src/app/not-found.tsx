import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "We couldn't find that WedPlan page. Explore wedding services or return home.",
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-[#fafaf8] px-5 py-20 md:px-8 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full border border-[#e9e2df] sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-20 -z-10 h-72 w-72 rounded-full bg-[#f1eae7]/70 blur-3xl"
      />

      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 border border-[#e9e7e4] bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d7770]">
          <Heart size={13} strokeWidth={1.7} />
          WedPlan · Page not found
        </div>

        <p
          aria-hidden="true"
          className="mt-5 font-heading text-[clamp(7rem,24vw,15rem)] leading-[0.85] tracking-[-0.08em] text-[#e8dfdc]"
        >
          404
        </p>

        <h1 className="mt-6 font-heading text-3xl leading-tight text-[#252525] sm:text-5xl">
          This page took
          <span className="block italic text-[#a58f88]">
            an unexpected turn.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#737373] sm:text-base">
          The page may have moved, or the link might be out of date. Let&apos;s
          help you find your way back to something beautiful.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444]"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <Link
            href="/services"
            className="inline-flex h-12 items-center justify-center gap-2 border border-[#d9d2cf] bg-white px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:border-[#a58f88] hover:bg-[#f5f0ee]"
          >
            Explore services
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#99918d]">
          Planning a celebration? Your next step is just around the corner.
        </p>
      </div>
    </section>
  );
}
