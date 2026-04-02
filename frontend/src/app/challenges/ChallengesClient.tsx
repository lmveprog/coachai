"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Zap, Filter, Flame, Crown } from "lucide-react";
import { challengesApi, submissionsApi } from "@/lib/api";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { cn, CATEGORY_LABELS, DIFFICULTY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { ChallengeCategory, ChallengeDifficulty } from "@/types";
import Link from "next/link";

const CATEGORIES: ChallengeCategory[] = ["sql", "machine_learning", "deep_learning", "nlp", "computer_vision", "visualization", "data_engineering"];
const DIFFICULTIES: ChallengeDifficulty[] = ["easy", "medium", "hard", "expert"];

const DIFF_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "text-green-700 border-green-200 bg-green-50 data-[active=true]:bg-green-100 data-[active=true]:border-green-400",
  medium: "text-amber-700 border-amber-200 bg-amber-50 data-[active=true]:bg-amber-100 data-[active=true]:border-amber-400",
  hard: "text-red-700 border-red-200 bg-red-50 data-[active=true]:bg-red-100 data-[active=true]:border-red-400",
  expert: "text-purple-700 border-purple-200 bg-purple-50 data-[active=true]:bg-purple-100 data-[active=true]:border-purple-400",
};

export function ChallengesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState<ChallengeCategory | "">(() => (searchParams.get("category") as ChallengeCategory) ?? "");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "">(() => (searchParams.get("difficulty") as ChallengeDifficulty) ?? "");
  const { user } = useAuthStore();

  // Sync filters to URL
  const syncUrl = useCallback((q: string, cat: string, diff: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    if (diff) params.set("difficulty", diff);
    const qs = params.toString();
    router.replace(qs ? `/challenges?${qs}` : "/challenges", { scroll: false });
  }, [router]);

  // Debounce search input by 350ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      syncUrl(search, category, difficulty);
    }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL immediately when category/difficulty change
  useEffect(() => {
    syncUrl(debouncedSearch, category, difficulty);
  }, [category, difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: challengeData, isLoading } = useQuery({
    queryKey: ["challenges", { search: debouncedSearch, category, difficulty }],
    queryFn: () =>
      challengesApi.list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
      }).then((r) => r.data),
  });
  const challenges = challengeData?.items ?? [];
  const totalChallenges = challengeData?.total ?? 0;

  const { data: dailyStatus } = useQuery({
    queryKey: ["daily-status"],
    queryFn: () => submissionsApi.dailyStatus().then((r) => r.data),
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const hasFilters = debouncedSearch || category || difficulty;

  function resetFilters() {
    setSearch("");
    setCategory("");
    setDifficulty("");
    router.replace("/challenges", { scroll: false });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">Challenges</h1>
            <p className="text-sm text-slate-400">
              {isLoading ? "Chargement..." : `${totalChallenges} challenge${totalChallenges !== 1 ? "s" : ""} disponible${totalChallenges !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {user && dailyStatus && !dailyStatus.is_premium && (
          <div className={cn(
            "rounded-2xl p-4 border flex items-center gap-4",
            (dailyStatus.remaining ?? 3) === 0
              ? "bg-red-50 border-red-200"
              : (dailyStatus.remaining ?? 3) <= 1
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-100"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              (dailyStatus.remaining ?? 3) === 0 ? "bg-red-100" : "bg-blue-100"
            )}>
              <Flame className={cn("w-5 h-5", (dailyStatus.remaining ?? 3) === 0 ? "text-red-500" : "text-blue-600")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">
                {(dailyStatus.remaining ?? 3) === 0
                  ? "Limite quotidienne atteinte"
                  : `${dailyStatus.remaining} challenge${(dailyStatus.remaining ?? 0) > 1 ? "s" : ""} restant${(dailyStatus.remaining ?? 0) > 1 ? "s" : ""} aujourd'hui`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(dailyStatus.remaining ?? 3) === 0
                  ? "Passe à Pro pour des challenges illimités chaque jour."
                  : `${dailyStatus.used}/${dailyStatus.limit} challenges utilisés — Plan Gratuit`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {Array.from({ length: dailyStatus.limit ?? 3 }).map((_, i) => (
                <span key={i} className={cn(
                  "w-3 h-3 rounded-full border-2",
                  i < (dailyStatus.used ?? 0)
                    ? "bg-slate-400 border-slate-400"
                    : "bg-white border-blue-300"
                )} />
              ))}
            </div>
            <Link href="/pricing" className="btn-primary text-xs px-3 py-2 flex-shrink-0">
              <Crown className="w-3.5 h-3.5" /> Pro
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-5 mb-8 border border-blue-100/60 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un challenge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-10 pr-10"
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
              <Filter className="w-3 h-3" /> Catégorie
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                  !category ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200" : "text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
                )}
              >
                Toutes
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === category ? "" : cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                    category === cat ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200" : "text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
                  )}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
              <SlidersHorizontal className="w-3 h-3" /> Difficulté
            </div>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  data-active={difficulty === diff}
                  onClick={() => setDifficulty(diff === difficulty ? "" : diff)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                    DIFF_STYLES[diff],
                    difficulty === diff ? "shadow-sm" : ""
                  )}
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasFilters && (
          <button onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            ✕ Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-4xl">🔍</div>
          <p className="text-slate-700 text-lg font-semibold">Aucun challenge trouvé</p>
          <p className="text-slate-400 text-sm mt-1">Essaie de modifier tes filtres</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
