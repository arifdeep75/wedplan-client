"use client";

import { Loader2 } from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { useAuthGuard } from "@/components/dashboard/use-role-guard";
import ProfileForm from "@/components/profile/profile-form";

export default function ProfileSettings() {
  const { user, ready } = useAuthGuard();

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#fafaf8]">
        <div className="flex items-center gap-3 text-sm text-[#999999]">
          <Loader2 size={18} className="animate-spin text-[#b9a6a0]" />
          Loading your profile…
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      kicker="Profile settings"
      title={
        <>
          Make it
          <span className="italic text-[#b9a6a0]"> personal</span>
        </>
      }
      description="Update how you appear across WedPlan — your name, photo, and business identity."
      user={user}
    >
      <ProfileForm key={user.id} user={user} />
    </DashboardShell>
  );
}
