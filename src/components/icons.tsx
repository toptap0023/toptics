import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

/** The TOPtics "T" monogram (matches the favicon). Transparent background —
 *  place it on a dark, framed container. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <rect x="120" y="156" width="272" height="64" rx="14" fill="#ffffff" />
      <rect x="224" y="156" width="64" height="232" rx="14" fill="#ffffff" />
      <circle cx="392" cy="148" r="42" fill="#0a84ff" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <path d="M16.5 13.5h.01" />
    </svg>
  );
}

/* ---- Category glyphs (referenced by Category.icon) ---- */

export function CartIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H5" />
    </svg>
  );
}

export function FoodIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M5 3v8M8 3v8M5 11h3M6.5 11v10" />
      <path d="M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5Z" />
      <path d="M17 12v9" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M4 13h16v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <path d="M7 16h.01M17 16h.01" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 20s-7-4.6-9.3-9.1A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.3 4.9C19 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M6 7h12l1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l5 3-5 3Z" fill="currentColor" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M3 7v5.6a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8l-7-7A2 2 0 0 0 12.6 3H7a4 4 0 0 0-4 4Z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M6 3h12v18l-3-1.6L12 21l-3-1.6L6 21Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
    </svg>
  );
}

export function MassageIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M12 4c2.6 0 4 2 4 4 0 2.4-1.8 4-4 4s-4-1.6-4-4c0-2 1.4-4 4-4Z" />
      <path d="M5 20c1.8-3 4.2-4.5 7-4.5S17.2 17 19 20" />
    </svg>
  );
}

export function BallIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9.5c4 1 13 1 17 0M3.5 14.5c4-1 13-1 17 0M9.5 3.4c-1.4 5-1.4 13 0 17.2M14.5 3.4c1.4 5 1.4 13 0 17.2" />
    </svg>
  );
}

export function FuelIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M4 21h12" />
      <path d="M8.5 9h5" />
      <path d="M15 8l2.5 2.5V17a1.8 1.8 0 0 0 3 0v-7l-3-3" />
    </svg>
  );
}

export function CatIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <path d="M5 6l1.5 4M19 6l-1.5 4" />
      <path d="M6.5 10c-.6 1.2-1 2.6-1 4 0 3.6 2.9 6 6.5 6s6.5-2.4 6.5-6c0-1.4-.4-2.8-1-4" />
      <path d="M9.5 13.5h.01M14.5 13.5h.01" />
      <path d="M12 15.5v1M10 17.5h4" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M17 14.3a5.5 5.5 0 0 1 3.5 5.7" />
    </svg>
  );
}

/** Map a category icon key (stored in DB) to a component. */
export const CATEGORY_ICONS: Record<
  string,
  (props: IconProps) => React.ReactElement
> = {
  wallet: WalletIcon,
  plus: PlusIcon,
  cart: CartIcon,
  food: FoodIcon,
  expenses: ReceiptIcon,
  shopping: BagIcon,
  transport: CarIcon,
  sport: DumbbellIcon,
  massage: MassageIcon,
  ball: BallIcon,
  fuel: FuelIcon,
  housing: HomeIcon,
  cat: CatIcon,
  family: UsersIcon,
  car: CarIcon,
  home: HomeIcon,
  bolt: BoltIcon,
  heart: HeartIcon,
  bag: BagIcon,
  play: PlayIcon,
  tag: TagIcon,
};

export function CategoryGlyph({
  icon,
  ...props
}: { icon: string } & IconProps) {
  const Cmp = CATEGORY_ICONS[icon] ?? TagIcon;
  return <Cmp {...props} />;
}
