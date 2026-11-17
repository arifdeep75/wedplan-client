import type { Metadata } from "next";
import SignUpForm from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join WedPlan as a customer planning your wedding or a vendor offering wedding services.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
