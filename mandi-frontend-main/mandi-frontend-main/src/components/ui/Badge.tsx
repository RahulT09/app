import clsx from "clsx";

const tones: Record<string, string> = {
  PENDING: "bg-marigold/15 text-ink border-marigold/40",
  CONFIRMED: "bg-forest/10 text-forest border-forest/30",
  SHIPPED: "bg-ink/10 text-ink border-ink/30",
  DELIVERED: "bg-forest/15 text-forest border-forest/40",
  CANCELLED: "bg-brick/10 text-brick border-brick/30",
  PAID: "bg-forest/15 text-forest border-forest/40",
  FAILED: "bg-brick/10 text-brick border-brick/30",
  REFUNDED: "bg-ink/10 text-ink border-ink/30",
  default: "bg-ink/5 text-ink/70 border-line",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[status] ?? tones.default,
      )}
    >
      {status}
    </span>
  );
}
