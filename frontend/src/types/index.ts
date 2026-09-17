export type UserRole = "student" | "parent" | "counselor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  province: string;
  grad_year: number | null;
}

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
}

export type JobOutlook = "bright" | "growing" | "stable" | "declining";

export interface LinkedProgram {
  id: string;
  name: string;
  slug: string;
  degree_type: DegreeType;
  university_name: string;
  university_slug: string;
}

export interface Career {
  id: string;
  title: string;
  slug: string;
  category: CareerCategory | null;
  salary_min: number | null;
  salary_max: number | null;
  job_outlook: JobOutlook;
  // Present on the detail endpoint only.
  description?: string;
  required_education?: string;
  skills?: string[];
  programs?: LinkedProgram[];
  created_at?: string;
  updated_at?: string;
}

export type DegreeType =
  | "certificate"
  | "diploma"
  | "associate"
  | "bachelor"
  | "master"
  | "doctorate";

export interface Program {
  id: string;
  name: string;
  slug: string;
  degree_type: DegreeType;
  duration_years: string;
  tuition_domestic: string | null;
  tuition_intl: string | null;
  avg_gpa_required: string | null;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  province: string;
  city: string;
  avg_rating: string;
  total_reviews: number;
  ranking_national: number | null;
  // Present on the detail endpoint only.
  website?: string;
  logo_url?: string;
  programs?: Program[];
  created_at?: string;
  updated_at?: string;
}

export interface ReviewAuthor {
  id: string;
  full_name: string;
}

export interface Review {
  id: string;
  user: ReviewAuthor;
  program: string | null;
  overall_rating: number;
  teaching_rating: number;
  career_support_rating: number;
  body: string;
  is_verified: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface QuizOption {
  value: string;
  label: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface MatchResult {
  id: string;
  session_key: string;
  quiz_answers: Record<string, string>;
  recommended_careers: Career[];
  recommended_programs: LinkedProgram[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  session_key: string;
  created_at: string;
  messages?: Message[];
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}
