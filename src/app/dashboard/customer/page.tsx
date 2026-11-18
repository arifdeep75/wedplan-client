import type { Metadata } from "next";
import CustomerDashboard from "@/components/dashboard/customer-dashboard";

export const metadata: Metadata = {
  title: "Customer dashboard",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}
