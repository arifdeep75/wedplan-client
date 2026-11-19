import type { Metadata } from "next";

import PaymentCancel from "@/components/payments/payment-cancel";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your WedPlan checkout was cancelled — your plan is unchanged.",
};

export default function PaymentCancelPage() {
  return <PaymentCancel />;
}
