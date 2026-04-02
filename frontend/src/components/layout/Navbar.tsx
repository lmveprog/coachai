"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Brain, Menu, X, LogOut, User, Trophy, BookOpen, Zap, CreditCard, ChevronDown, Settings, Shield } from "lucide-react";
import { cn, formatElo, RANK_ICONS } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const navLinks = [
  { href: "/challenges", label: "Challenges", icon: Zap },
  { href: "/learn", label: "Formation", icon: BookOpen },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
  { href: "/pricing", label: "Tarifs", icon: CreditCard },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); setMenuOpen(false); }, [pathname]);

  // Escape key + focus trap for dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(dropdownRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
        const idx = items.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    // Focus first item when opening
    requestAnimationFrame(() => {
      dropdownRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    });
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  return (
    <nav className="navbar-bar sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl gradient-text">CoachAI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname.startsWith(href)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/60 dark:hover:bg-blue-900/20"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  ref={triggerRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  aria-label="Menu utilisateur"
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl glass glass-hover border border-blue-100"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{RANK_ICONS[user.rank]}</span>
                    <span className="text-sm font-bold text-blue-700">{formatElo(user.elo)}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user.username[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div ref={dropdownRef} role="menu" className="absolute right-0 mt-2 w-52 glass-intense rounded-2xl overflow-hidden z-20 shadow-xl border border-blue-100 dark:border-blue-900/40">
                      <div className="px-4 py-3.5 border-b border-blue-50 dark:border-white/5">
                        <p className="text-sm font-bold text-slate-900">{user.username}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">{user.rank} · {formatElo(user.elo)} ELO</p>
                      </div>
                      <Link role="menuitem"
                        href={`/profile/${user.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors focus:outline-none focus:bg-blue-50 focus:text-blue-700"
                      >
                        <User className="w-4 h-4" /> Mon profil
                      </Link>
                      <Link role="menuitem"
                        href="/pricing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors focus:outline-none focus:bg-blue-50 focus:text-blue-700"
                      >
                        <CreditCard className="w-4 h-4" />
                        {user.is_premium ? "Mon abonnement" : "Passer à Pro"}
                        {!user.is_premium && (
                          <span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>
                        )}
                      </Link>
                      <Link role="menuitem"
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors focus:outline-none focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Settings className="w-4 h-4" /> Paramètres
                      </Link>
                      {user.is_admin && (
                        <Link role="menuitem"
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 transition-colors focus:outline-none focus:bg-purple-50"
                        >
                          <Shield className="w-4 h-4" /> Admin
                        </Link>
                      )}
                      <button role="menuitem"
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-red-50 dark:border-red-900/20 focus:outline-none focus:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
                  Commencer gratuitement
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-100 dark:border-blue-900/30 px-4 py-4 space-y-1 bg-white/90 dark:bg-slate-950/95 backdrop-blur-lg">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname.startsWith(href)
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {user ? (
            <div className="pt-2 border-t border-blue-100 dark:border-blue-900/30 space-y-1">
              <Link href={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <User className="w-4 h-4" /> Profil
              </Link>
              <Link href="/settings" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Settings className="w-4 h-4" /> Paramètres
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                <button className="btn-secondary w-full justify-center text-sm">Connexion</button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                <button className="btn-primary w-full justify-center text-sm">S&apos;inscrire</button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
