"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "next-themes";
import { Calendar, Target, Flame, Award, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { usersApi } from "@/lib/api";
import { RankBadge } from "@/components/ui/Badge";
import { DifficultyBadge } from "@/components/ui/Badge";
import { formatDate, formatElo, RANK_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const isOwnProfile = currentUser?.username === username;
  const isDark = resolvedTheme === "dark";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => usersApi.getProfile(username).then((r) => r.data),
  });

  const { data: eloHistory = [] } = useQuery({
    queryKey: ["elo-history", username],
    queryFn: () => usersApi.myEloHistory().then((r) => r.data),
    enabled: !!profile && isOwnProfile,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => usersApi.mySubmissions().then((r) => r.data),
    enabled: !!profile && isOwnProfile,
  });

  const chartData = eloHistory.map((e) => ({
    date: formatDate(e.created_at),
    elo: e.elo_after,
    delta: e.delta,
  }));

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="text-5xl">😕</div>
        <p className="text-slate-500 text-lg font-medium">Utilisateur introuvable</p>
      </div>
    );
  }

  const p = profile as typeof profile & { display_name?: string; profile_type?: string };
  const badges = (profile as { badges?: { id: string; name: string; description: string; icon: string }[] }).badges ?? [];
  const rankColor = RANK_COLORS[profile.rank] ?? "text-slate-600";
  const acceptedCount = submissions.filter((s) => s.status === "accepted").length;

  const PROFILE_TYPE_LABELS: Record<string, string> = {
    student: "🎓 Étudiant(e)",
    junior: "📊 Data Analyst Junior",
    senior: "🔬 Data Scientist",
    ml_engineer: "⚙️ ML Engineer",
    researcher: "🧪 Chercheur",
    other: "💡 Autre",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Hero card */}
      <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
        <div className="flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} width={80} height={80}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-blue-200 flex-shrink-0 border-2 border-blue-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-200 flex-shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black text-slate-900">{p.display_name || profile.username}</h1>
              <RankBadge rank={profile.rank} size="md" />
              {profile.is_premium && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">Pro</span>
              )}
            </div>
            {p.display_name && <p className="text-sm text-slate-400 mb-1">@{profile.username}</p>}
            {p.profile_type && PROFILE_TYPE_LABELS[p.profile_type] && (
              <p className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 inline-flex px-2.5 py-1 rounded-lg mb-2">
                {PROFILE_TYPE_LABELS[p.profile_type]}
              </p>
            )}
            {profile.bio && <p className="text-slate-500 text-sm mb-3 leading-relaxed">{profile.bio}</p>}
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Membre depuis {formatDate(profile.created_at)}
            </p>
          </div>

          {/* ELO + edit */}
          <div className="text-right flex flex-col items-end gap-2">
            <div className={cn("text-4xl font-black", rankColor)}>{formatElo(profile.elo)}</div>
            <div className="text-xs text-slate-400">ELO Rating</div>
            <RankBadge rank={profile.rank} />
            {isOwnProfile && (
              <Link href="/settings"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-all bg-blue-50 hover:bg-blue-100 mt-1">
                ✏️ Modifier le profil
              </Link>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-blue-50">
          {[
            { icon: Target, label: "Challenges résolus", value: profile.challenges_solved, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Flame, label: "Streak actuel", value: `${profile.streak_days}j`, color: "text-orange-500", bg: "bg-orange-50" },
            { icon: CheckCircle, label: "Acceptés", value: acceptedCount, color: "text-green-600", bg: "bg-green-50" },
            { icon: Calendar, label: "Soumissions", value: profile.total_submissions, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-xl p-3.5 border text-center", stat.bg, "border-transparent")}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className={cn("text-2xl font-black", stat.color)}>{stat.value}</span>
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ELO chart */}
      {chartData.length > 1 && (
        <div className="glass rounded-2xl p-6 border border-blue-100/60">
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Évolution ELO
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
                  border: isDark ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(37,99,235,0.15)",
                  borderRadius: "12px",
                  boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(37,99,235,0.1)",
                }}
                labelStyle={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                itemStyle={{ color: isDark ? "#60a5fa" : "#2563eb", fontWeight: "bold" }}
              />
              <ReferenceLine y={1000} stroke="rgba(37,99,235,0.15)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="elo" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="glass rounded-2xl p-6 border border-blue-100/60">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Badges obtenus
          </h2>
          {badges.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-slate-400 text-sm">Aucun badge pour l&apos;instant</p>
              <p className="text-slate-300 text-xs mt-1">Résous ton premier challenge !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="glass rounded-xl p-3 text-center border border-blue-100/60 hover:border-blue-200 transition-all">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-bold text-slate-900">{badge.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        {isOwnProfile && (
          <div className="glass rounded-2xl p-6 border border-blue-100/60">
            <h2 className="text-base font-bold text-slate-900 mb-4">Soumissions récentes</h2>
            {submissions.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">💻</div>
                <p className="text-slate-400 text-sm">Aucune soumission</p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.slice(0, 8).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                    {sub.status === "accepted"
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{sub.status === "accepted" ? "Accepté" : "Rejeté"}</p>
                      <p className="text-xs text-slate-400">{formatDate(sub.created_at)}</p>
                    </div>
                    {sub.elo_delta !== null && sub.elo_delta !== 0 && (
                      <span className={cn("text-xs font-bold flex-shrink-0", sub.elo_delta > 0 ? "text-green-600" : "text-red-500")}>
                        {sub.elo_delta > 0 ? "+" : ""}{sub.elo_delta} ELO
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
