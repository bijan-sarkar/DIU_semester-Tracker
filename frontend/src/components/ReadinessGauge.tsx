import React from 'react';
import { CourseReadinessAnalytics } from '../types';
import { Award, Target, Globe } from 'lucide-react';

interface ReadinessGaugeProps {
  analytics: CourseReadinessAnalytics;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ analytics }) => {
  const midtermPct = Math.round(analytics.midterm.weighted_readiness_pct);
  const finalPct = Math.round(analytics.final.weighted_readiness_pct);
  const globalPct = Math.round(analytics.global_depth_pct);

  // SVG Progress Ring calculation
  const size = 80;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const renderRing = (pct: number, colorStroke: string) => {
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-white">
            {pct}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Exam Preparedness & Study Progress
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Calculated by giving higher priority to topics that appear most frequently in DIU past exams
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {analytics.overall_progress_pct}% Topics Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Midterm Readiness Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          {renderRing(midtermPct, '#10b981')}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              Midterm Preparedness
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {analytics.midterm.completed_topics} of {analytics.midterm.total_topics} topics done
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
              ⭐ {analytics.midterm.high_yield_mastered}/{analytics.midterm.high_yield_total} Top Repeated Questions
            </div>
          </div>
        </div>

        {/* Final Exam Readiness Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          {renderRing(finalPct, '#06b6d4')}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <Award className="w-3.5 h-3.5" />
              Final Exam Preparedness
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {analytics.final.completed_topics} of {analytics.final.total_topics} topics done
            </div>
            <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-medium">
              ⭐ {analytics.final.high_yield_mastered}/{analytics.final.high_yield_total} Top Repeated Questions
            </div>
          </div>
        </div>

        {/* Global Depth & Industry Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          {renderRing(globalPct, '#8b5cf6')}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              <Globe className="w-3.5 h-3.5" />
              Global Tech / MIT Depth
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {analytics.industry_mastered} of {analytics.industry_total} interview topics
            </div>
            <div className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
              Matched to global CS standards
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
