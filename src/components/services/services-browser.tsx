"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { RotateCw, Search, X } from "lucide-react";

import ServiceCard, {
  type ServiceCardData,
} from "@/components/services/service-card";
import { SERVICE_CATEGORIES } from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const ALL_CATEGORIES = "All";

type LoadState = "loading" | "ready" | "error";

export default function ServicesBrowser() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const params = new URLSearchParams({ limit: "24" });

    if (category !== ALL_CATEGORIES) params.set("category", category);
    if (deferredSearch) params.set("search", deferredSearch);

    fetch(`${API_URL}/api/services?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          data?: ServiceCardData[];
        };

        if (
          !response.ok ||
          !result.success ||
          !Array.isArray(result.data)
        ) {
          throw new Error("Failed to load services");
        }

        if (active) {
          setServices(result.data);
          setState("ready");
        }
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setState("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [deferredSearch, category, reloadKey]);

  const isFiltering =
    state === "loading" || search.trim() !== deferredSearch;
  const hasFilters = search.trim().length > 0 || category !== ALL_CATEGORIES;

  function resetFilters() {
    setSearch("");
    setCategory(ALL_CATEGORIES);
  }

  return (
    <div>
      {/* Header */}
      <section className="border-b border-[#e9e7e4] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20 lg:px-10">
          <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
            <span className="h-px w-8 bg-[#d8c8c3]" />
            Wedding services
          </p>

          <h1 className="max-w-3xl font-heading text-4xl leading-tight text-[#252525] sm:text-5xl md:text-6xl">
            Find the people who
            <span className="italic text-[#b9a6a0]"> make it happen</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#737373]">
            Photography, venues, decor, catering and more — every professional
            here has been reviewed by our team before going live.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-[#e9e7e4] bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services by name…"
                aria-label="Search services"
                className="h-12 w-full border border-[#e9e7e4] bg-white pl-11 pr-11 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#999999] transition hover:text-[#252525]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <p className="text-xs text-[#999999]" aria-live="polite">
              {state === "ready"
                ? `${services.length} ${
                    services.length === 1 ? "service" : "services"
                  }${hasFilters ? " found" : " available"}`
                : "Loading services…"}
              {isFiltering && state === "ready" && (
                <span className="ml-2 text-[#b9a6a0]">· updating</span>
              )}
            </p>
          </div>

          {/* Category chips */}
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[ALL_CATEGORIES, ...SERVICE_CATEGORIES].map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={`shrink-0 border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-[#252525] bg-[#252525] text-white"
                      : "border-[#e9e7e4] bg-white text-[#737373] hover:border-[#252525] hover:text-[#252525]"
                  }`}
                >
                  {item === ALL_CATEGORIES ? "All services" : item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-5 py-12 md:px-8 md:py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {state === "error" && (
            <div className="border border-[#e8e5e1] bg-[#f4f4f2] p-10 text-center">
              <p className="font-heading text-2xl text-[#252525]">
                We couldn&rsquo;t load the services
              </p>
              <p className="mt-3 text-sm text-[#737373]">
                Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setState("loading");
                  setReloadKey((key) => key + 1);
                }}
                className="mt-6 inline-flex items-center gap-2 border border-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
              >
                <RotateCw size={14} />
                Try again
              </button>
            </div>
          )}

          {state === "loading" && (
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
          )}

          {state === "ready" && services.length === 0 && (
            <div className="border border-[#e8e5e1] bg-white px-6 py-16 text-center">
              <p className="font-heading text-2xl text-[#252525]">
                No services match your search
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#737373]">
                Try a different category or a shorter search term — new
                professionals join WedPlan every week.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 border border-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {state === "ready" && services.length > 0 && (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index, 6) * 0.05,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
