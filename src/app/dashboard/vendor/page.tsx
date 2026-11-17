import type { Metadata } from "next";
import PlaceholderHero from "@/components/shared/placeholder-hero";

export const metadata: Metadata = {
  title: "Vendor dashboard",
};

export default function VendorDashboardPage() {
  return (
    <PlaceholderHero
      kicker="Vendor dashboard"
      title="Your business hub is on the way"
      description="Manage your services, bookings, and subscription from here in an upcoming release."
    />
  );
}
