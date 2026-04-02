"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Lock, ChevronRight, Play, CheckCircle, Layers } from "lucide-react";
import { coursesApi } from "@/lib/api";
import { cn, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import type { Course } from "@/types";

const LEVEL_CONFIG = {
  beginner: { label: "Débutant", style: "text-green-700 bg-green-50 border-green-200" },
  intermediate: { label: "Intermédiaire", style: "text-amber-700 bg-amber-50 border-amber-200" },
  advanced: { label: "Avancé", style: "text-red-700 bg-red-50 border-red-200" },
};

const COURSE_THUMBNAILS: Record<string, { gradient: string; emoji: string }> = {
  "sql-pour-data-analysts": { gradient: "from-blue-500 to-blue-700", emoji: "🗄️" },
  "machine-learning-fondamentaux": { gradient: "from-purple-500 to-indigo-600", emoji: "🤖" },
  "python-pandas-debutant": { gradient: "from-green-500 to-teal-600", emoji: "🐍" },
  "python-numpy-fondamentaux": { gradient: "from-emerald-500 to-green-600", emoji: "🔢" },
  default: { gradient: "from-slate-500 to-slate-700", emoji: "📚" },
};

function CourseCard({ course }: { course: Course }) {
  const thumb = COURSE_THUMBNAILS[course.slug] ?? COURSE_THUMBNAILS.default;
  const level = LEVEL_CONFIG[course.level as keyof typeof LEVEL_CONFIG];
  const progress = course.progress_percent ?? 0;

  return (
    <Link href={`/learn/${course.slug}`}>
      <div className="glass glass-hover rounded-2xl overflow-hidden h-full flex flex-col border border-blue-100/60 group">
        {/* Thumbnail */}
        <div className={`h-40 bg-gradient-to-br ${thumb.gradient} relative flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <span className="text-6xl relative z-10 drop-shadow-lg">{thumb.emoji}</span>
          {course.is_premium && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white bg-amber-500 px-2.5 py-1 rounded-lg font-semibold shadow-lg">
              <Lock className="w-3 h-3" /> Pro
            </span>
          )}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
              <div className="h-full bg-white/80 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {level && (
              <span className={cn("text-xs px-2.5 py-1 rounded-lg border font-semibold", level.style)}>
                {level.label}
              </span>
            )}
            <span className="text-xs text-blue-600 font-medium">
              {CATEGORY_ICONS[course.category]} {CATEGORY_LABELS[course.category]}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1 leading-snug">
              {course.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{course.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {course.lessons_count} leçon{course.lessons_count !== 1 ? "s" : ""}
              </span>
            </div>
            {progress > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-blue-50 border border-blue-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-semibold text-blue-600">{progress}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                <Play className="w-3 h-3" /> Commencer
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LearnClient() {
  const [category, setCategory] = useState("");

  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesApi.list().then((r) => r.data),
  });

  const filtered = category ? courses.filter((c) => c.category === category) : courses;
  const categories = [...new Set(courses.map((c) => c.category))];
  const completedCourses = courses.filter((c) => (c.progress_percent ?? 0) === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900">Formation</h1>
          <p className="text-slate-500 text-sm">
            Cours structurés pour maîtriser la data et l&apos;IA — du débutant à l&apos;expert.
          </p>
        </div>
        {completedCourses > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 glass rounded-xl border border-green-100 text-xs font-semibold text-green-700">
            <CheckCircle className="w-4 h-4" /> {completedCourses} cours terminé{completedCourses > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategory("")}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              !category ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200" : "text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
            )}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat === category ? "" : cat)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                category === cat ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200" : "text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50"
              )}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isError ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-4xl">⚠️</div>
          <p className="text-slate-700 text-lg font-semibold">Impossible de charger les formations</p>
          <p className="text-slate-400 text-sm mt-1">Vérifie ta connexion et réessaie</p>
        </div>
      ) : isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-4xl">📚</div>
          <p className="text-slate-700 text-lg font-semibold">Aucun cours disponible</p>
          <p className="text-slate-400 text-sm mt-1">De nouveaux parcours arrivent bientôt</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      )}

      {/* Coming soon */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-slate-700 mb-5">Prochainement</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: "🧠", title: "Deep Learning & NLP", level: "Avancé", desc: "PyTorch, Transformers, BERT, fine-tuning de LLMs" },
            { emoji: "👁️", title: "Computer Vision", level: "Intermédiaire", desc: "OpenCV, CNNs, YOLO, détection d'objets" },
            { emoji: "📊", title: "Visualisation & Storytelling", level: "Débutant", desc: "Matplotlib, Seaborn, Plotly, dashboards interactifs" },
            { emoji: "⚙️", title: "MLOps & Déploiement", level: "Avancé", desc: "FastAPI, Docker, MLflow, CI/CD pour modèles ML" },
            { emoji: "🔢", title: "Statistiques pour la Data", level: "Intermédiaire", desc: "Tests A/B, intervalles de confiance, régression" },
            { emoji: "🕸️", title: "Graph Analytics & Neo4j", level: "Avancé", desc: "Graphes, PageRank, détection de communautés" },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl overflow-hidden border border-dashed border-blue-200 opacity-60">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-5xl">
                {c.emoji}
              </div>
              <div className="p-4">
                <span className="text-xs text-slate-400 font-medium">{c.level}</span>
                <h3 className="font-bold text-slate-600 mt-1 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-400">{c.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Bientôt disponible
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
