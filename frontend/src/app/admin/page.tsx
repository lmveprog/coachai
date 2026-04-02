"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Zap, BookOpen, BarChart3, Eye, EyeOff, Crown, Globe,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Shield, RefreshCw,
} from "lucide-react";
import { adminApi, type AdminChallenge, type AdminCourse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const DIFFICULTY_CONFIG = {
  easy: { label: "Facile", style: "text-green-700 bg-green-50 border-green-200" },
  medium: { label: "Moyen", style: "text-amber-700 bg-amber-50 border-amber-200" },
  hard: { label: "Difficile", style: "text-orange-700 bg-orange-50 border-orange-200" },
  expert: { label: "Expert", style: "text-red-700 bg-red-50 border-red-200" },
};

const LEVEL_CONFIG = {
  beginner: { label: "Débutant", style: "text-green-700 bg-green-50 border-green-200" },
  intermediate: { label: "Intermédiaire", style: "text-amber-700 bg-amber-50 border-amber-200" },
  advanced: { label: "Avancé", style: "text-red-700 bg-red-50 border-red-200" },
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | undefined; color: string }) {
  return (
    <div className="glass rounded-2xl p-5 border border-blue-100/60">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className="text-3xl font-black text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      disabled={disabled}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors flex-shrink-0",
        checked ? "bg-blue-600" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-0.5"
      )} />
    </button>
  );
}

function ChallengesTable({ challenges }: { challenges: AdminChallenge[] }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { mutate: togglePublish } = useMutation({
    mutationFn: ({ slug, is_published }: { slug: string; is_published: boolean }) =>
      adminApi.togglePublishChallenge(slug, is_published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success("Mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  const { mutate: togglePremium } = useMutation({
    mutationFn: ({ slug, is_premium }: { slug: string; is_premium: boolean }) =>
      adminApi.togglePremiumChallenge(slug, is_premium),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success("Mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-blue-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900">Challenges ({challenges.length})</h2>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-green-500" /> Publié</span>
          <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-amber-500" /> Pro</span>
        </div>
      </div>

      <div className="divide-y divide-blue-50/60">
        {challenges.map((ch) => {
          const diff = DIFFICULTY_CONFIG[ch.difficulty as keyof typeof DIFFICULTY_CONFIG];
          const isExpanded = expandedId === ch.id;
          return (
            <div key={ch.id}>
              <div
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/30 cursor-pointer transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : ch.id)}
              >
                <span className="text-sm">{CATEGORY_ICONS[ch.category] ?? "📊"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 truncate">{ch.title}</span>
                    {diff && (
                      <span className={cn("text-xs px-2 py-0.5 rounded-lg border font-medium", diff.style)}>
                        {diff.label}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">{ch.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-blue-600 font-bold">+{ch.elo_reward} ELO</span>
                  <span className="text-xs text-slate-400">{ch.total_solves}/{ch.total_attempts}</span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                      <Eye className="w-3 h-3" />
                      <Toggle
                        checked={ch.is_published}
                        onChange={() => togglePublish({ slug: ch.slug, is_published: !ch.is_published })}
                      />
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                      <Crown className="w-3 h-3" />
                      <Toggle
                        checked={ch.is_premium}
                        onChange={() => togglePremium({ slug: ch.slug, is_premium: !ch.is_premium })}
                      />
                    </label>
                  </div>

                  <Link
                    href={`/challenges/${ch.slug}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir →
                  </Link>

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-3 bg-blue-50/30 border-t border-blue-50">
                  <div className="flex gap-2 flex-wrap mt-2">
                    {ch.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                    {ch.tags.length === 0 && <span className="text-xs text-slate-400">Aucun tag</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>Type: <strong>{ch.challenge_type}</strong></span>
                    <span>Catégorie: <strong>{CATEGORY_LABELS[ch.category] ?? ch.category}</strong></span>
                    <span>Tentatives: <strong>{ch.total_attempts}</strong></span>
                    <span>Résolus: <strong>{ch.total_solves}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoursesTable({ courses }: { courses: AdminCourse[] }) {
  const queryClient = useQueryClient();

  const { mutate: publishCourse } = useMutation({
    mutationFn: (slug: string) => adminApi.togglePublishCourse(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Cours publié !");
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-blue-50 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <h2 className="font-bold text-slate-900">Cours ({courses.length})</h2>
      </div>

      <div className="divide-y divide-blue-50/60">
        {courses.map((course) => {
          const lvl = LEVEL_CONFIG[course.level as keyof typeof LEVEL_CONFIG];
          return (
            <div key={course.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="text-sm">{CATEGORY_ICONS[course.category] ?? "📚"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{course.title}</span>
                  {lvl && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-lg border font-medium", lvl.style)}>
                      {lvl.label}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{course.lessons_count} leçon{course.lessons_count !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {course.is_published ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Publié
                  </span>
                ) : (
                  <button
                    onClick={() => publishCourse(course.slug)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Publier
                  </button>
                )}
                {course.is_premium && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Crown className="w-3.5 h-3.5" /> Pro
                  </span>
                )}
                <Link
                  href={`/learn/${course.slug}`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  Voir →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"challenges" | "courses">("challenges");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
    enabled: !!user?.is_admin,
    retry: false,
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ["admin-challenges"],
    queryFn: () => adminApi.listChallenges().then((r) => r.data),
    enabled: !!user?.is_admin && tab === "challenges",
    retry: false,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => adminApi.listCourses().then((r) => r.data),
    enabled: !!user?.is_admin && tab === "courses",
    retry: false,
  });

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 text-lg font-semibold">Connexion requise</p>
        <Link href="/login" className="btn-primary">Se connecter</Link>
      </div>
    );
  }

  // Not admin
  if (!user.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-red-300" />
        <p className="text-slate-700 text-lg font-bold">Accès refusé</p>
        <p className="text-slate-400 text-sm">Cette page est réservée aux administrateurs.</p>
        <Link href="/" className="btn-secondary">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-200">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Panel Admin</h1>
            <p className="text-xs text-slate-400">CoachAI — Gestion du contenu</p>
          </div>
        </div>
        <button
          onClick={() => refetchStats()}
          className="btn-secondary text-xs px-3 py-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats?.users} color="bg-blue-600" />
        <StatCard icon={Zap} label="Challenges" value={stats?.challenges} color="bg-purple-600" />
        <StatCard icon={BarChart3} label="Soumissions" value={stats?.submissions} color="bg-green-600" />
        <StatCard icon={BookOpen} label="Cours" value={stats?.courses} color="bg-amber-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("challenges")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            tab === "challenges"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "glass border border-blue-100/60 text-slate-600 hover:text-blue-700"
          )}
        >
          <Zap className="w-4 h-4" /> Challenges
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tab === "challenges" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600")}>
            {challenges.length || "—"}
          </span>
        </button>
        <button
          onClick={() => setTab("courses")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            tab === "courses"
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "glass border border-blue-100/60 text-slate-600 hover:text-blue-700"
          )}
        >
          <BookOpen className="w-4 h-4" /> Cours
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", tab === "courses" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600")}>
            {courses.length || "—"}
          </span>
        </button>
      </div>

      {/* Content */}
      {tab === "challenges" && (
        challengesLoading ? (
          <div className="skeleton h-64 rounded-2xl" />
        ) : challenges.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-blue-100/60">
            <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Aucun challenge</p>
            <p className="text-slate-400 text-sm mt-1">Lancez le script de seed pour initialiser le contenu.</p>
            <code className="mt-4 inline-block text-xs bg-slate-900 text-green-400 px-4 py-2 rounded-xl font-mono">
              docker compose exec backend python -m app.scripts.seed
            </code>
          </div>
        ) : (
          <ChallengesTable challenges={challenges} />
        )
      )}

      {tab === "courses" && (
        coursesLoading ? (
          <div className="skeleton h-48 rounded-2xl" />
        ) : courses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-blue-100/60">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Aucun cours</p>
            <p className="text-slate-400 text-sm mt-1">Lancez le script de seed pour initialiser le contenu.</p>
            <code className="mt-4 inline-block text-xs bg-slate-900 text-green-400 px-4 py-2 rounded-xl font-mono">
              docker compose exec backend python -m app.scripts.seed
            </code>
          </div>
        ) : (
          <CoursesTable courses={courses} />
        )
      )}

      {/* Seed instructions */}
      <div className="glass rounded-2xl p-5 border border-blue-100/60">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" /> Commandes utiles
        </h3>
        <div className="space-y-2">
          {[
            { label: "Seed initial (challenges + cours + badges)", cmd: "docker compose exec backend python -m app.scripts.seed" },
            { label: "Migrations Alembic", cmd: "docker compose exec backend alembic upgrade head" },
            { label: "Redémarrer le backend", cmd: "docker compose restart backend" },
            { label: "Logs backend", cmd: "docker compose logs -f backend" },
          ].map(({ label, cmd }) => (
            <div key={cmd} className="flex items-start gap-3">
              <span className="text-xs text-slate-400 w-48 flex-shrink-0 pt-0.5">{label}</span>
              <code className="text-xs bg-slate-900 text-green-400 px-3 py-1.5 rounded-lg font-mono flex-1 overflow-x-auto">{cmd}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
