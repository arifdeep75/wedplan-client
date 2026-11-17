"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Heart, Loader2, Store, X } from "lucide-react";
import { toast } from "sonner";

import { authClient, dashboardPath } from "@/lib/auth-client";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";
import { uploadProfileImage } from "@/lib/upload";
import TextField from "./text-field";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    description: "I'm planning my wedding",
    icon: Heart,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "I offer wedding services",
    icon: Store,
  },
] as const;

type Role = (typeof ROLES)[number]["value"];

type FieldErrors = {
  name: string | null;
  email: string | null;
  password: string | null;
};

function friendlyAuthError(message?: string | null): string {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("already")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (normalized.includes("password")) {
    return "Password must be at least 6 characters and contain an uppercase and a lowercase letter.";
  }

  return message || "Registration failed. Please try again.";
}

export default function SignUpForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({
    name: null,
    email: null,
    password: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleBlur(field: "name" | "email" | "password") {
    const value = field === "name" ? name : field === "email" ? email : password;
    const validator =
      field === "name"
        ? validateName
        : field === "email"
          ? validateEmail
          : validatePassword;

    const error = value ? validator(value) : null;

    setErrors((prev) => ({ ...prev, [field]: error }));
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
        error.message?.includes("not configured") ||
          error.status === 400 ||
          error.message === "PROVIDER_NOT_CONFIGURED"
          ? "Google sign-in is not available right now. Please register with email and password."
          : "Google sign-in failed. Please try again."
      );
    }
    // On success the browser is redirected to Google, so no further action.
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        try {
          imageUrl = await uploadProfileImage(imageFile);
        } catch (uploadError) {
          toast.error(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload profile image. You can try again or continue without one."
          );
          return;
        }
      }

      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: imageUrl,
        role,
      });

      if (error) {
        toast.error(friendlyAuthError(error.message));
        return;
      }

      // The role is confirmed by the server-issued session, not the form.
      toast.success("Account created. Welcome to WedPlan!");
      router.push(dashboardPath(data?.user?.role ?? role));
      router.refresh();
    } catch {
      toast.error(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] bg-white lg:grid-cols-2">
      {/* Visual panel — desktop only, keeps mobile clean */}
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            <span className="h-px w-9 bg-[#d8c8c3]" />
            WedPlan
          </p>

          <div>
            <p className="font-heading text-4xl leading-[1.2] text-white xl:text-[42px]">
              &ldquo;Whatever our souls are made of,
              <span className="block italic text-[#e8dcd8]">
                his and mine are the same.&rdquo;
              </span>
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-white/60">
              Start planning the day you&rsquo;ve imagined
            </p>
          </div>

          <p className="text-xs leading-6 text-white/60">
            One place to discover trusted wedding professionals and bring every
            detail together.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-5 py-14 md:px-10 md:py-20">
        <div className="w-full max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
            Join WedPlan
          </p>

          <h1 className="font-heading text-4xl leading-tight text-[#252525] md:text-[42px]">
            Create your
            <span className="italic text-[#b9a6a0]"> account</span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#737373]">
            A few details and your wedding planning journey can begin.
          </p>

          {/* Role selection */}
          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#555555]">
              Account role
            </p>

            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account role">
              {ROLES.map((option) => {
                const Icon = option.icon;
                const selected = role === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={submitting || googleLoading}
                    onClick={() => setRole(option.value)}
                    className={`flex flex-col items-start gap-2 border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? "border-[#252525] bg-[#252525] text-white"
                        : "border-[#e9e7e4] bg-white text-[#252525] hover:border-[#b9a6a0]"
                    }`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.7}
                      className={selected ? "text-[#e8dcd8]" : "text-[#b9a6a0]"}
                    />
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span
                      className={`text-[11px] leading-4 ${
                        selected ? "text-white/70" : "text-[#999999]"
                      }`}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <TextField
              label="Full name"
              name="name"
              value={name}
              onChange={setName}
              onBlur={() => handleBlur("name")}
              error={errors.name}
              placeholder="Jane Doe"
              autoComplete="name"
              disabled={submitting || googleLoading}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => handleBlur("email")}
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
              onBlur={() => handleBlur("password")}
              error={errors.password}
              hint="At least 6 characters, with one uppercase and one lowercase letter."
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting || googleLoading}
            />

            {/* Optional profile image */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#555555]">
                Profile image{" "}
                <span className="font-normal normal-case tracking-normal text-[#999999]">
                  (optional)
                </span>
              </p>

              {imagePreview ? (
                <div className="flex items-center gap-4 border border-[#e9e7e4] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-14 w-14 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#252525]">
                      {imageFile?.name}
                    </p>
                    <p className="text-xs text-[#999999]">
                      {(Number(imageFile?.size ?? 0) / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Remove profile image"
                    disabled={submitting || googleLoading}
                    className="flex h-9 w-9 items-center justify-center text-[#999999] transition-colors hover:text-[#b91c1c] disabled:pointer-events-none"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting || googleLoading}
                  className="flex w-full items-center justify-center gap-3 border border-dashed border-[#d6d1cb] bg-[#fafaf8] px-4 py-5 text-sm text-[#555555] transition-colors hover:border-[#b9a6a0] hover:text-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={18} strokeWidth={1.7} />
                  Click to upload a photo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Profile image"
                tabIndex={-1}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="flex h-12 w-full items-center justify-center gap-2 bg-[#252525] text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating your account…
                </>
              ) : (
                "Create account"
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
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-[#252525] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
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
