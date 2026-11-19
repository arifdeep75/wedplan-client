import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";

import PaymentSuccess from "@/components/payments/payment-success";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your WedPlan premium payment has been verified.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-[#fafaf8] px-5 py-20 md:py-28">
          <div className="mx-auto max-w-xl border border-[#e9e7e4] bg-white px-6 py-14 text-center sm:px-10">
            <Loader2
              size={22}
              className="mx-auto animate-spin text-[#b9a6a0]"
            />
            <p className="mt-4 text-sm text-[#737373]">
              Confirming your payment…
            </p>
          </div>
        </section>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
}
