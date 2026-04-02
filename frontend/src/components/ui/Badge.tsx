import { cn } from "@/lib/utils";

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "text-green-700 bg-green-50 border-green-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  hard: "text-red-700 bg-red-50 border-red-200",
  expert: "text-purple-700 bg-purple-50 border-purple-200",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  expert: "Expert",
};

const RANK_STYLES: Record<string, string> = {
  Rookie: "text-slate-600 bg-slate-50 border-slate-200",
  Analyst: "text-green-700 bg-green-50 border-green-200",
  Expert: "text-blue-700 bg-blue-50 border-blue-200",
  Master: "text-purple-700 bg-purple-50 border-purple-200",
  "Grand Master": "text-amber-700 bg-amber-50 border-amber-200",
};

const RANK_ICONS: Record<string, string> = {
  Rookie: "🔰",
  Analyst: "📊",
  Expert: "⚡",
  Master: "🔮",
  "Grand Master": "👑",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg border", DIFFICULTY_STYLES[difficulty] ?? "text-slate-600 bg-slate-50 border-slate-200")}>
      {DIFFICULTY_LABELS[difficulty] ?? difficulty}
    </span>
  );
}

export function RankBadge({ rank, size = "sm" }: { rank: string; size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-semibold rounded-lg border",
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
      RANK_STYLES[rank] ?? "text-slate-600 bg-slate-50 border-slate-200"
    )}>
      <span>{RANK_ICONS[rank]}</span>
      {rank}
    </span>
  );
}

export function CategoryBadge({ category, label }: { category: string; label: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
      {label}
    </span>
  );
}
