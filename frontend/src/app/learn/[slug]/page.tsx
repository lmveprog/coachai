"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { CheckCircle, Circle, Clock, ChevronRight, Lock, Zap, BookOpen, ArrowLeft } from "lucide-react";
import { coursesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const COURSE_THUMBNAILS: Record<string, string> = {
  "sql-pour-data-analysts": "from-blue-500 to-blue-700",
  "machine-learning-fondamentaux": "from-purple-500 to-indigo-600",
  "python-pandas-debutant": "from-green-500 to-teal-600",
  "python-numpy-fondamentaux": "from-emerald-500 to-green-600",
  default: "from-slate-500 to-slate-700",
};

export default function CoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const contentRef = { current: null as HTMLDivElement | null };

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.get(slug).then((r) => r.data),
  });

  useEffect(() => {
    if (course && !activeLessonId && course.lessons.length > 0) {
      const first = course.lessons.find((l) => !l.completed) ?? course.lessons[0];
      setActiveLessonId(first.id);
    }
  }, [course?.slug]);

  // Scroll content to top when lesson changes
  useEffect(() => {
    if (activeLessonId) {
      document.getElementById("lesson-content-area")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeLessonId]);

  const { data: lessonDetail, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", slug, activeLessonId],
    queryFn: () => coursesApi.getLesson(slug, activeLessonId!).then((r) => r.data),
    enabled: !!activeLessonId,
  });

  const { mutate: complete, isPending: completing } = useMutation({
    mutationFn: () => coursesApi.completeLesson(slug, activeLessonId!),
    onSuccess: () => {
      toast.success("Leçon terminée ! 🎉");
      queryClient.invalidateQueries({ queryKey: ["course", slug] });
      const lessons = course?.lessons ?? [];
      const currentIdx = lessons.findIndex((l) => l.id === activeLessonId);
      if (currentIdx < lessons.length - 1) {
        setActiveLessonId(lessons[currentIdx + 1].id);
      }
    },
    onError: () => toast.error("Connecte-toi pour marquer cette leçon"),
  });

  if (courseLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="text-5xl">📚</div>
        <p className="text-slate-500 text-lg font-medium">Cours introuvable</p>
        <Link href="/learn" className="btn-secondary">← Retour aux formations</Link>
      </div>
    );
  }

  const completedCount = course.lessons.filter((l) => l.completed).length;
  const progress = course.lessons.length > 0 ? (completedCount / course.lessons.length) * 100 : 0;
  const activeLesson = course.lessons.find((l) => l.id === activeLessonId);
  const gradient = COURSE_THUMBNAILS[slug] ?? COURSE_THUMBNAILS.default;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Back + Header */}
      <div className="glass rounded-2xl p-5 mb-6 border border-blue-100/60">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-3 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux formations
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-slate-900">{course.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{course.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold text-slate-900">{completedCount}/{course.lessons.length} leçons</div>
            <div className="w-32 h-2 rounded-full bg-blue-50 border border-blue-100 mt-2">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="glass rounded-2xl p-4 h-fit lg:sticky lg:top-24 border border-blue-100/60">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Leçons</h2>
          <div className="space-y-1">
            {course.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm",
                  activeLessonId === lesson.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                {lesson.completed ? (
                  <CheckCircle className={cn("w-4 h-4 flex-shrink-0", activeLessonId === lesson.id ? "text-white" : "text-green-500")} />
                ) : lesson.is_premium ? (
                  <Lock className={cn("w-4 h-4 flex-shrink-0", activeLessonId === lesson.id ? "text-white/70" : "text-amber-500")} />
                ) : (
                  <Circle className={cn("w-4 h-4 flex-shrink-0", activeLessonId === lesson.id ? "text-white/70" : "text-slate-300")} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium leading-snug text-xs">{lesson.title}</p>
                  <p className={cn("text-xs mt-0.5 flex items-center gap-1", activeLessonId === lesson.id ? "text-white/60" : "text-slate-400")}>
                    <Clock className="w-3 h-3" />{lesson.duration_minutes}min
                  </p>
                </div>
                {activeLessonId === lesson.id && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-white/80" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div id="lesson-content-area" className="space-y-4 min-w-0 overflow-y-auto">
          {lessonLoading ? (
            <div className="skeleton h-96 rounded-2xl" />
          ) : lessonDetail ? (
            <>
              <div className="glass rounded-2xl p-8 border border-blue-100/60">
                <div className="flex items-center gap-3 mb-1">
                  {activeLesson?.completed && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" /> Terminée
                    </span>
                  )}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {lessonDetail.duration_minutes} min
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-6">{lessonDetail.title}</h2>

                <div className="prose-light">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{lessonDetail.content}</ReactMarkdown>
                </div>
              </div>

              {/* Linked challenge */}
              {lessonDetail.linked_challenge_id && (
                <div className="glass rounded-2xl p-5 border border-blue-200 bg-blue-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Challenge associé</p>
                      <p className="text-xs text-slate-500">Mets en pratique cette leçon</p>
                    </div>
                    <Link
                      href={lessonDetail.linked_challenge_slug ? `/challenges/${lessonDetail.linked_challenge_slug}` : "/challenges"}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Voir le challenge <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  {course.lessons.findIndex((l) => l.id === activeLessonId) > 0 && (
                    <button
                      onClick={() => {
                        const idx = course.lessons.findIndex((l) => l.id === activeLessonId);
                        if (idx > 0) setActiveLessonId(course.lessons[idx - 1].id);
                      }}
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      ← Précédent
                    </button>
                  )}
                </div>
                <div>
                  {!activeLesson?.completed ? (
                    <Button onClick={() => complete()} loading={completing} className="text-sm px-6 py-2.5">
                      Marquer comme terminée <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    course.lessons.findIndex((l) => l.id === activeLessonId) < course.lessons.length - 1 && (
                      <button
                        onClick={() => {
                          const idx = course.lessons.findIndex((l) => l.id === activeLessonId);
                          if (idx < course.lessons.length - 1) setActiveLessonId(course.lessons[idx + 1].id);
                        }}
                        className="btn-primary text-sm px-6 py-2.5"
                      >
                        Leçon suivante <ChevronRight className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl flex items-center justify-center h-48 text-slate-400 border border-blue-100/60">
              Sélectionne une leçon dans la sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
