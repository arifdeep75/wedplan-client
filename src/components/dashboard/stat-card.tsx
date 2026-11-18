import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}

export default function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="group border border-[#e9e7e4] bg-white p-5 transition-colors duration-300 hover:border-[#c9bcb7] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999999]">
          {label}
        </p>

        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.5}
            className="shrink-0 text-[#c9bcb7] transition-colors group-hover:text-[#b9a6a0]"
          />
        )}
      </div>

      <p className="mt-3 font-heading text-3xl leading-none text-[#252525] sm:text-4xl">
        {value}
      </p>

      {hint && <p className="mt-2 text-xs leading-5 text-[#999999]">{hint}</p>}
    </div>
  );
}
