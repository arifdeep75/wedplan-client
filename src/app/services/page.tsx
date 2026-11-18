import type { Metadata } from "next";
import ServicesBrowser from "@/components/services/services-browser";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Explore trusted wedding photographers, venues, decorators, caterers, makeup artists and fashion studios on WedPlan.",
};

export default function ServicesPage() {
  return <ServicesBrowser />;
}
