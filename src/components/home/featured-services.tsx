"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, MapPin, RotateCw, UserRound } from "lucide-react";

import { formatPrice } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface FeaturedService {
  id: string;
  serviceName: string;
  category: string;
  price: number;
  location: string;
  image: string | null;
  vendor: {
    name: string;
    image: string | null;
    businessName: string | null;
  };
}

type Status = "loading" | "ready" | "error";

// Dynamic Section 1: featured approved + active services from the database.
export default function FeaturedServices() {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/services?limit=6`)
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          data?: FeaturedService[];
        };

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error("Failed to load services");
        }

        if (active) {
          setServices(result.data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retry() {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }

  return (
    <section className="px-5 py-20 md:px-8 md:py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
              Featured wedding services
            </p>

            <h2 className="max-w-xl font-heading text-4xl leading-tight text-[#252525] sm:text-5xl">
              A curated selection of
              <span className="italic text-[#b9a6a0]"> beautiful work</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#737373]">
              Trusted professionals, thoughtfully selected for your day.
            </p>
          </div>

          <Link
            href="/services"
            className="group flex items-center gap-2 text-sm font-semibold text-[#252525] transition hover:text-[#9b8179]"
          >
            Browse all services
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {status === "loading" && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="border border-[#e8e5e1]"
                aria-hidden="true"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-[#f4f4f2]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#f4f4f2]" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#f4f4f2]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#f4f4f2]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="border border-[#e8e5e1] bg-[#f4f4f2] p-10 text-center">
            <p className="font-heading text-2xl text-[#252525]">
              We couldn&rsquo;t load the services
            </p>
            <p className="mt-3 text-sm text-[#737373]">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-6 inline-flex items-center gap-2 border border-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
            >
              <RotateCw size={14} />
              Try again
            </button>
          </div>
        )}

        {status === "ready" && services.length === 0 && (
          <div className="border border-[#e8e5e1] bg-[#f4f4f2] p-12 text-center">
            <p className="font-heading text-2xl text-[#252525]">
              Our professionals are onboarding
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#737373]">
              Beautiful wedding services will appear here very soon. Check back
              shortly.
            </p>
          </div>
        )}

        {status === "ready" && services.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: (index % 3) * 0.08,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <Link
                  href={`/services/${service.id}`}
                  className="group block h-full border border-[#e8e5e1] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#b9a6a0] hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f4f2]">
                    {service.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#f4f4f2]">
                        <UserRound
                          size={34}
                          strokeWidth={1.3}
                          className="text-[#c9bcb7]"
                        />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 border border-white/60 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {service.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading text-2xl leading-snug text-[#252525]">
                      {service.serviceName}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#252525]">
                        {formatPrice(service.price)}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-[#888888]">
                        <MapPin size={13} className="text-[#b9a6a0]" />
                        {service.location}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#e9e7e4] pt-4">
                      <p className="flex min-w-0 items-center gap-2 text-xs text-[#737373]">
                        <VendorAvatar
                          image={service.vendor.image}
                          name={service.vendor.name}
                        />
                        <span className="truncate">
                          {service.vendor.businessName || service.vendor.name}
                        </span>
                      </p>

                      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#252525] transition-colors group-hover:text-[#9b8179]">
                        View details
                        <ArrowUpRight
                          size={14}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VendorAvatar({
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
        className="h-6 w-6 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] text-[10px] italic text-[#b9a6a0]">
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
