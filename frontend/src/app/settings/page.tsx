"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Palette, Globe, Camera, Save, Sun, Moon, Monitor,
  ChevronRight, Check, Lock, Trash2, AlertTriangle,
} from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const PROFILE_TYPES = [
  { value: "student", label: "Étudiant(e)", emoji: "🎓" },
  { value: "junior", label: "Data Analyst Junior", emoji: "📊" },
  { value: "senior", label: "Data Scientist", emoji: "🔬" },
  { value: "ml_engineer", label: "ML Engineer", emoji: "⚙️" },
  { value: "researcher", label: "Chercheur / Académique", emoji: "🧪" },
  { value: "other", label: "Autre", emoji: "💡" },
];

const COUNTRIES = [
  { code: "FR", label: "🇫🇷 France" },
  { code: "BE", label: "🇧🇪 Belgique" },
  { code: "CH", label: "🇨🇭 Suisse" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "MA", label: "🇲🇦 Maroc" },
  { code: "TN", label: "🇹🇳 Tunisie" },
  { code: "SN", label: "🇸🇳 Sénégal" },
  { code: "GB", label: "🇬🇧 Royaume-Uni" },
  { code: "DE", label: "🇩🇪 Allemagne" },
  { code: "US", label: "🇺🇸 États-Unis" },
  { code: "OTHER", label: "🌍 Autre" },
];

const TABS = [
  { id: "profile", label: "Profil", icon: User },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "language", label: "Langue", icon: Globe },
  { id: "danger", label: "Compte", icon: AlertTriangle },
];

type Tab = "profile" | "appearance" | "language" | "danger";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("coachai_lang") ?? "fr") : "fr"
  );

  const [form, setForm] = useState({
    username: user?.username ?? "",
    display_name: (user as { display_name?: string } | null)?.display_name ?? "",
    bio: "",
    avatar_url: (user as { avatar_url?: string } | null)?.avatar_url ?? "",
    country: "",
    profile_type: "",
  });

  // Load full profile on mount to get bio, country, profile_type
  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    usersApi.getProfile(user.username).then((r) => {
      const p = r.data as typeof r.data & { bio?: string; country?: string; profile_type?: string; display_name?: string };
      setForm({
        username: p.username,
        display_name: p.display_name ?? "",
        bio: p.bio ?? "",
        avatar_url: p.avatar_url ?? "",
        country: p.country ?? "",
        profile_type: p.profile_type ?? "",
      });
    });
  }, [user, router]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof usersApi.updateProfile>[0]) =>
      usersApi.updateProfile(data),
    onSuccess: (r) => {
      setUser(r.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil mis à jour !");
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err?.response?.data?.detail ?? "Erreur lors de la mise à jour");
    },
  });

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      bio: form.bio,
      avatar_url: form.avatar_url || undefined,
      country: form.country || undefined,
      username: form.username !== user?.username ? form.username : undefined,
      display_name: form.display_name || undefined,
      profile_type: form.profile_type || undefined,
    });
  }

  function handleLangChange(l: string) {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("coachai_lang", l);
    toast.success(l === "fr" ? "Langue définie sur Français" : "Language set to English");
  }

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteAccount(deletePassword),
    onSuccess: () => {
      toast.success("Compte supprimé. Au revoir.");
      useAuthStore.getState().logout();
      router.push("/");
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err?.response?.data?.detail ?? "Erreur lors de la suppression");
    },
  });

  if (!user) return null;

  const avatarLetter = (form.display_name || form.username || "?")[0].toUpperCase();

  function DangerZone() {
    return (
      <div className="glass rounded-2xl p-6 border border-red-200 dark:border-red-900 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-red-800 dark:text-red-400 text-base">Zone de danger</h2>
            <p className="text-xs text-red-600/70">Actions irréversibles</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Supprimer mon compte
          </h3>
          <p className="text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed mb-4">
            Cette action est <strong>irréversible</strong>. Toutes tes données seront définitivement supprimées : profil, soumissions, ELO, badges, et historique.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 px-4 py-2 rounded-xl transition-colors"
            >
              Supprimer mon compte...
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
                  Confirme avec ton mot de passe
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Ton mot de passe actuel"
                  className="input-glass text-sm w-full border-red-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                  className="flex-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { if (deletePassword) deleteMutation.mutate(); }}
                  disabled={!deletePassword || deleteMutation.isPending}
                  className="flex-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Supprimer définitivement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Personnalise ton compte et ton expérience</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="glass rounded-2xl p-2 border border-blue-100 dark:border-slate-700 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700"
                )}
              >
                <t.icon className="w-4 h-4 flex-shrink-0" />
                {t.label}
                {tab === t.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* ── PROFIL ── */}
          {tab === "profile" && (
            <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6 border border-blue-100 dark:border-slate-700 space-y-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Informations personnelles</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="avatar" width={80} height={80}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-blue-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                      {avatarLetter}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    <Camera className="w-3.5 h-3.5 inline mr-1" />URL de la photo de profil
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    className="input-glass text-sm w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">Lien vers une image publique (GitHub, Gravatar, etc.)</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pseudo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Pseudo <span className="text-slate-400 font-normal">(identifiant)</span>
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    pattern="[a-zA-Z0-9_]{3,20}"
                    minLength={3}
                    maxLength={20}
                    className="input-glass text-sm w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">3-20 caractères, lettres/chiffres/_</p>
                </div>

                {/* Nom affiché */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Nom affiché <span className="text-slate-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ton prénom ou nom complet"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                    maxLength={100}
                    className="input-glass text-sm w-full"
                  />
                  <p className="text-xs text-slate-400 mt-1">Affiché sur ton profil public</p>
                </div>
              </div>

              {/* Profil type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Profil professionnel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROFILE_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => setForm({ ...form, profile_type: pt.value })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                        form.profile_type === pt.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <span className="text-base">{pt.emoji}</span>
                      <span className="leading-tight text-xs">{pt.label}</span>
                      {form.profile_type === pt.value && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Bio</label>
                <textarea
                  placeholder="Parle de toi, de ton parcours data..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={300}
                  rows={3}
                  className="input-glass text-sm w-full resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{form.bio.length}/300 caractères</p>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Pays</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input-glass text-sm w-full"
                >
                  <option value="">— Sélectionner —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Email (readonly) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Adresse email</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Le changement d&apos;email n&apos;est pas encore disponible</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary w-full justify-center py-3"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enregistrement...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="w-4 h-4" />Sauvegarder le profil</span>
                )}
              </button>
            </form>
          )}

          {/* ── APPARENCE ── */}
          {tab === "appearance" && (
            <div className="glass rounded-2xl p-6 border border-blue-100 dark:border-slate-700 space-y-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Apparence</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Thème</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Clair", icon: Sun, desc: "Interface lumineuse" },
                    { value: "dark", label: "Sombre", icon: Moon, desc: "Interface sombre" },
                    { value: "system", label: "Système", icon: Monitor, desc: "Suit l'OS" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTheme(t.value); toast.success(`Thème ${t.label.toLowerCase()} activé`); }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        theme === t.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                          : "border-slate-200 dark:border-slate-600 hover:border-blue-300 bg-white dark:bg-slate-800"
                      )}
                    >
                      {/* Preview */}
                      <div className={cn(
                        "w-full h-14 rounded-xl overflow-hidden border",
                        t.value === "light" ? "bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200" :
                        t.value === "dark" ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700" :
                        "border-slate-200",
                        t.value === "system" && "bg-gradient-to-br from-slate-50 to-slate-900"
                      )}>
                        {t.value === "system" && (
                          <div className="flex h-full">
                            <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50" />
                            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center mb-0.5">
                          <t.icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                          <span className={cn("text-sm font-semibold", theme === t.value ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300")}>{t.label}</span>
                          {theme === t.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-xs text-slate-400">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  💡 Le thème est appliqué instantanément sur toute la plateforme et mémorisé entre tes sessions.
                </p>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {tab === "danger" && (
            <DangerZone />
          )}

          {/* ── LANGUE ── */}
          {tab === "language" && (
            <div className="glass rounded-2xl p-6 border border-blue-100 dark:border-slate-700 space-y-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Langue de l&apos;interface</h2>

              <div className="grid gap-3">
                {[
                  { code: "fr", label: "Français", flag: "🇫🇷", desc: "Interface complète en français" },
                  { code: "en", label: "English", flag: "🇬🇧", desc: "Full English interface (coming soon)" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    disabled={l.code === "en"}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                      lang === l.code
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-slate-200 dark:border-slate-600 hover:border-blue-300 bg-white dark:bg-slate-800",
                      l.code === "en" && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <span className="text-3xl">{l.flag}</span>
                    <div className="flex-1">
                      <p className={cn("font-semibold text-sm", lang === l.code ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300")}>{l.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
                    </div>
                    {lang === l.code && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {l.code === "en" && (
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg font-medium">Bientôt</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  💡 CoachAI est actuellement disponible en <strong>français</strong>. La version anglaise est en cours de développement et sera disponible prochainement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
