"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { authClient, type AuthUser } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { uploadProfileImage } from "@/lib/upload";

interface ProfileFormProps {
  user: AuthUser & {
    businessName?: string | null;
    subscriptionPlan?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name ?? "");
  const [businessName, setBusinessName] = useState(user.businessName ?? "");
  const [image, setImage] = useState<string>(user.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVendor = user.role === "vendor";
  const initial = (name || user.name || "?").charAt(0).toUpperCase();

  const changed =
    name.trim() !== (user.name ?? "") ||
    image !== (user.image ?? "") ||
    (isVendor && businessName.trim() !== (user.businessName ?? ""));

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploading(true);

    try {
      const url = await uploadProfileImage(file);
      setImage(url);
      toast.success("Photo uploaded — save to apply");
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setSaving(true);

    try {
      await api("/api/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: trimmedName,
          image: image.trim() || null,
          ...(isVendor ? { businessName: businessName.trim() } : {}),
        }),
      });

      // Refresh the shared session store so the navbar shows the new name
      await authClient.getSession();

      toast.success("Profile updated");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
      {/* Identity card */}
      <div className="border border-[#e9e7e4] bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name || "Profile"}
                className="h-24 w-24 rounded-full border border-[#e9e7e4] object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4f4f2] font-heading text-3xl italic text-[#b9a6a0]">
                {initial}
              </span>
            )}

            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 size={22} className="animate-spin text-white" />
              </span>
            )}
          </div>

          <h2 className="mt-4 font-heading text-xl text-[#252525]">
            {name || "Your name"}
          </h2>

          <span className="mt-1 inline-flex items-center gap-1.5 border border-[#e9e7e4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999999]">
            {user.role === "vendor" ? "Vendor" : user.role === "admin" ? "Admin" : "Customer"}
          </span>

          <p className="mt-2 text-xs text-[#999999]">{user.email}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload profile photo"
          />

          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-10 items-center justify-center gap-2 border border-[#252525] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#252525] transition hover:bg-[#252525] hover:text-white disabled:opacity-60"
            >
              <Camera size={14} />
              {uploading ? "Uploading…" : "Change photo"}
            </button>

            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="flex h-10 items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999999] transition hover:text-[#b91c1c]"
              >
                <Trash2 size={13} />
                Remove photo
              </button>
            )}
          </div>

          {/* Fallback when ImgBB is not configured: paste a hosted URL */}
          <div className="mt-4 w-full text-left">
            <label
              htmlFor="profile-image-url"
              className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#bbbbbb]"
            >
              Or use an image URL
            </label>
            <input
              id="profile-image-url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://…"
              className="h-10 w-full border border-[#e9e7e4] bg-white px-3 text-xs text-[#252525] outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-[#252525]"
            />
          </div>
        </div>
      </div>

      {/* Editable details */}
      <form
        onSubmit={handleSubmit}
        className="border border-[#e9e7e4] bg-white p-6 sm:p-8"
      >
        <div className="mb-6 border-b border-[#f0eeeb] pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a58f88]">
            Personal details
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[#252525]">
            Edit your information
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#999999]">
            This is how your name appears on bookings and across WedPlan.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]"
            >
              Full name
            </label>

            <div className="relative">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#bbbbbb]"
              />
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={80}
                className="h-12 w-full border border-[#e9e7e4] bg-white pl-11 pr-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
                placeholder="Your full name"
              />
            </div>
          </div>

          {isVendor && (
            <div>
              <label
                htmlFor="profile-business"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]"
              >
                Business name
              </label>
              <input
                id="profile-business"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                maxLength={120}
                className="h-12 w-full border border-[#e9e7e4] bg-white px-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
                placeholder="e.g. Studio Ayesha"
              />
              <p className="mt-1.5 text-xs text-[#999999]">
                Shown on your services instead of your personal name.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#bbbbbb]"
              />
              <input
                id="profile-email"
                value={user.email}
                readOnly
                disabled
                className="h-12 w-full cursor-not-allowed border border-[#e9e7e4] bg-[#fafaf8] pl-11 pr-4 text-sm text-[#999999]"
              />
            </div>
            <p className="mt-1.5 text-xs text-[#999999]">
              Email changes are not supported yet — contact support if needed.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-[#f0eeeb] bg-[#fafaf8] px-4 py-3 text-xs text-[#737373]">
            <ShieldCheck size={15} className="shrink-0 text-[#b9a6a0]" />
            Your role and account status are managed by WedPlan and cannot be
            changed here.
          </div>
        </div>

        {error && (
          <p className="mt-5 border border-[#f0d9d9] bg-[#fbf6f6] px-4 py-3 text-xs text-[#b91c1c]">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#f0eeeb] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[#bbbbbb]">
            {changed ? "You have unsaved changes" : "Everything is up to date"}
          </p>

          <button
            type="submit"
            disabled={saving || uploading || !changed}
            className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
