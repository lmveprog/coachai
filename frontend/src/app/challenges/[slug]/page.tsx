"use client";

import { useState, useEffect, useRef, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  Play, Clock, HardDrive, CheckCircle, XCircle, AlertCircle,
  Loader2, ChevronDown, ChevronUp, History, Trophy, Lock,
  TrendingUp, Users, Zap, ArrowRight, Crown, Flame, Upload, FileText, Code, AlertTriangle,
  Database, Hash,
} from "lucide-react";
import { challengesApi, submissionsApi, authApi } from "@/lib/api";
import { DifficultyBadge, CategoryBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, CATEGORY_LABELS, formatRelativeTime, formatElo, CATEGORY_ICONS } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "next-themes";
import type { Submission } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Monaco error boundary ────────────────────────────────────────────────────
class EditorErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Monaco error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-sm font-medium">L&apos;éditeur n&apos;a pas pu se charger.</p>
          <button onClick={() => this.setState({ hasError: false })} className="text-xs text-blue-600 underline">Réessayer</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Table data parser ────────────────────────────────────────────────────────
function tryParseTable(text: string): { headers: string[]; rows: string[][] } | null {
  if (!text || text.length > 20000) return null;

  // Try JSON array of objects
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0] !== null && typeof parsed[0] === "object" && !Array.isArray(parsed[0])) {
      const headers = Object.keys(parsed[0] as object);
      if (headers.length >= 1) {
        const rows = (parsed as Record<string, unknown>[]).map((r) => headers.map((h) => String(r[h] ?? "")));
        return { headers, rows };
      }
    }
  } catch { /* not JSON */ }

  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;

  // Detect separator
  const firstLine = lines[0];
  const sep = firstLine.includes("|") ? "|" : firstLine.includes(",") ? "," : firstLine.includes("\t") ? "\t" : null;
  if (!sep) return null;

  // Filter out divider lines (e.g., +----+----+ or ------)
  const dataLines = lines.filter((l) => !/^[\s\-\+\|=]+$/.test(l));
  if (dataLines.length < 2) return null;

  const splitLine = (l: string) => l.split(sep!).map((c) => c.trim()).filter((c) => c !== "");

  const headers = splitLine(dataLines[0]);
  if (headers.length < 2) return null;

  const rows = dataLines.slice(1).map((l) => {
    const cells = splitLine(l);
    // Pad row to match header length if needed
    while (cells.length < headers.length) cells.push("");
    return cells.slice(0, headers.length);
  }).filter((r) => r.some((c) => c !== ""));

  if (rows.length === 0) return null;
  return { headers, rows };
}

function DataTable({ data, variant = "neutral", diffWith, title }: {
  data: { headers: string[]; rows: string[][] };
  variant?: "neutral" | "success" | "error";
  diffWith?: { headers: string[]; rows: string[][] } | null;
  title?: string;
}) {
  // Detect numeric columns
  const isNumericCol = data.headers.map((_, ci) =>
    data.rows.length > 0 && data.rows.every(row =>
      row[ci] === "" || row[ci] === "null" || row[ci] === "NULL" ||
      (!isNaN(Number(row[ci])) && row[ci].trim() !== "")
    )
  );

  // Column max values for mini-bars
  const colMax = data.headers.map((_, ci) => {
    if (!isNumericCol[ci]) return 0;
    return Math.max(...data.rows.map(r => Math.abs(Number(r[ci]) || 0)));
  });

  const fmtNum = (v: string) => {
    const n = Number(v);
    if (!isFinite(n)) return v;
    if (Number.isInteger(n)) return n.toLocaleString("fr-FR");
    return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 4 });
  };

  const isNull = (v: string) => v === "" || v === "null" || v === "NULL" || v === "None";
  const isBool = (v: string) => v === "true" || v === "false" || v === "True" || v === "False" || v === "1" || v === "0";

  // Row-level diff: mark rows that differ from diffWith table
  const diffRowSet = new Set<number>();
  if (diffWith) {
    data.rows.forEach((row, ri) => {
      const other = diffWith.rows[ri];
      if (!other || row.some((c, ci) => c !== (other[ci] ?? ""))) diffRowSet.add(ri);
    });
    // Extra rows in diffWith that we don't have
    if (diffWith.rows.length !== data.rows.length) {
      for (let i = data.rows.length; i < diffWith.rows.length; i++) diffRowSet.add(i);
    }
  }

  const palette = variant === "success"
    ? {
        topBar: "bg-gradient-to-r from-green-600 to-emerald-600",
        header: "bg-green-50/80 text-green-900 border-green-200",
        rowBase: "bg-white",
        rowAlt: "bg-green-50/30",
        rowDiff: "bg-red-50 border-l-2 border-l-red-400",
        cellBorder: "border-green-100/50",
        outerBorder: "border-green-200",
        footer: "bg-green-50/60 border-green-100 text-green-700",
        bar: "bg-green-500/20",
        barFill: "bg-green-500",
        numPill: "bg-green-100 text-green-800 ring-1 ring-green-200",
        nullPill: "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
        boolTrue: "bg-green-100 text-green-700 ring-1 ring-green-300",
        boolFalse: "bg-red-50 text-red-600 ring-1 ring-red-200",
      }
    : variant === "error"
    ? {
        topBar: "bg-gradient-to-r from-red-500 to-rose-600",
        header: "bg-red-50/80 text-red-900 border-red-200",
        rowBase: "bg-white",
        rowAlt: "bg-red-50/20",
        rowDiff: "bg-red-100 border-l-2 border-l-red-500",
        cellBorder: "border-red-100/50",
        outerBorder: "border-red-200",
        footer: "bg-red-50/60 border-red-100 text-red-700",
        bar: "bg-red-200/30",
        barFill: "bg-red-400",
        numPill: "bg-red-50 text-red-700 ring-1 ring-red-200",
        nullPill: "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
        boolTrue: "bg-green-100 text-green-700 ring-1 ring-green-300",
        boolFalse: "bg-red-50 text-red-600 ring-1 ring-red-200",
      }
    : {
        topBar: "bg-gradient-to-r from-slate-700 to-slate-600",
        header: "bg-slate-100/80 text-slate-700 border-slate-200",
        rowBase: "bg-white",
        rowAlt: "bg-slate-50/60",
        rowDiff: "bg-amber-50 border-l-2 border-l-amber-400",
        cellBorder: "border-slate-100/50",
        outerBorder: "border-slate-200",
        footer: "bg-slate-50 border-slate-100 text-slate-500",
        bar: "bg-blue-100/40",
        barFill: "bg-blue-400",
        numPill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        nullPill: "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
        boolTrue: "bg-green-100 text-green-700 ring-1 ring-green-300",
        boolFalse: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
      };

  const BOOL_TRUE = new Set(["true", "True", "1"]);
  const BOOL_FALSE = new Set(["false", "False", "0"]);

  return (
    <div className={cn("rounded-xl border overflow-hidden shadow-sm", palette.outerBorder)} style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace" }}>
      {/* Top bar */}
      <div className={cn("flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-semibold text-white", palette.topBar)}>
        <Database className="w-3.5 h-3.5 opacity-80" />
        {title && <span className="font-bold tracking-wide uppercase">{title}</span>}
        {title && <span className="opacity-30">|</span>}
        <span className="font-bold">{data.rows.length}</span>
        <span className="opacity-70">ligne{data.rows.length !== 1 ? "s" : ""}</span>
        <span className="opacity-40 mx-0.5">·</span>
        <span className="font-bold">{data.headers.length}</span>
        <span className="opacity-70">col{data.headers.length !== 1 ? "onnes" : "onne"}</span>
        {diffWith && diffRowSet.size > 0 && (
          <span className="ml-auto flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">
            <XCircle className="w-3 h-3" /> {diffRowSet.size} diff
          </span>
        )}
        {diffWith && diffRowSet.size === 0 && (
          <span className="ml-auto flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">
            <CheckCircle className="w-3 h-3" /> Match
          </span>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto" style={{ maxHeight: "280px", overflowY: "auto" }}>
        <table className="w-full border-collapse" style={{ fontSize: "12px" }}>
          <thead className="sticky top-0 z-10">
            <tr className={cn("border-b", palette.header)}>
              <th className="px-2 py-2.5 text-[10px] font-normal opacity-30 w-8 border-r border-current/10 select-none text-center">#</th>
              {data.headers.map((h, i) => (
                <th key={i} className={cn("px-3 py-2.5 font-bold whitespace-nowrap", isNumericCol[i] ? "text-right" : "text-left")}>
                  <span className="inline-flex items-center gap-1.5" style={{ justifyContent: isNumericCol[i] ? "flex-end" : "flex-start" }}>
                    {isNumericCol[i]
                      ? <span className="w-3.5 h-3.5 rounded bg-current/10 flex items-center justify-center opacity-60"><Hash className="w-2.5 h-2.5" /></span>
                      : <span className="w-3.5 h-3.5 rounded bg-current/10 flex items-center justify-center opacity-60"><span style={{ fontSize: 8, fontWeight: 900 }}>Aa</span></span>
                    }
                    <span>{h}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "group transition-colors",
                  diffRowSet.has(i) ? palette.rowDiff : i % 2 === 0 ? palette.rowBase : palette.rowAlt,
                  !diffRowSet.has(i) && "hover:bg-blue-50/30"
                )}
              >
                <td className="px-2 py-2 text-[10px] opacity-25 border-r border-slate-100 select-none text-center group-hover:opacity-50 transition-opacity">{i + 1}</td>
                {row.map((cell, j) => {
                  const pct = isNumericCol[j] && colMax[j] > 0 ? Math.abs(Number(cell) / colMax[j]) * 100 : 0;
                  const boolVal = isBool(cell) ? BOOL_TRUE.has(cell) : null;
                  return (
                    <td key={j} className={cn("px-3 py-2 border-b whitespace-nowrap relative", palette.cellBorder, isNumericCol[j] ? "text-right" : "text-left")}>
                      {/* Mini bar background for numeric */}
                      {isNumericCol[j] && !isNull(cell) && pct > 0 && (
                        <span
                          className={cn("absolute inset-y-0 right-0 opacity-15 rounded-l-sm", palette.barFill)}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      )}
                      <span className="relative">
                        {isNull(cell)
                          ? <span className={cn("text-[10px] italic font-medium px-1.5 py-0.5 rounded-md", palette.nullPill)}>∅ NULL</span>
                          : boolVal !== null
                          ? <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide", boolVal ? palette.boolTrue : palette.boolFalse)}>
                              {boolVal ? "✓ TRUE" : "✗ FALSE"}
                            </span>
                          : isNumericCol[j]
                          ? <span className={cn("font-bold px-1.5 py-0.5 rounded-md tabular-nums", palette.numPill)}>{fmtNum(cell)}</span>
                          : <span className="text-slate-700">{cell}</span>
                        }
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={cn("flex items-center gap-2 px-3.5 py-2 text-[11px] border-t flex-wrap", palette.footer)}>
        <span className="font-semibold">{data.rows.length} résultat{data.rows.length !== 1 ? "s" : ""}</span>
        <span className="opacity-30">·</span>
        <span className="opacity-60 truncate">{data.headers.join(" · ")}</span>
      </div>
    </div>
  );
}

function OutputDisplay({ text, variant, diffWith }: { text: string; variant: "neutral" | "success" | "error"; diffWith?: string }) {
  const table = tryParseTable(text);
  const diffTable = diffWith ? tryParseTable(diffWith) : null;
  if (table) return <DataTable data={table} variant={variant} diffWith={diffTable} />;
  return (
    <pre className={cn(
      "text-xs rounded-xl p-3 overflow-x-auto font-mono max-h-48 border whitespace-pre-wrap break-words",
      variant === "success" ? "text-green-700 bg-green-100 border-green-200"
        : variant === "error" ? "text-red-700 bg-red-100 border-red-200"
        : "text-slate-700 bg-slate-100 border-slate-200"
    )}>{text || "(vide)"}</pre>
  );
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  accepted: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-50", border: "border-green-200", label: "Accepté ✓" },
  wrong_answer: { icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Mauvaise réponse" },
  runtime_error: { icon: AlertCircle, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", label: "Erreur d'exécution" },
  time_limit: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Limite de temps" },
  memory_limit: { icon: HardDrive, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Limite mémoire" },
  compilation_error: { icon: AlertCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Erreur de compilation" },
  score_below_threshold: { icon: XCircle, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Score insuffisant" },
  pending: { icon: Loader2, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "En attente..." },
  running: { icon: Loader2, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Évaluation en cours..." },
};

const LANG_MAP: Record<string, string> = {
  sql: "sql",
  machine_learning: "python",
  deep_learning: "python",
  data_engineering: "python",
  nlp: "python",
  computer_vision: "python",
  visualization: "python",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.runtime_error;
  const isSpinning = status === "running" || status === "pending";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border", cfg.bg, cfg.border, cfg.color)}>
      <cfg.icon className={cn("w-3.5 h-3.5", isSpinning && "animate-spin")} />
      {cfg.label}
    </span>
  );
}

function DailyLimitModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="glass-intense rounded-3xl p-8 max-w-md w-full border border-blue-100 shadow-2xl text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Limite quotidienne atteinte</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Tu as utilisé tes <strong className="text-slate-700">3 challenges gratuits</strong> d'aujourd'hui.
          Passe à Pro pour un accès illimité et débloquer tous les challenges Premium.
        </p>
        <div className="glass rounded-2xl p-4 mb-6 border border-blue-100 text-left space-y-2">
          {["Challenges illimités chaque jour", "Accès aux challenges Expert & Premium", "Historique complet & analytics avancées", "Certificats de compétences"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm justify-center">
            Continuer demain
          </button>
          <Link href="/pricing" onClick={onClose} className="flex-1 btn-primary text-sm justify-center">
            <Crown className="w-4 h-4" /> Passer à Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

function TestCaseResults({ submission }: { submission: Submission }) {
  const results = (submission.result_detail as { test_case_results?: Array<{ passed: boolean; points: number; expected: string; got: string; error: string }> })?.test_case_results ?? [];
  const [expanded, setExpanded] = useState<number | null>(0);
  if (results.length === 0) return null;
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const pct = Math.round((passed / total) * 100);
  const totalPoints = results.reduce((s, r) => s + (r.points || 0), 0);
  const earnedPoints = results.filter(r => r.passed).reduce((s, r) => s + (r.points || 0), 0);

  return (
    <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden mt-3">
      {/* Header with visual score summary */}
      <div className={cn("px-5 pt-4 pb-3 border-b", passed === total ? "border-green-100 bg-gradient-to-r from-green-50/80 to-emerald-50/40" : "border-blue-50")}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", passed === total ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">Résultats des tests</span>
            {totalPoints > 0 && (
              <span className="block text-[10px] text-slate-400 font-medium">{earnedPoints}/{totalPoints} points</span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={cn(
              "text-lg font-black tabular-nums",
              passed === total ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"
            )}>{pct}%</span>
            <span className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-lg border",
              passed === total ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"
            )}>{passed}/{total}</span>
          </div>
        </div>
        {/* Progress bar — thicker and more visual */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                passed === total ? "bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 shadow-sm shadow-green-300" :
                pct >= 50 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                "bg-gradient-to-r from-red-400 to-rose-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {/* Mini test dots — larger and more interactive */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {results.map((tc, i) => (
            <button
              key={i}
              onClick={() => setExpanded(expanded === i ? null : i)}
              title={`Test ${i + 1} — ${tc.passed ? "✓ Passé" : "✗ Échoué"}${tc.points ? ` (${tc.points} pts)` : ""}`}
              className={cn(
                "w-8 h-8 rounded-lg text-[11px] font-bold transition-all border-2 shadow-sm",
                expanded === i ? "scale-110 ring-2 ring-offset-2 shadow-md" : "hover:scale-105",
                tc.passed
                  ? "bg-gradient-to-b from-green-50 to-green-100 text-green-700 border-green-300 hover:border-green-400 ring-green-400"
                  : "bg-gradient-to-b from-red-50 to-red-100 text-red-700 border-red-300 hover:border-red-400 ring-red-400"
              )}
            >{i + 1}</button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {results.map((tc, i) => (
          <div key={i} className={cn(
            "rounded-xl border overflow-hidden transition-all",
            tc.passed ? "border-green-200" : "border-red-200",
            expanded === i ? "shadow-sm" : ""
          )}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left",
                tc.passed ? "bg-green-50/70 hover:bg-green-100/60" : "bg-red-50/50 hover:bg-red-100/50"
              )}
            >
              {tc.passed
                ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              <span className={cn("text-sm font-semibold", tc.passed ? "text-green-700" : "text-red-700")}>
                Test {i + 1}
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full ml-1",
                tc.passed ? "bg-green-200/60 text-green-800" : "bg-red-200/60 text-red-800"
              )}>{tc.points} pts</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs">
                {tc.passed
                  ? <span className="text-green-600 font-semibold">✓ Passé</span>
                  : <span className="text-red-600 font-semibold">✗ Échoué</span>}
                {expanded === i ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </span>
            </button>

            {expanded === i && (
              <div className="px-4 pb-4 pt-3 bg-white/70 border-t border-white/60">
                {tc.error ? (
                  <div className="rounded-xl overflow-hidden border border-red-200">
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Erreur</span>
                    </div>
                    <pre className="text-xs text-red-700 bg-red-50/50 p-3 overflow-x-auto font-mono whitespace-pre-wrap">{tc.error}</pre>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Side-by-side if both are tables */}
                    {(() => {
                      const expTable = tryParseTable(tc.expected || "");
                      const gotTable = tryParseTable(tc.got || "");
                      if (expTable && gotTable) {
                        return (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <DataTable data={expTable} variant="neutral" diffWith={gotTable} title="Attendu" />
                            </div>
                            <div>
                              <DataTable data={gotTable} variant={tc.passed ? "success" : "error"} diffWith={expTable} title="Obtenu" />
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                              Attendu
                            </div>
                            <OutputDisplay text={tc.expected || ""} variant="neutral" />
                          </div>
                          <div>
                            <div className={cn("flex items-center gap-1.5 text-xs font-bold mb-2 uppercase tracking-wide", tc.passed ? "text-green-700" : "text-red-600")}>
                              <span className={cn("w-2.5 h-2.5 rounded-full inline-block", tc.passed ? "bg-green-500" : "bg-red-500")} />
                              Obtenu
                            </div>
                            <OutputDisplay text={tc.got || ""} variant={tc.passed ? "success" : "error"} diffWith={tc.expected} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionHistory({ challengeId }: { challengeId: string }) {
  const [open, setOpen] = useState(false);
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["submissions-history", challengeId],
    queryFn: () => submissionsApi.forChallenge(challengeId).then((r) => r.data),
    enabled: open,
  });
  return (
    <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/40 transition-colors">
        <History className="w-4 h-4" />
        Historique des soumissions
        {open ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />}
      </button>
      {open && (
        <div className="border-t border-blue-50">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-400">Aucune soumission</p>
          ) : (
            <div className="p-3 space-y-2">
              {history.slice(0, 10).map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <StatusBadge status={sub.status} />
                  <div className="flex-1 min-w-0">
                    {sub.elo_delta !== null && sub.elo_delta !== 0 && (
                      <span className={cn("text-xs font-bold", sub.elo_delta > 0 ? "text-green-600" : "text-red-600")}>
                        {sub.elo_delta > 0 ? "+" : ""}{sub.elo_delta} ELO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                    {sub.execution_time_ms && <span>{sub.execution_time_ms}ms</span>}
                    <span>{formatRelativeTime(sub.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChallengePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, setUser } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState("");
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [submitMode, setSubmitMode] = useState<"code" | "file">("code");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);

  // Refresh user ELO/rank in navbar after any completed submission
  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch { /* ignore */ }
  };

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["challenge", slug],
    queryFn: () => challengesApi.get(slug).then((r) => r.data),
  });

  const { data: dailyStatus } = useQuery({
    queryKey: ["daily-status"],
    queryFn: () => submissionsApi.dailyStatus().then((r) => r.data),
    enabled: !!user,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (challenge?.starter_code) setCode(challenge.starter_code);
  }, [challenge?.slug]);

  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: () =>
      submissionsApi.submit({
        challenge_id: challenge!.id,
        code,
        language: LANG_MAP[challenge!.category] ?? "python",
      }).then((r) => r.data),
    onSuccess: (sub) => {
      setLastSubmission(sub);
      if (sub.status === "pending" || sub.status === "running") {
        pollAttemptsRef.current = 0;
        const scheduleNext = () => {
          pollAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(1.5, pollAttemptsRef.current - 1), 8000);
          if (pollAttemptsRef.current > 20) {
            toast.error("L'évaluation prend trop de temps. Réessaie plus tard.", { duration: 5000 });
            return;
          }
          pollRef.current = setTimeout(async () => {
            try {
              const res = await submissionsApi.get(sub.id);
              setLastSubmission(res.data);
              if (res.data.status !== "pending" && res.data.status !== "running") {
                refreshUser();
                if (res.data.status === "accepted") {
                  toast.success(`Accepté ! +${res.data.elo_delta ?? 0} ELO 🎉`, { duration: 4000 });
                } else {
                  toast.error(`${STATUS_CONFIG[res.data.status]?.label ?? "Erreur"}`, { duration: 3000 });
                }
              } else {
                scheduleNext();
              }
            } catch (_) {
              toast.error("Erreur lors de la vérification du résultat");
            }
          }, delay) as unknown as ReturnType<typeof setInterval>;
        };
        scheduleNext();
      } else {
        refreshUser();
        if (sub.status === "accepted") {
          toast.success(`Accepté ! +${sub.elo_delta ?? 0} ELO 🎉`, { duration: 4000 });
        } else {
          toast.error(`${STATUS_CONFIG[sub.status]?.label ?? "Erreur"}`, { duration: 3000 });
        }
      }
    },
    onError: (error: { response?: { status?: number; data?: { detail?: string } } }) => {
      if (error?.response?.status === 429) {
        setShowLimitModal(true);
      } else {
        toast.error("Erreur lors de la soumission");
      }
    },
  });

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current as unknown as ReturnType<typeof setTimeout>); }, []);

  const { mutate: uploadSubmit, isPending: uploading } = useMutation({
    mutationFn: () => {
      if (!uploadedFile || !challenge) throw new Error("No file");
      return submissionsApi.uploadFile(challenge.id, uploadedFile).then((r) => r.data);
    },
    onSuccess: (sub) => {
      setLastSubmission(sub);
      refreshUser();
      const eval_ = (sub.result_detail as { llm_evaluation?: { verdict: string; summary: string; score: number } })?.llm_evaluation;
      if (sub.status === "accepted") {
        toast.success(`Accepté ! +${sub.elo_delta ?? 0} ELO 🎉`, { duration: 4000 });
      } else {
        toast.error(eval_?.summary ?? STATUS_CONFIG[sub.status]?.label ?? "Erreur", { duration: 4000 });
      }
    },
    onError: (error: { response?: { status?: number } }) => {
      if (error?.response?.status === 429) setShowLimitModal(true);
      else toast.error("Erreur lors de la soumission du fichier");
    },
  });

  const lang = challenge ? (LANG_MAP[challenge.category] ?? "python") : "python";
  const isLimitReached = !dailyStatus?.is_premium && (dailyStatus?.remaining ?? 3) === 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="skeleton h-[600px] rounded-2xl" />
          <div className="skeleton h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-5xl">🤔</div>
        <p className="text-slate-500 text-lg font-medium">Challenge introuvable</p>
        <Link href="/challenges" className="btn-secondary">← Retour aux challenges</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {showLimitModal && <DailyLimitModal onClose={() => setShowLimitModal(false)} />}

      {/* Header */}
      <div className="glass rounded-2xl p-5 border border-blue-100/60">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            {CATEGORY_ICONS[challenge.category] ?? "🎯"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <CategoryBadge category={challenge.category} label={CATEGORY_LABELS[challenge.category] ?? challenge.category} />
              <DifficultyBadge difficulty={challenge.difficulty} />
              {challenge.is_premium && (
                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
                  <Lock className="w-3 h-3" /> Pro
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900">{challenge.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {challenge.total_attempts} tentatives
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +{challenge.elo_reward} ELO
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {challenge.time_limit_seconds}s
            </span>
            {user && dailyStatus && !dailyStatus.is_premium && (
              <span className={cn(
                "flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border text-xs",
                isLimitReached
                  ? "text-red-600 bg-red-50 border-red-200"
                  : (dailyStatus.remaining ?? 3) <= 1
                    ? "text-amber-600 bg-amber-50 border-amber-200"
                    : "text-green-700 bg-green-50 border-green-200"
              )}>
                <Flame className="w-3.5 h-3.5" />
                {dailyStatus.remaining}/{dailyStatus.limit} restants
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: description */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 border border-blue-100/60">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5">Énoncé</h2>
            <div className="prose-light">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{challenge.description ?? ""}</ReactMarkdown>
            </div>
          </div>
          {user && <SubmissionHistory challengeId={challenge.id} />}
        </div>

        {/* Right: editor + results */}
        <div className="space-y-4">
          {/* Editor / Upload tabs */}
          <div className="glass rounded-2xl border border-blue-100/60 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-blue-50 px-2 pt-2 gap-1">
              <button
                onClick={() => setSubmitMode("code")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all",
                  submitMode === "code" ? "bg-white dark:bg-slate-900 border border-b-white dark:border-b-slate-900 border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 -mb-px" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <Code className="w-3.5 h-3.5" /> Éditeur de code
              </button>
              <button
                onClick={() => setSubmitMode("file")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all",
                  submitMode === "file" ? "bg-white dark:bg-slate-900 border border-b-white dark:border-b-slate-900 border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 -mb-px" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <Upload className="w-3.5 h-3.5" /> Importer un fichier
              </button>
              {submitMode === "code" && (
                <div className="ml-auto flex items-center gap-2 mr-2">
                  {challenge?.starter_code && (
                    <button
                      onClick={() => {
                        if (confirm("Remettre le code de départ ?")) setCode(challenge.starter_code ?? "");
                      }}
                      title="Réinitialiser le code"
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      ↺ Reset
                    </button>
                  )}
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {lang === "python" ? "Python 3" : "SQLite"}
                  </span>
                </div>
              )}
            </div>

            {submitMode === "code" ? (
              <EditorErrorBoundary>
                <MonacoEditor
                  height="400px"
                  language={lang}
                  value={code}
                  onChange={(v) => setCode(v ?? "")}
                  theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
                  options={{
                    fontSize: 13,
                    fontFamily: "JetBrains Mono, Fira Code, monospace",
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    tabSize: 4,
                    wordWrap: "on",
                    cursorBlinking: "smooth",
                    renderLineHighlight: "all",
                    suggestOnTriggerCharacters: true,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </EditorErrorBoundary>
            ) : (
              /* File drop zone */
              <div className="p-6 h-[400px] flex flex-col items-center justify-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".py,.sql,.r,.csv,.ipynb,.xlsx,.parquet,.json,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > MAX_FILE_SIZE) { toast.error("Fichier trop lourd. Maximum 10 MB."); return; }
                    setUploadedFile(f ?? null);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f && f.size > MAX_FILE_SIZE) { toast.error("Fichier trop lourd. Maximum 10 MB."); return; }
                    if (f) setUploadedFile(f);
                  }}
                  className={cn(
                    "w-full h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                    dragOver ? "border-blue-400 bg-blue-50" : uploadedFile ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                  )}
                >
                  {uploadedFile ? (
                    <>
                      <FileText className="w-10 h-10 text-green-500" />
                      <p className="text-sm font-semibold text-green-700">{uploadedFile.name}</p>
                      <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB — cliquer pour changer</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-500">Glisse ton fichier ici ou clique pour sélectionner</p>
                      <p className="text-xs text-slate-400">.py · .sql · .csv · .ipynb · .xlsx · .parquet · .json (max 10 MB)</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Claude va analyser ton fichier et l&apos;évaluer automatiquement en fonction des critères du challenge.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          {user ? (
            isLimitReached ? (
              <button
                onClick={() => setShowLimitModal(true)}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
              >
                <Flame className="w-4 h-4" />
                Limite quotidienne atteinte — Passer à Pro
              </button>
            ) : submitMode === "file" ? (
              <Button
                onClick={() => uploadSubmit()}
                loading={uploading}
                disabled={!uploadedFile}
                className="w-full justify-center py-3.5 text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Analyse en cours..." : uploadedFile ? `Soumettre "${uploadedFile.name}"` : "Sélectionne un fichier"}
              </Button>
            ) : (
              <Button
                onClick={() => submit()}
                loading={submitting}
                className="w-full justify-center py-3.5 text-sm"
              >
                <Play className="w-4 h-4" />
                {submitting ? "Évaluation en cours..." : "Soumettre la solution"}
              </Button>
            )
          ) : (
            <div className="glass rounded-2xl p-5 text-center border border-blue-100/60">
              <p className="text-slate-600 text-sm mb-3">
                <Lock className="w-4 h-4 inline mr-1.5 text-blue-500" />
                Connecte-toi pour soumettre ta solution
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/login" className="btn-secondary text-sm">Se connecter</Link>
                <Link href="/register" className="btn-primary text-sm">
                  Créer un compte <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Result */}
          {lastSubmission && (
            <div className={cn(
              "glass rounded-2xl overflow-hidden border",
              lastSubmission.status === "accepted" ? "border-green-200" : lastSubmission.status === "running" || lastSubmission.status === "pending" ? "border-blue-200" : "border-red-200"
            )}>
              {/* Status banner */}
              <div className={cn(
                "px-5 py-4",
                lastSubmission.status === "accepted" ? "bg-gradient-to-r from-green-50 to-emerald-50" :
                lastSubmission.status === "running" || lastSubmission.status === "pending" ? "bg-gradient-to-r from-blue-50 to-indigo-50" :
                "bg-gradient-to-r from-red-50 to-rose-50"
              )}>
                <div className="flex items-center justify-between">
                  <StatusBadge status={lastSubmission.status} />
                  <div className="flex items-center gap-3">
                    {lastSubmission.execution_time_ms && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/60 px-2.5 py-1 rounded-lg border border-white/80">
                        <Clock className="w-3.5 h-3.5" />{lastSubmission.execution_time_ms}ms
                      </span>
                    )}
                    {lastSubmission.score !== null && lastSubmission.score !== undefined && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {Math.round(lastSubmission.score)}/100
                      </span>
                    )}
                    {lastSubmission.elo_delta !== null && lastSubmission.elo_delta !== 0 && (
                      <span className={cn(
                        "font-bold flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg border",
                        lastSubmission.elo_delta > 0 ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"
                      )}>
                        <Zap className="w-4 h-4" />{lastSubmission.elo_delta > 0 ? "+" : ""}{lastSubmission.elo_delta} ELO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5">
              {lastSubmission.status === "accepted" && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-100/80 to-emerald-100/60 border border-green-200 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-sm shadow-green-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">Félicitations !</p>
                    <p className="text-xs text-green-700">Tous les tests sont passés. ELO : <strong>{formatElo(user?.elo ?? 0)}</strong></p>
                  </div>
                </div>
              )}

              {lastSubmission.error_message && (
                <pre className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-xl p-3 overflow-x-auto font-mono mt-3">
                  {lastSubmission.error_message}
                </pre>
              )}

              <TestCaseResults submission={lastSubmission} />

              {/* LLM evaluation detail (file submissions) */}
              {(() => {
                const evalData = (lastSubmission.result_detail as { llm_evaluation?: { strengths: string[]; weaknesses: string[]; advice: string; score: number } })?.llm_evaluation;
                if (!evalData) return null;
                return (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-slate-800">Évaluation Claude</span>
                      <span className="ml-auto text-sm font-black text-blue-700">{evalData.score}/100</span>
                    </div>
                    {evalData.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1.5">Points forts</p>
                        <ul className="space-y-1">
                          {evalData.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evalData.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1.5">Points à améliorer</p>
                        <ul className="space-y-1">
                          {evalData.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evalData.advice && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs text-blue-800 leading-relaxed">{evalData.advice}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
