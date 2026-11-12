import React from 'react';
import { Course } from '../types';
import { BookOpen, Check, Plus, ArrowRight, Sparkles } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (courseId: string) => void;
  onToggleEnroll?: (courseId: string, isEnrolled: boolean) => void;
  isCompact?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelectCourse,
  onToggleEnroll,
  isCompact = false,
}) => {
  return (
    <div className="glass-card-hover rounded-2xl p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-xs tracking-wide border border-emerald-500/20">
              {course.code}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {course.credits} Credits
            </span>
          </div>

          {course.is_enrolled && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
              <Check className="w-3 h-3" /> Enrolled
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {course.semester_level}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {course.topic_count || 0} Topics Available
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <button
          onClick={() => onSelectCourse(course.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition group/btn"
        >
          <span>Open Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
        </button>

        {onToggleEnroll && (
          <button
            onClick={() => onToggleEnroll(course.id, !course.is_enrolled)}
            className={`p-2 rounded-xl text-xs font-bold transition border ${
              course.is_enrolled
                ? 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
            }`}
            title={course.is_enrolled ? "Drop Course" : "Enroll for Term"}
          >
            {course.is_enrolled ? "Drop" : <Plus className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};
