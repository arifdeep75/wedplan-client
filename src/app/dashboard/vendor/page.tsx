import type { Metadata } from "next";
import VendorDashboard from "@/components/dashboard/vendor-dashboard";

export const metadata: Metadata = {
  title: "Vendor dashboard",
};

export default function VendorDashboardPage() {
  return <VendorDashboard />;
}
