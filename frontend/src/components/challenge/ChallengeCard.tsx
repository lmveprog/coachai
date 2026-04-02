"use client";

import Link from "next/link";
import { Lock, Users, TrendingUp, CheckCircle } from "lucide-react";
import { cn, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";
import type { Challenge } from "@/types";

const DIFF_BORDER: Record<string, string> = {
  easy: "border-l-green-400",
  medium: "border-l-amber-400",
  hard: "border-l-red-400",
  expert: "border-l-purple-500",
};

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <Link href={`/challenges/${challenge.slug}`}>
      <div className={cn(
        "glass glass-hover rounded-2xl p-5 h-full flex flex-col gap-4 group border border-blue-100/60 border-l-4",
        DIFF_BORDER[challenge.difficulty] ?? "border-l-blue-400"
      )}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors text-xl">
            {CATEGORY_ICONS[challenge.category] ?? "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-600 font-medium">{CATEGORY_LABELS[challenge.category] ?? challenge.category}</span>
              {challenge.is_premium && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-medium">
                  <Lock className="w-3 h-3" /> Pro
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Tags */}
        {challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {challenge.total_attempts}
            </span>
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              <TrendingUp className="w-3 h-3" />
              +{challenge.elo_reward}
            </span>
          </div>
        </div>

        {/* Solve rate */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Résolution
            </span>
            <span className="font-medium text-slate-600">{challenge.solve_rate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-50 border border-blue-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
              style={{ width: `${Math.min(challenge.solve_rate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
