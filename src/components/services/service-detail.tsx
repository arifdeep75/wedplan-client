"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  MapPin,
  RotateCw,
  Search,
  UserRound,
} from "lucide-react";

import BookingPanel from "@/components/services/booking-panel";
import ServiceCard, {
  type ServiceCardData,
} from "@/components/services/service-card";
import ServiceDetailSkeleton from "@/components/services/service-detail-skeleton";
import { ApiError, api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ServiceDetailData extends ServiceCardData {
  description: string | null;
  images: string[];
}

type LoadState = "loading" | "ready" | "error" | "missing";

export default function ServiceDetail({ serviceId }: { serviceId: string }) {
  const [service, setService] = useState<ServiceDetailData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [related, setRelated] = useState<ServiceCardData[]>([]);

  useEffect(() => {
    let active = true;

    api<{ success: boolean; data: ServiceDetailData }>(
      `/api/services/${serviceId}`
    )
      .then((result) => {
        if (!active) return;
        setService(result.data);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        setState(
          error instanceof ApiError && error.status === 404 ? "missing" : "error"
        );
      });

    return () => {
      active = false;
    };
  }, [serviceId, reloadKey]);

  const category = service?.category;

  // "More in this category" — only requested once the service is known.
  useEffect(() => {
    if (!category) return;

    let active = true;

    fetch(
      `${API_URL}/api/services?limit=4&category=${encodeURIComponent(category)}`
    )
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          data?: ServiceCardData[];
        };

        if (!active || !response.ok || !result.success || !result.data) return;

        setRelated(result.data.filter((item) => item.id !== serviceId).slice(0, 3));
      })
      .catch(() => {
        if (active) setRelated([]);
      });

    return () => {
      active = false;
    };
  }, [category, serviceId]);

  const gallery = service
    ? Array.from(
        new Set(
          [service.image, ...service.images].filter(
            (item): item is string => Boolean(item)
          )
        )
      )
    : [];

  const shownImage =
    selectedImage && gallery.includes(selectedImage)
      ? selectedImage
      : (gallery[0] ?? null);

  if (state === "loading") {
    return <ServiceDetailSkeleton />;
  }

  if (state === "missing") {
    return (
      <EmptyState
        icon={Search}
        title="This service isn't available"
        description="It may have been paused or is still waiting for approval. Explore other professionals while you're here."
      />
    );
  }

  if (state === "error" || !service) {
    return (
      <EmptyState
        icon={RotateCw}
        title="We couldn't load this service"
        description="Please check your connection and try again."
        action={
          <button
            type="button"
            onClick={() => {
              setState("loading");
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center gap-2 border border-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#252525] transition hover:bg-[#252525] hover:text-white"
          >
            <RotateCw size={14} />
            Try again
          </button>
        }
      />
    );
  }

  const vendorLabel = service.vendor.businessName || service.vendor.name;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-[#e9e7e4] bg-[#fafaf8]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-4 text-[11px] text-[#999999] md:px-8 lg:px-10">
          <Link href="/" className="transition hover:text-[#252525]">
            Home
          </Link>
          <ChevronRight size={12} className="text-[#cccccc]" />
          <Link href="/services" className="transition hover:text-[#252525]">
            Browse services
          </Link>
          <ChevronRight size={12} className="text-[#cccccc]" />
          <span className="truncate text-[#555555]">{service.serviceName}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
          {/* Main column */}
          <div className="min-w-0">
            {/* Gallery */}
            <div className="border border-[#e9e7e4] bg-[#f4f4f2]">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {shownImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shownImage}
                    alt={service.serviceName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound
                      size={44}
                      strokeWidth={1.2}
                      className="text-[#c9bcb7]"
                    />
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-2 border-t border-[#e9e7e4] bg-white p-3">
                  {gallery.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSelectedImage(src)}
                      aria-label={`View image ${index + 1}`}
                      className={`h-16 w-20 shrink-0 overflow-hidden border transition ${
                        shownImage === src
                          ? "border-[#252525]"
                          : "border-[#e9e7e4] hover:border-[#b9a6a0]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/services"
                  className="border border-[#e9e7e4] bg-[#fafaf8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373] transition hover:border-[#b9a6a0] hover:text-[#252525]"
                >
                  {service.category}
                </Link>

                <span className="flex items-center gap-1.5 text-xs text-[#888888]">
                  <MapPin size={13} className="text-[#b9a6a0]" />
                  {service.location}
                </span>
              </div>

              <h1 className="mt-4 font-heading text-3xl leading-tight text-[#252525] sm:text-4xl md:text-5xl">
                {service.serviceName}
              </h1>

              <p className="mt-3 text-sm text-[#737373]">
                Starting from{" "}
                <span className="font-semibold text-[#252525]">
                  {formatPrice(service.price)}
                </span>
              </p>
            </div>

            {/* Vendor */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[#f0eeeb] py-5">
              <div className="flex min-w-0 items-center gap-3">
                <VendorAvatar
                  image={service.vendor.image}
                  name={service.vendor.name}
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a58f88]">
                    Offered by
                  </p>
                  <p className="truncate text-sm font-semibold text-[#252525]">
                    {vendorLabel}
                  </p>
                  {service.vendor.businessName && (
                    <p className="truncate text-xs text-[#999999]">
                      {service.vendor.name}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#999999]">
                Reviewed and approved by WedPlan
              </p>
            </div>

            {/* Description */}
            <section className="mt-8">
              <h2 className="font-heading text-2xl text-[#252525]">
                About this service
              </h2>

              {service.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#555555]">
                  {service.description}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-8 text-[#999999]">
                  This vendor hasn&rsquo;t added a description yet — send a
                  request and ask them for the details you need.
                </p>
              )}
            </section>

            {/* Facts */}
            <section className="mt-8 grid gap-px border border-[#e9e7e4] bg-[#e9e7e4] sm:grid-cols-3">
              <Fact label="Category" value={service.category} />
              <Fact label="Location" value={service.location} />
              <Fact label="Starting price" value={formatPrice(service.price)} />
            </section>
          </div>

          {/* Booking column */}
          <aside className="lg:sticky lg:top-24">
            <BookingPanel
              serviceId={service.id}
              serviceName={service.serviceName}
              price={service.price}
              vendorName={vendorLabel}
            />

            <Link
              href="/services"
              className="mt-4 flex h-11 items-center justify-center gap-2 border border-[#e9e7e4] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
            >
              Back to all services
            </Link>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#e9e7e4] pt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
                  Keep exploring
                </p>
                <h2 className="mt-1 font-heading text-3xl text-[#252525]">
                  More in {service.category}
                </h2>
              </div>

              <Link
                href="/services"
                className="text-sm font-semibold text-[#252525] transition hover:text-[#9b8179]"
              >
                Browse all services
              </Link>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item.id} service={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999999]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#252525]">{value}</p>
    </div>
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
        className="h-12 w-12 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] font-heading text-lg italic text-[#b9a6a0]">
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Search;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-24 md:px-8">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fafaf8]">
          <Icon size={24} strokeWidth={1.4} className="text-[#b9a6a0]" />
        </div>

        <h1 className="mt-6 font-heading text-3xl text-[#252525]">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[#737373]">{description}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {action}

          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#444444]"
          >
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}
