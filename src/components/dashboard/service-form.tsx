"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { SERVICE_CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";

export interface ServiceFormValues {
  serviceName: string;
  category: string;
  price: string;
  location: string;
  description: string;
  images: string[];
}

interface ServiceFormProps {
  title: string;
  initialValues?: ServiceFormValues;
  submitting: boolean;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
}

const emptyValues: ServiceFormValues = {
  serviceName: "",
  category: SERVICE_CATEGORIES[0],
  price: "",
  location: "",
  description: "",
  images: [],
};

const inputClass =
  "h-12 w-full border border-[#e9e7e4] bg-white px-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5";

const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555555]";

export default function ServiceForm({
  title,
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [values, setValues] = useState<ServiceFormValues>(
    initialValues ?? emptyValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState(false);

  function set<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (selected.length === 0) return;

    const remaining = 6 - values.images.length;

    if (remaining <= 0) {
      toast.error("Up to 6 service images are allowed");
      return;
    }

    if (selected.length > remaining) {
      toast.error(`You can add ${remaining} more image${remaining === 1 ? "" : "s"}`);
    }

    const files = selected.slice(0, remaining);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      toast.error("Please choose image files only");
    }

    if (validFiles.length === 0) return;

    setUploadingImages(true);

    try {
      const results = await Promise.allSettled(validFiles.map(uploadImage));
      const uploaded = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : []
      );
      const failed = results.filter((result) => result.status === "rejected");

      if (uploaded.length > 0) {
        setValues((current) => ({
          ...current,
          images: [...current.images, ...uploaded].slice(0, 6),
        }));
        toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
      }

      if (failed.length > 0) {
        const reason = failed[0].reason;
        toast.error(
          reason instanceof Error ? reason.message : "Some images could not be uploaded"
        );
      }
    } finally {
      setUploadingImages(false);
    }
  }

  function validate() {
    const next: Record<string, string> = {};

    if (values.serviceName.trim().length < 3) {
      next.serviceName = "At least 3 characters";
    }

    const price = Number(values.price);

    if (!values.price.trim() || !Number.isInteger(price) || price < 0) {
      next.price = "Enter a whole-number price";
    }

    if (values.location.trim().length < 2) {
      next.location = "Location is required";
    }

    if (values.description.trim().length > 0 && values.description.trim().length < 10) {
      next.description = "At least 10 characters (or leave empty)";
    }

    if (values.images.length > 6) {
      next.images = "Up to 6 images are allowed";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...values,
      serviceName: values.serviceName.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
      images: values.images,
      price: String(Number(values.price)),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#e9e7e4] bg-white p-5 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="font-heading text-xl text-[#252525]">{title}</h3>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close form"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#e9e7e4] text-[#737373] transition hover:border-[#252525] hover:text-[#252525]"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="service-name" className={labelClass}>
            Service name
          </label>
          <input
            id="service-name"
            value={values.serviceName}
            onChange={(event) => set("serviceName", event.target.value)}
            placeholder="e.g. Timeless Wedding Photography"
            className={inputClass}
          />
          {errors.serviceName && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.serviceName}</p>
          )}
        </div>

        <div>
          <label htmlFor="service-category" className={labelClass}>
            Category
          </label>
          <select
            id="service-category"
            value={values.category}
            onChange={(event) => set("category", event.target.value)}
            className={inputClass}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service-price" className={labelClass}>
            Starting price (৳)
          </label>
          <input
            id="service-price"
            type="number"
            min="0"
            inputMode="numeric"
            value={values.price}
            onChange={(event) => set("price", event.target.value)}
            placeholder="65000"
            className={inputClass}
          />
          {errors.price && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="service-location" className={labelClass}>
            Location
          </label>
          <input
            id="service-location"
            value={values.location}
            onChange={(event) => set("location", event.target.value)}
            placeholder="Dhaka"
            className={inputClass}
          />
          {errors.location && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.location}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-images" className={labelClass}>
            Service images <span className="text-[#aaaaaa]">(up to 6, 5 MB each)</span>
          </label>
          <label
            htmlFor="service-images"
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-dashed border-[#d6d1cb] bg-[#fafaf8] px-4 py-3 text-sm text-[#555555] transition-colors hover:border-[#b9a6a0] disabled:opacity-60"
          >
            {uploadingImages ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            {uploadingImages ? "Uploading images…" : "Choose image files"}
          </label>
          <input
            id="service-images"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            disabled={uploadingImages || submitting || values.images.length >= 6}
            onChange={handleImageSelection}
            className="sr-only"
          />

          {values.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {values.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden border border-[#e9e7e4] bg-[#f4f4f2]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Service image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "images",
                        values.images.filter((_, imageIndex) => imageIndex !== index)
                      )
                    }
                    disabled={uploadingImages || submitting}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/90 text-[#555555] hover:text-[#b91c1c] disabled:opacity-60"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.images}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-description" className={labelClass}>
            Description <span className="text-[#aaaaaa]">(optional)</span>
          </label>
          <textarea
            id="service-description"
            rows={4}
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="Tell couples what makes your service special…"
            className="w-full border border-[#e9e7e4] bg-white px-4 py-3 text-sm leading-6 text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5"
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="h-11 border border-[#e9e7e4] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#737373] transition hover:border-[#252525] hover:text-[#252525] disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || uploadingImages}
          className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444] disabled:opacity-60"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Saving…" : "Save service"}
        </button>
      </div>
    </form>
  );
}
