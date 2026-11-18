const styles: Record<string, string> = {
  pending: "border-[#d8c6bd] bg-[#faf5f1] text-[#8a6b5d]",
  accepted: "border-[#252525] bg-[#252525] text-white",
  approved: "border-[#252525] bg-[#252525] text-white",
  active: "border-[#252525] bg-[#252525] text-white",
  rejected: "border-[#e9e7e4] bg-white text-[#999999]",
  cancelled: "border-[#e9e7e4] bg-white text-[#999999]",
  inactive: "border-[#e9e7e4] bg-white text-[#999999]",
  blocked: "border-[#e8d5d5] bg-[#fbf6f6] text-[#b91c1c]",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Tiny status pill used across every dashboard. All values stay inside the
// black / white / warm-muted palette.
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = styles[status] ?? "border-[#e9e7e4] bg-white text-[#737373]";

  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
        style
      } ${className ?? ""}`}
    >
      {status}
    </span>
  );
}
