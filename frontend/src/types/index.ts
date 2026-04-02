// User
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  elo: number;
  rank: "Rookie" | "Analyst" | "Expert" | "Master" | "Grand Master";
  challenges_solved: number;
  total_submissions: number;
  streak_days: number;
  is_premium: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
}

// Challenges
export type ChallengeCategory =
  | "sql"
  | "machine_learning"
  | "deep_learning"
  | "nlp"
  | "computer_vision"
  | "visualization"
  | "data_engineering";

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "expert";
export type ChallengeType = "code" | "model" | "notebook" | "quiz";

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  challenge_type: ChallengeType;
  base_points: number;
  elo_reward: number;
  total_attempts: number;
  total_solves: number;
  solve_rate: number;
  is_premium: boolean;
  tags: string[];
  // Fields from ChallengeDetail (only available on /challenges/{slug})
  description?: string;
  starter_code?: string | null;
  dataset_url?: string | null;
  evaluation_config?: Record<string, unknown>;
  time_limit_seconds?: number;
  memory_limit_mb?: number;
}

// Submissions
export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit"
  | "memory_limit"
  | "runtime_error"
  | "compilation_error"
  | "score_below_threshold";

export interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  status: SubmissionStatus;
  score: number | null;
  execution_time_ms: number | null;
  elo_before: number | null;
  elo_after: number | null;
  elo_delta: number | null;
  is_first_solve: boolean;
  result_detail: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

// Leaderboard
export interface LeaderboardEntry {
  position: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  elo: number;
  rank_name: string;
  challenges_solved: number;
}

// Courses
export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: ChallengeCategory;
  level: "beginner" | "intermediate" | "advanced";
  is_premium: boolean;
  lessons_count: number;
  progress_percent?: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  duration_minutes: number;
  is_premium: boolean;
  linked_challenge_id: string | null;
  linked_challenge_slug: string | null;
  completed: boolean;
}

// ELO
export interface EloHistoryEntry {
  id: string;
  elo_before: number;
  elo_after: number;
  delta: number;
  reason: string;
  created_at: string;
}
