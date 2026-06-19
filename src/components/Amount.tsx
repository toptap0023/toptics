import { formatMoney } from "@/lib/format";

export function Amount({
  value,
  currency = "USD",
  signed = false,
  type,
  className = "",
}: {
  value: number;
  currency?: string;
  signed?: boolean;
  type?: "income" | "expense";
  className?: string;
}) {
  const color =
    type === "income"
      ? "text-pos"
      : type === "expense"
        ? "text-neg"
        : "";
  const display =
    type === "expense"
      ? formatMoney(-Math.abs(value), currency, { sign: signed })
      : type === "income"
        ? formatMoney(Math.abs(value), currency, { sign: signed })
        : formatMoney(value, currency, { sign: signed });

  return (
    <span className={`tabular-nums ${color} ${className}`}>{display}</span>
  );
}
