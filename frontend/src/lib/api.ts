import axios from "axios";
import type { User, Challenge, Submission, LeaderboardEntry, Course, Lesson, EloHistoryEntry } from "@/types";
import { useAuthStore } from "@/store/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const http = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Legacy alias
export const api = http;

// ─── Request interceptor — injecte le token ───────────────────────────────────
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("access_token") ??
      useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auto-refresh sur 401 ─────────────────────────────────────────────────────
// Quand l'access token expire, on tente un refresh silencieux avec le refresh token.
// Si le refresh échoue (refresh token expiré/révoqué), on logout et on redirige.
// Requêtes concurrentes mises en file d'attente pendant le refresh.

let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;

    // Ignore les erreurs non-401, les retries déjà faits, et les appels refresh eux-mêmes
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      typeof window === "undefined"
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refresh_token") ??
      useAuthStore.getState().refreshToken;

    // Pas de refresh token → logout si l'utilisateur était connecté
    if (!refreshToken) {
      const hadToken =
        !!localStorage.getItem("access_token") ||
        !!useAuthStore.getState().token;
      if (hadToken) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Un refresh est déjà en cours → mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ access_token: string }>(
        `${BASE}/api/auth/refresh`,
        { refresh_token: refreshToken }
      );
      const newToken = data.access_token;

      // Met à jour partout
      localStorage.setItem("access_token", newToken);
      useAuthStore.setState({ token: newToken });

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    http.post<{ access_token: string; refresh_token: string; user: User }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    http.post<{ access_token: string; refresh_token: string; user: User }>("/auth/login", data),
  me: () => http.get<User>("/auth/me"),
  logout: (refresh_token: string) => http.post("/auth/logout", { refresh_token }),
  forgotPassword: (email: string) => http.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, new_password: string) =>
    http.post("/auth/reset-password", { token, new_password }),
};

// ─── Challenges ───────────────────────────────────────────────────────────────
export const challengesApi = {
  list: (params?: { category?: string; difficulty?: string; search?: string; page?: number; per_page?: number }) =>
    http.get<{ items: Challenge[]; total: number; page: number; per_page: number; pages: number }>("/challenges", { params }),
  get: (slug: string) => http.get<Challenge>(`/challenges/${slug}`),
};

// ─── Submissions ─────────────────────────────────────────────────────────────
export const submissionsApi = {
  submit: (data: { challenge_id: string; code: string; language?: string }) =>
    http.post<Submission>("/submissions", data),
  uploadFile: (challengeId: string, file: File) => {
    const form = new FormData();
    form.append("challenge_id", challengeId);
    form.append("file", file);
    return http.post<Submission>("/submissions/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  get: (id: string) => http.get<Submission>(`/submissions/${id}`),
  forChallenge: (challengeId: string, page = 1) =>
    http.get<Submission[]>(`/submissions/challenge/${challengeId}`, { params: { page } }),
  dailyStatus: () =>
    http.get<{ is_premium: boolean; limit: number | null; used: number | null; remaining: number | null }>("/submissions/daily-status"),
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardApi = {
  global: (page = 1, perPage = 50) =>
    http.get<{ entries: LeaderboardEntry[]; total: number; page: number; per_page: number }>(
      "/leaderboard",
      { params: { page, per_page: perPage } }
    ),
  myRank: () => http.get<{ position: number | null; elo: number | null; rank?: string }>("/leaderboard/me"),
};

// ─── Courses ─────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: () => http.get<Course[]>("/courses"),
  get: (slug: string) => http.get<Course & { lessons: Lesson[] }>(`/courses/${slug}`),
  getLesson: (slug: string, lessonId: string) =>
    http.get<Lesson & { content: string; linked_challenge_id: string | null }>(`/courses/${slug}/lessons/${lessonId}`),
  completeLesson: (slug: string, lessonId: string) =>
    http.post(`/courses/${slug}/lessons/${lessonId}/complete`),
};

// ─── Billing ─────────────────────────────────────────────────────────────────
export const billingApi = {
  createCheckout: () =>
    http.post<{ url: string }>("/billing/checkout"),
  portal: () =>
    http.get<{ url: string }>("/billing/portal"),
  status: () =>
    http.get<{ is_premium: boolean; premium_until: string | null; stripe_customer_id: string | null }>("/billing/status"),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  message: (messages: { role: string; content: string }[], context?: string) =>
    http.post<{ content: string }>("/chat/message", { messages, context }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminChallenge {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  challenge_type: string;
  is_published: boolean;
  is_premium: boolean;
  elo_reward: number;
  total_attempts: number;
  total_solves: number;
  tags: string[];
}

export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  is_published: boolean;
  is_premium: boolean;
  lessons_count: number;
}

export const adminApi = {
  stats: () => http.get<{ users: number; challenges: number; submissions: number; courses: number }>("/admin/stats"),
  listChallenges: () => http.get<AdminChallenge[]>("/admin/challenges"),
  listCourses: () => http.get<AdminCourse[]>("/admin/courses"),
  togglePublishChallenge: (slug: string, is_published: boolean) =>
    http.patch(`/admin/challenges/${slug}`, { is_published }),
  togglePremiumChallenge: (slug: string, is_premium: boolean) =>
    http.patch(`/admin/challenges/${slug}`, { is_premium }),
  togglePublishCourse: (slug: string) =>
    http.post(`/admin/courses/${slug}/publish`),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (username: string) => http.get<User & { bio: string | null; badges: unknown[] }>(`/users/${username}`),
  updateProfile: (data: { bio?: string; avatar_url?: string; country?: string; display_name?: string; profile_type?: string; username?: string }) =>
    http.patch<User>("/users/me", data),
  mySubmissions: (page = 1) => http.get<Submission[]>("/users/me/submissions", { params: { page } }),
  myEloHistory: () => http.get<EloHistoryEntry[]>("/users/me/elo-history"),
  deleteAccount: (password: string) => http.post("/users/me/delete", { password }),
};
