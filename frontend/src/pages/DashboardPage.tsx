import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Course, SemesterSummaryAnalytics } from '../types';
import { CourseCard } from '../components/CourseCard';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Globe,
  FileText
} from 'lucide-react';

interface DashboardPageProps {
  onSelectCourse: (courseId: string) => void;
  onNavigateBrowse: () => void;
  onNavigateHighYield: () => void;
  onNavigateGlobal: () => void;
  onNavigatePapers?: () => void;
  onOpenAuth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectCourse,
  onNavigateBrowse,
  onNavigateHighYield,
  onNavigateGlobal,
  onNavigatePapers,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState<SemesterSummaryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [enrRes, sumRes] = await Promise.all([
          api.get<Course[]>('/tracker/my-courses'),
          api.get<SemesterSummaryAnalytics>('/analytics/semester-summary'),
        ]);
        setCourses(enrRes.data);
        setSummary(sumRes.data);
      } else {
        // Unauthenticated preview: fetch L2T1 courses
        const cRes = await api.get<Course[]>('/courses?semester_level=Level%202%20Term%201');
        setCourses(cRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleToggleEnroll = async (courseId: string, enroll: boolean) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      if (enroll) {
        await api.post('/tracker/enroll', { course_id: courseId });
      } else {
        await api.delete(`/tracker/enroll/${courseId}`);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to update enrollment', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/20 shadow-glass">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official DIU CSE Syllabus • {user?.current_semester || 'Level 2 Term 1'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Track your semester & prepare for <span className="text-gradient">DIU Exams with confidence</span>.
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Break down your courses into Midterm vs. Final topics, see which questions repeat most often in exams, and explore what extra skills you need to compete with MIT & Harvard graduates.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {!user && (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-extrabold shadow-glow-emerald hover:brightness-105 transition"
              >
                1-Click Explore as Demo Student
              </button>
            )}
            <button
              onClick={onNavigateGlobal}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>MIT & Harvard Global Roadmap</span>
            </button>
            {onNavigatePapers && (
              <button
                onClick={onNavigatePapers}
                className="px-4 py-2.5 rounded-xl bg-cyan-600/30 text-cyan-200 text-xs font-bold border border-cyan-500/40 hover:bg-cyan-600/40 transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>DIUQBank Papers</span>
              </button>
            )}
            <button
              onClick={onNavigateBrowse}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-700 transition"
            >
              Browse 12 Semesters
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Stats (if logged in) */}
      {user && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Enrolled Courses</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {summary.enrolled_courses_count}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active in {user.current_semester}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Midterm Preparedness</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {Math.round(summary.average_midterm_readiness_pct)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Prioritizing repeated questions
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4 text-cyan-500" />
              <span>Final Exam Preparedness</span>
            </div>
            <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
              {Math.round(summary.average_final_readiness_pct)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Prioritizing repeated questions
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              <span>Total Progress</span>
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {Math.round(summary.overall_semester_progress_pct)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.completed_topics} of {summary.total_topics} topics finished
            </div>
          </div>
        </div>
      )}

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user ? `Enrolled Courses (${user.current_semester})` : 'Featured DIU CSE Courses'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any course to open its full Midterm & Final topic roadmap
            </p>
          </div>

          <button
            onClick={onNavigateBrowse}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View all 12 Semesters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No courses enrolled yet for this semester
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse the official 12-semester DIU CSE catalog and select the courses you are currently taking.
            </p>
            <button
              onClick={onNavigateBrowse}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-white shadow-glow-emerald hover:brightness-105 transition"
            >
              Browse & Enroll Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse}
                onToggleEnroll={user ? handleToggleEnroll : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Simplified Two-Banner Section: Top Exam Questions & Global Track */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Most Repeated Questions Banner */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>DIU Exam Question Bank Analysis</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Most Repeated DIU Exam Questions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Questions that appeared in 4 or more of the last 5 DIU exam sessions. Learn these first for high marks.
            </p>
          </div>

          <button
            onClick={onNavigateHighYield}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition self-start shadow-sm flex items-center gap-1.5"
          >
            <span>View Top Exam Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Tech & Ivy League Banner */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-1">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>Beyond DIU Curriculum</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              MIT, Harvard & Global Tech Roadmap
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              What extra skills, coding platforms, and open-source contributions you need to stand out globally.
            </p>
          </div>

          <button
            onClick={onNavigateGlobal}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition self-start shadow-sm flex items-center gap-1.5"
          >
            <span>Open Global Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
