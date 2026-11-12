import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Topic } from '../types';
import { Flame, ArrowRight } from 'lucide-react';

interface HighYieldPageProps {
  onSelectCourse: (courseId: string) => void;
}

export const HighYieldPage: React.FC<HighYieldPageProps> = ({ onSelectCourse }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [minProbability, setMinProbability] = useState<number>(85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighYield = async () => {
      setLoading(true);
      try {
        const res = await api.get<Topic[]>(`/topics/high-yield?min_probability=${minProbability}`);
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to load recurrent topics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighYield();
  }, [minProbability]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900/60 to-transparent">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 mb-3">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>DIU Past Exam Questions Bank Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Most Repeated DIU Exam Questions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Concepts and problem patterns that appeared repeatedly across the last 5 years of DIU semester exam papers. Master these core questions first to secure high grades.
        </p>

        {/* Repeat Frequency Filter */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-semibold text-slate-400">Exam Recurrence:</span>
          {[85, 90, 95].map((thresh) => (
            <button
              key={thresh}
              onClick={() => setMinProbability(thresh)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition font-mono ${
                minProbability === thresh
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              &ge; {thresh}% Common in Exams
            </button>
          ))}
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-500">
            No questions found for this frequency filter.
          </div>
        ) : (
          topics.map((t) => (
            <div
              key={t.id}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-black font-mono rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" />
                    {t.probability_score}% Exam Recurrence
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {t.exam_stage === 'midterm' ? 'Midterm Exam' : t.exam_stage === 'final' ? 'Final Exam' : 'Midterm & Final'}
                  </span>
                  {t.global_benchmarks?.code && (
                    <span className="text-[10px] text-indigo-500 font-semibold hidden md:inline">
                      🌐 {t.global_benchmarks.code}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition">
                  {t.title}
                </h3>

                {t.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => onSelectCourse(t.course_id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-emerald-500 hover:text-white transition shrink-0"
              >
                <span>View in Course Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
