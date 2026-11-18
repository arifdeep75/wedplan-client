import Link from "next/link";
import { ArrowUpRight, MapPin, UserRound } from "lucide-react";

import { formatPrice } from "@/lib/format";

export interface ServiceCardData {
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
    isPremium?: boolean;
  };
}

interface ServiceCardProps {
  service: ServiceCardData;
}

// Editorial service card shared by the home page and the browse page.
export default function ServiceCard({ service }: ServiceCardProps) {
  return (
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

        {service.vendor.isPremium && (
          <span className="absolute right-4 top-4 border border-[#252525] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#252525]">
            Premium
          </span>
        )}
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
