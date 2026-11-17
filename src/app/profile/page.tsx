import type { Metadata } from "next";
import PlaceholderHero from "@/components/shared/placeholder-hero";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default function ProfileSettingsPage() {
  return (
    <PlaceholderHero
      kicker="Profile settings"
      title="Manage your profile"
      description="Updating your name, profile image, and account details will be available here."
    />
  );
}
