import { formatMoney } from "@/lib/format";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  segments,
  currency = "USD",
  centerLabel = "Spent",
}: {
  segments: DonutSegment[];
  currency?: string;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 168;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs =
    total > 0
      ? segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const arc = {
              color: s.color,
              dash,
              gap: circumference - dash,
              offset: -offset,
            };
            offset += dash;
            return arc;
          })
      : [];

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="flex-none -rotate-90"
        role="img"
        aria-label={`Spending total ${formatMoney(total, currency)}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-bg-panel2"
          strokeWidth={stroke}
        />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
          />
        ))}
        <g className="rotate-90" style={{ transformOrigin: "center" }}>
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            className="fill-ink-muted"
            style={{ fontSize: 11 }}
          >
            {centerLabel}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            {formatMoney(total, currency)}
          </text>
        </g>
      </svg>

      <ul className="flex-1 min-w-0 flex flex-col gap-2">
        {segments.slice(0, 6).map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full flex-none"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="truncate text-ink-muted">{s.label}</span>
            <span className="ml-auto tabular-nums text-ink">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
