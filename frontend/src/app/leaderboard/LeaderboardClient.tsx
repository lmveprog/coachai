"use client";

import { useQuery } from "@tanstack/react-query";
import { Crown, Medal, Trophy } from "lucide-react";
import { leaderboardApi } from "@/lib/api";
import { RankBadge } from "@/components/ui/Badge";
import { formatElo } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const TOP3_STYLES = [
  { bg: "bg-gradient-to-br from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-700", size: "w-12 h-12 text-lg" },
  { bg: "bg-gradient-to-br from-slate-50 to-slate-100", border: "border-slate-200", text: "text-slate-600", size: "w-11 h-11 text-base" },
  { bg: "bg-gradient-to-br from-amber-50/60 to-orange-50", border: "border-orange-200", text: "text-orange-700", size: "w-10 h-10 text-base" },
];

function PositionIcon({ pos }: { pos: number }) {
  if (pos === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (pos === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (pos === 3) return <Trophy className="w-5 h-5 text-orange-400" />;
  return <span className="text-slate-400 text-sm font-bold w-5 text-center tabular-nums">{pos}</span>;
}

export function LeaderboardClient() {
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => leaderboardApi.global(1, 100).then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const { data: myRank } = useQuery({
    queryKey: ["leaderboard-me"],
    queryFn: () => leaderboardApi.myRank().then((r) => r.data),
    enabled: !!user,
  });

  const entries = data?.entries ?? [];
  const top3 = entries.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Classement mondial</h1>
        <p className="text-slate-500">Les meilleurs data scientists de la plateforme</p>

        {myRank?.position && (
          <div className="inline-flex items-center gap-3 mt-5 px-5 py-2.5 glass rounded-xl border border-blue-100 shadow-sm">
            <span className="text-slate-500 text-sm">Ta position</span>
            <span className="text-blue-700 font-black text-lg">#{myRank.position}</span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="gradient-text font-black">{formatElo(myRank.elo ?? 0)} ELO</span>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {!isLoading && top3.length === 3 && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto px-2">
          {[top3[1], top3[0], top3[2]].map((entry) => {
            const realRank = entry.position - 1;
            const style = TOP3_STYLES[realRank];
            const height = realRank === 0 ? "h-28" : realRank === 1 ? "h-20" : "h-16";
            return (
              <div key={entry.user_id} className="flex flex-col items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className={cn("rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-white shadow-lg", style.size)}>
                  {entry.username[0].toUpperCase()}
                </div>
                <div className="text-center max-w-[80px]">
                  <p className="text-xs font-bold text-slate-900 truncate">{entry.username}</p>
                  <p className="text-xs text-blue-600 font-semibold">{formatElo(entry.elo)} ELO</p>
                </div>
                <div className={cn("w-16 sm:w-20 rounded-t-xl flex items-start justify-center pt-2", height, style.bg, "border", style.border)}>
                  <span className={cn("text-lg sm:text-xl font-black", style.text)}>#{entry.position}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden">
        {isError ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-slate-500 font-semibold">Impossible de charger le classement</p>
            <p className="text-slate-400 text-sm mt-1">Vérifie ta connexion et réessaie</p>
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-slate-500">Aucun joueur classé pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-blue-50">
            {entries.map((entry) => {
              const isMe = entry.user_id === user?.id;
              const isTop3 = entry.position <= 3;
              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-all",
                    isMe ? "bg-blue-50/60 border-l-4 border-l-blue-500" : "hover:bg-blue-50/20",
                  )}
                >
                  {/* Position */}
                  <div className="w-8 flex justify-center flex-shrink-0">
                    <PositionIcon pos={entry.position} />
                  </div>

                  {/* Avatar */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
                    isMe
                      ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-200"
                      : isTop3
                      ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}>
                    {entry.username[0].toUpperCase()}
                  </div>

                  {/* Name + rank */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("font-bold text-sm", isMe ? "text-blue-700" : "text-slate-900")}>
                        {entry.username}
                        {isMe && <span className="ml-1 text-xs text-blue-500 font-medium">(toi)</span>}
                      </span>
                      <RankBadge rank={entry.rank_name} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{entry.challenges_solved} challenges résolus</p>
                  </div>

                  {/* ELO */}
                  <div className="text-right flex-shrink-0">
                    <div className={cn("font-black text-lg",
                      entry.position === 1 ? "gradient-text" : entry.position <= 3 ? "text-amber-600" : isMe ? "text-blue-700" : "text-slate-900"
                    )}>
                      {formatElo(entry.elo)}
                    </div>
                    <p className="text-xs text-slate-400">ELO</p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
