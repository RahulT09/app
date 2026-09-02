import clsx from "clsx";
import { formatPrice } from "@/lib/format";

export function PriceTag({
  amount,
  size = "md",
  tone = "dark",
  className,
}: {
  amount: number;
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm py-0.5",
    md: "text-base py-1",
    lg: "text-2xl py-1.5",
  };
  const tones = {
    dark: "bg-ink text-paper",
    light: "bg-paper text-ink border border-line",
  };

  return (
    <span
      className={clsx(
        "price-tag inline-flex items-center font-mono font-medium pr-3",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {formatPrice(amount)}
    </span>
  );
}
