import type { Metadata } from "next";
import PlaceholderHero from "@/components/shared/placeholder-hero";

export const metadata: Metadata = {
  title: "Admin dashboard",
};

export default function AdminDashboardPage() {
  return (
    <PlaceholderHero
      kicker="Admin dashboard"
      title="Administration is on the way"
      description="Platform management tools for services, bookings, and users will live here."
    />
  );
}
