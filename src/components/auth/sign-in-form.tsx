"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient, dashboardPath, type AuthUser } from "@/lib/auth-client";
import { validateEmail } from "@/lib/validation";
import TextField from "./text-field";

function friendlyAuthError(message?: string | null): string {
  const normalized = (message || "").toLowerCase();

  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (normalized.includes("user not found")) {
    return "No account found with this email. Please create one first.";
  }

  return message || "Sign in failed. Please try again.";
}

export default function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email: string | null }>({
    email: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // The session is server-verified; the role for redirecting comes from it.
  const { data: session } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;

  useEffect(() => {
    if (user) {
      router.replace(dashboardPath(user.role));
    }
  }, [user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const emailError = validateEmail(email);

    setErrors({ email: emailError });

    if (emailError) {
      toast.error(emailError);
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(friendlyAuthError(error.message));
        return;
      }

      toast.success(`Welcome back${data?.user?.name ? `, ${data.user.name}` : ""}!`);
      router.push(dashboardPath((data?.user as AuthUser | undefined)?.role));
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (googleLoading) return;

    setGoogleLoading(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/auth/complete`,
    });

    if (error) {
      setGoogleLoading(false);
      toast.error(
        error.message?.includes("not configured") || error.status === 400
          ? "Google sign-in is not available right now. Please sign in with your email and password."
          : "Google sign-in failed. Please try again."
      );
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#f4f4f2] px-5 py-16 md:py-24">
      <div className="w-full max-w-md border border-[#e9e7e4] bg-white p-8 shadow-sm md:p-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
          Welcome back
        </p>

        <h1 className="font-heading text-4xl leading-tight text-[#252525]">
          Sign in to
          <span className="italic text-[#b9a6a0]"> WedPlan</span>
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#737373]">
          Pick up your planning right where you left off.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setErrors({ email: email ? validateEmail(email) : null })}
            error={errors.email}
            placeholder="jane@example.com"
            autoComplete="email"
            disabled={submitting || googleLoading}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={submitting || googleLoading}
          />

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#252525] text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing you in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#e9e7e4]" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#aaaaaa]">
            or
          </span>
          <span className="h-px flex-1 bg-[#e9e7e4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || googleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 border border-[#e9e7e4] bg-white text-sm font-semibold text-[#252525] transition-colors duration-200 hover:border-[#b9a6a0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-[#737373]">
          New to WedPlan?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#252525] underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.47 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
