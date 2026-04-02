import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatElo(elo: number): string {
  return elo.toLocaleString("fr-FR");
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  expert: "Expert",
};

export const CATEGORY_LABELS: Record<string, string> = {
  sql: "SQL",
  machine_learning: "Machine Learning",
  deep_learning: "Deep Learning",
  nlp: "NLP",
  computer_vision: "Vision",
  visualization: "Visualisation",
  data_engineering: "Data Eng.",
};

export const CATEGORY_ICONS: Record<string, string> = {
  sql: "🗄️",
  machine_learning: "🤖",
  deep_learning: "🧠",
  nlp: "💬",
  computer_vision: "👁️",
  visualization: "📊",
  data_engineering: "⚙️",
};

export const RANK_ICONS: Record<string, string> = {
  Rookie: "🔰",
  Analyst: "📊",
  Expert: "⚡",
  Master: "🔮",
  "Grand Master": "👑",
};

export const RANK_COLORS: Record<string, string> = {
  Rookie: "text-slate-500",
  Analyst: "text-green-600",
  Expert: "text-blue-600",
  Master: "text-purple-600",
  "Grand Master": "text-amber-600",
};
