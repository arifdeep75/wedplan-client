import type { Metadata } from "next";
import PlaceholderHero from "@/components/shared/placeholder-hero";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default function CustomerDashboardPage() {
  return (
    <PlaceholderHero
      kicker="Customer dashboard"
      title="Your planning hub is on the way"
      description="Bookings, saved services, and everything you need to plan your celebration will live here."
    />
  );
}
