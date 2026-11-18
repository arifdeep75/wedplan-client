import type { Metadata } from "next";

import ServiceDetail from "@/components/services/service-detail";

// The details page reads runtime params and fetches its data on the client,
// so a blocking render is the honest trade-off here.
export const instant = false;

export const metadata: Metadata = {
  title: "Service details",
  description:
    "View service details, the vendor behind it, and send a booking request on WedPlan.",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceDetail serviceId={id} />;
}
