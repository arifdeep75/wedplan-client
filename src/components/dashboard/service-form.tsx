"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { SERVICE_CATEGORIES } from "@/lib/constants";

export interface ServiceFormValues {
  serviceName: string;
  category: string;
  price: string;
  location: string;
  description: string;
  image: string;
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
  image: "",
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

  function set<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};

    if (values.serviceName.trim().length < 3) {
      next.serviceName = "At least 3 characters";
    }

    const price = Number(values.price);

    if (!Number.isFinite(price) || price < 0) {
      next.price = "Enter a valid price";
    }

    if (values.location.trim().length < 2) {
      next.location = "Location is required";
    }

    if (values.description.trim().length > 0 && values.description.trim().length < 10) {
      next.description = "At least 10 characters (or leave empty)";
    }

    if (values.image.trim() && !/^https?:\/\//i.test(values.image.trim())) {
      next.image = "Must be a valid URL starting with http";
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
      image: values.image.trim(),
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

        <div>
          <label htmlFor="service-image" className={labelClass}>
            Cover image URL <span className="text-[#aaaaaa]">(optional)</span>
          </label>
          <input
            id="service-image"
            value={values.image}
            onChange={(event) => set("image", event.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          {errors.image && (
            <p className="mt-1.5 text-xs text-[#b91c1c]">{errors.image}</p>
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
          disabled={submitting}
          className="flex h-11 items-center justify-center gap-2 bg-[#252525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#444444] disabled:opacity-60"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Saving…" : "Save service"}
        </button>
      </div>
    </form>
  );
}
