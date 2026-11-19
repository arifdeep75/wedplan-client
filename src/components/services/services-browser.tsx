"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownWideNarrow, MapPin, RotateCw, Search, X } from "lucide-react";

import ServiceCard, {
  type ServiceCardData,
} from "@/components/services/service-card";
import { SERVICE_CATEGORIES } from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const ALL_CATEGORIES = "All";
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

type LoadState = "loading" | "ready" | "error";

interface ServicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ServicesBrowser() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [location, setLocation] = useState("");
  const deferredLocation = useDeferredValue(location.trim());
  const [sort, setSort] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState<string>(() => {
    const requested = searchParams.get("category");

    return requested && (SERVICE_CATEGORIES as readonly string[]).includes(requested)
      ? requested
      : ALL_CATEGORIES;
  });
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [pagination, setPagination] = useState<ServicePagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const params = new URLSearchParams({ limit: "24", page: String(page) });

    if (category !== ALL_CATEGORIES) params.set("category", category);
    if (deferredSearch) params.set("search", deferredSearch);
    if (deferredLocation) params.set("location", deferredLocation);
    if (sort !== "newest") params.set("sort", sort);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

    fetch(`${API_URL}/api/services?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          data?: ServiceCardData[];
          pagination?: ServicePagination;
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
          setPagination(
            result.pagination ?? {
              page,
              limit: 24,
              total: result.data.length,
              totalPages: 1,
            }
          );
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
  }, [deferredSearch, deferredLocation, sort, category, minPrice, maxPrice, page, reloadKey]);

  const isFiltering =
    state === "loading" ||
    search.trim() !== deferredSearch ||
    location.trim() !== deferredLocation;
  const hasFilters =
    search.trim().length > 0 ||
    location.trim().length > 0 ||
    minPrice.trim().length > 0 ||
    maxPrice.trim().length > 0 ||
    sort !== "newest" ||
    category !== ALL_CATEGORIES;

  function resetFilters() {
    setSearch("");
    setLocation("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setCategory(ALL_CATEGORIES);
    setPage(1);
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
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_220px_260px]">
            <div className="relative w-full lg:flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name, details or vendor…"
                aria-label="Search by service, description or vendor"
                className="h-12 w-full border border-[#e9e7e4] bg-white pl-11 pr-11 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#999999] transition hover:text-[#252525]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-56">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />

              <input
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setPage(1);
                }}
                placeholder="Filter by location…"
                aria-label="Filter services by location"
                className="h-12 w-full border border-[#e9e7e4] bg-white pl-11 pr-11 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />

              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation("");
                    setPage(1);
                  }}
                  aria-label="Clear location filter"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#999999] transition hover:text-[#252525]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-56">
              <ArrowDownWideNarrow
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
              />

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                aria-label="Sort services by price"
                className="h-12 w-full appearance-none border border-[#e9e7e4] bg-white pl-11 pr-9 text-sm text-[#252525] outline-none transition-colors focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="grid grid-cols-2 gap-2">
              <legend className="sr-only">Filter by price range</legend>
              <input
                type="number"
                min="0"
                step="1"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="Min price"
                aria-label="Minimum service price"
                className="h-12 min-w-0 border border-[#e9e7e4] bg-white px-3 text-sm text-[#252525] outline-none placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="Max price"
                aria-label="Maximum service price"
                className="h-12 min-w-0 border border-[#e9e7e4] bg-white px-3 text-sm text-[#252525] outline-none placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
              />
            </fieldset>
          </div>

          <p className="mt-3 text-xs text-[#999999]" aria-live="polite">
            {state === "ready"
              ? `${pagination.total} ${
                  pagination.total === 1 ? "service" : "services"
                }${hasFilters ? " found" : " available"}`
              : "Loading services…"}
            {isFiltering && state === "ready" && (
              <span className="ml-2 text-[#b9a6a0]">· updating</span>
            )}
          </p>

          {/* Category chips */}
          <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[ALL_CATEGORIES, ...SERVICE_CATEGORIES].map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setPage(1);
                  }}
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

          {state === "ready" && pagination.totalPages > 1 && (
            <nav
              aria-label="Service results pages"
              className="mt-10 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="h-10 border border-[#e9e7e4] bg-white px-4 text-xs font-semibold text-[#252525] transition hover:border-[#252525] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-[#737373]" aria-live="polite">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage(
                    Math.min(pagination.totalPages, pagination.page + 1)
                  )
                }
                disabled={pagination.page >= pagination.totalPages}
                className="h-10 border border-[#e9e7e4] bg-white px-4 text-xs font-semibold text-[#252525] transition hover:border-[#252525] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
