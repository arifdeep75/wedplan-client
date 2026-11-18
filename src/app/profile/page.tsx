import type { Metadata } from "next";
import ProfileSettings from "@/components/profile/profile-settings";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default function ProfileSettingsPage() {
  return <ProfileSettings />;
}
