import { Suspense } from "react";
import type { Metadata } from "next";
import ServicesBrowser from "@/components/services/services-browser";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Explore trusted wedding photographers, venues, decorators, caterers, makeup artists and fashion studios on WedPlan.",
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesFallback />}>
      <ServicesBrowser />
    </Suspense>
  );
}

function ServicesFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:px-10">
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border border-[#e8e5e1] bg-white">
            <div className="aspect-[4/3] w-full animate-pulse bg-[#f4f4f2]" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-[#f4f4f2]" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#f4f4f2]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#f4f4f2]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
