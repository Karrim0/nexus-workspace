export const LABEL_COLORS = [
  "slate",
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

export const LABEL_COLOR_META: Record<
  LabelColor,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  slate: {
    label: "Slate",
    badgeClassName: "border-zinc-700 bg-zinc-900 text-zinc-300",
    dotClassName: "bg-zinc-400",
  },
  blue: {
    label: "Blue",
    badgeClassName: "border-blue-900/70 bg-blue-950/35 text-blue-300",
    dotClassName: "bg-blue-400",
  },
  violet: {
    label: "Violet",
    badgeClassName: "border-violet-900/70 bg-violet-950/35 text-violet-300",
    dotClassName: "bg-violet-400",
  },
  emerald: {
    label: "Emerald",
    badgeClassName: "border-emerald-900/70 bg-emerald-950/35 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  amber: {
    label: "Amber",
    badgeClassName: "border-amber-900/70 bg-amber-950/35 text-amber-300",
    dotClassName: "bg-amber-400",
  },
  rose: {
    label: "Rose",
    badgeClassName: "border-rose-900/70 bg-rose-950/35 text-rose-300",
    dotClassName: "bg-rose-400",
  },
};

export function isLabelColor(value: string): value is LabelColor {
  return LABEL_COLORS.includes(value as LabelColor);
}

export function normalizeLabelColor(value: string): LabelColor {
  return isLabelColor(value) ? value : "slate";
}
