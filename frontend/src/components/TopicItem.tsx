import React, { useState } from 'react';
import { Topic } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  ExternalLink, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  PlayCircle,
  Code2,
  BookMarked
} from 'lucide-react';

interface TopicItemProps {
  topic: Topic;
  onStatusChange: (topicId: string, status: 'completed' | 'in_progress' | 'review' | 'not_started') => void;
  onOpenNotes: (topic: Topic) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic, onStatusChange, onOpenNotes }) => {
  const [showResources, setShowResources] = useState(false);
  const status = topic.status || 'not_started';
  const isFrequentlyTested = topic.probability_score >= 85;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Must Learn</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Important</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-500/10 text-slate-500 border border-slate-500/20">Optional</span>;
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'midterm':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Midterm</span>;
      case 'final':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Final</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Mid & Final</span>;
    }
  };

  return (
    <div className={`p-4 rounded-xl transition-all duration-200 border ${
      status === 'completed'
        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/30'
        : status === 'in_progress'
        ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-500/30'
        : status === 'review'
        ? 'bg-purple-50/40 dark:bg-purple-950/10 border-purple-500/30'
        : 'glass-card border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Title, Tags & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {getStageBadge(topic.exam_stage)}
            {getPriorityBadge(topic.priority)}

            {/* Exam Recurrence Badge */}
            <div className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono ${
              isFrequentlyTested 
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {isFrequentlyTested && <Flame className="w-3 h-3 text-rose-500 animate-pulse" />}
              <span>{topic.probability_score}% Common in Exams</span>
            </div>

            {/* Global Benchmark Pill */}
            {topic.global_benchmarks?.code && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                🌐 {topic.global_benchmarks.code}
              </span>
            )}
          </div>

          <h4 className={`text-sm font-bold tracking-tight ${
            status === 'completed' 
              ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-85' 
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {topic.title}
          </h4>

          {topic.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {topic.description}
            </p>
          )}
        </div>

        {/* Right: Status Actions & Note Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          
          {/* Status Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => onStatusChange(topic.id, status === 'completed' ? 'not_started' : 'completed')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                status === 'completed'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10'
              }`}
              title="Mark as Completed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Done</span>
            </button>

            <button
              onClick={() => onStatusChange(topic.id, status === 'in_progress' ? 'not_started' : 'in_progress')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                status === 'in_progress'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-amber-600 hover:bg-amber-500/10'
              }`}
              title="Mark as Studying"
            >
              <Clock className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Studying</span>
            </button>

            <button
              onClick={() => onStatusChange(topic.id, status === 'review' ? 'not_started' : 'review')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                status === 'review'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-purple-600 hover:bg-purple-500/10'
              }`}
              title="Mark as Review Before Exam"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Review</span>
            </button>
          </div>

          {/* Revision Notes Button */}
          <button
            onClick={() => onOpenNotes(topic)}
            className={`p-2 rounded-xl border transition ${
              topic.notes
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="My Study Notes & Exam Tricks"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Resources Accordion Trigger */}
          {topic.resources && topic.resources.length > 0 && (
            <button
              onClick={() => setShowResources(!showResources)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition"
              title="View Study Resources"
            >
              {showResources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

        </div>

      </div>

      {/* Resources & Benchmark Details Accordion */}
      {showResources && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 animate-fade-in">
          {topic.global_benchmarks?.notes && (
            <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
              <span className="font-bold">Global Curriculum Link: </span>
              {topic.global_benchmarks.notes}
            </div>
          )}

          {topic.resources && topic.resources.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {topic.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition"
                >
                  {res.type === 'youtube' && <PlayCircle className="w-3.5 h-3.5 text-red-500" />}
                  {res.type === 'problem_set' && <Code2 className="w-3.5 h-3.5 text-amber-500" />}
                  {res.type === 'article' && <BookMarked className="w-3.5 h-3.5 text-emerald-500" />}
                  {res.type === 'documentation' && <FileText className="w-3.5 h-3.5 text-cyan-500" />}
                  <span className="font-medium">{res.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
