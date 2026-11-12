export interface User {
  id: string;
  email: string;
  full_name: string;
  student_id: string | null;
  current_semester: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ResourceItem {
  title: string;
  url: string;
  type: 'youtube' | 'documentation' | 'article' | 'problem_set';
}

export interface GlobalBenchmark {
  code?: string;
  notes?: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  exam_stage: 'midterm' | 'final' | 'both';
  priority: 'high' | 'medium' | 'low';
  probability_score: number;
  is_industry_essential: boolean;
  global_benchmarks?: GlobalBenchmark;
  resources?: ResourceItem[];
  status?: 'not_started' | 'completed' | 'in_progress' | 'review';
  notes?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  semester_level: string;
  department: string;
  topic_count?: number;
  is_enrolled?: boolean;
}

export interface CourseDetail extends Course {
  topics: Topic[];
}

export interface StageReadiness {
  total_topics: number;
  completed_topics: number;
  in_progress_topics: number;
  review_topics: number;
  raw_completion_pct: number;
  weighted_readiness_pct: number;
  high_yield_mastered: number;
  high_yield_total: number;
}

export interface CourseReadinessAnalytics {
  course_id: string;
  course_code: string;
  course_title: string;
  overall_progress_pct: number;
  midterm: StageReadiness;
  final: StageReadiness;
  global_depth_pct: number;
  industry_mastered: number;
  industry_total: number;
}

export interface SemesterSummaryAnalytics {
  enrolled_courses_count: number;
  total_topics: number;
  completed_topics: number;
  average_midterm_readiness_pct: number;
  average_final_readiness_pct: number;
  overall_semester_progress_pct: number;
}

export interface PastQuestionPaper {
  id: string;
  course_id: string;
  course_code?: string;
  course_title?: string;
  diuqb_id?: number;
  title: string;
  semester_name?: string;
  exam_type?: string;
  pdf_url?: string;
  file_size?: number;
  view_count?: number;
}
