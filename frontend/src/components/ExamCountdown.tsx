import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, ChevronDown, Flame, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

export const ExamCountdown: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'Midterm' | 'Final'>('Midterm');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Targets relative to semester start (Midterm ~4 weeks, Final ~10 weeks)
  const [timers, setTimers] = useState({
    Midterm: { days: 28, hours: 14, minutes: 32 },
    Final: { days: 68, hours: 18, minutes: 45 },
  });

  useEffect(() => {
    const now = new Date();
    const midtermTarget = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000);
    const finalTarget = new Date(now.getTime() + 68 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000);

    const updateTimer = () => {
      const current = new Date();
      
      const diffMid = midtermTarget.getTime() - current.getTime();
      const midDays = Math.max(0, Math.floor(diffMid / (1000 * 60 * 60 * 24)));
      const midHours = Math.max(0, Math.floor((diffMid / (1000 * 60 * 60)) % 24));
      const midMins = Math.max(0, Math.floor((diffMid / 1000 / 60) % 60));

      const diffFin = finalTarget.getTime() - current.getTime();
      const finDays = Math.max(0, Math.floor(diffFin / (1000 * 60 * 60 * 24)));
      const finHours = Math.max(0, Math.floor((diffFin / (1000 * 60 * 60)) % 24));
      const finMins = Math.max(0, Math.floor((diffFin / 1000 / 60) % 60));

      setTimers({
        Midterm: { days: midDays, hours: midHours, minutes: midMins },
        Final: { days: finDays, hours: finHours, minutes: finMins },
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentTimer = timers[activeStage];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-sm transition-all shadow-sm group"
        title="Click to view DIU Exam Sprints & Schedule"
      >
        <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
        <span>DIU {activeStage} in:</span>
        <span className="font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-bold group-hover:bg-emerald-500/30 transition-colors">
          {currentTimer.days}d {currentTimer.hours}h
        </span>
        <ChevronDown className={`w-3 h-3 text-emerald-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Interactive Exam Sprint Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                DIU Academic Exam Sprints
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-medium">
              DIU Calendar
            </span>
          </div>

          {/* Switch Stage Tabs */}
          <div className="grid grid-cols-2 gap-2 my-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveStage('Midterm')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeStage === 'Midterm'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Midterm Exam
            </button>
            <button
              onClick={() => setActiveStage('Final')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeStage === 'Final'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-cyan-500" />
              Final Exam
            </button>
          </div>

          {/* Countdown Clock Display */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 via-slate-500/5 to-cyan-500/10 border border-emerald-500/20 text-center mb-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
              Time remaining until {activeStage} Examination
            </p>
            <div className="flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              <div className="flex flex-col items-center bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-[50px]">
                <span>{currentTimer.days}</span>
                <span className="text-[9px] font-sans font-semibold text-slate-400 uppercase">Days</span>
              </div>
              <span className="text-emerald-500">:</span>
              <div className="flex flex-col items-center bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-[50px]">
                <span>{String(currentTimer.hours).padStart(2, '0')}</span>
                <span className="text-[9px] font-sans font-semibold text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-emerald-500">:</span>
              <div className="flex flex-col items-center bg-white/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 min-w-[50px]">
                <span>{String(currentTimer.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] font-sans font-semibold text-slate-400 uppercase">Mins</span>
              </div>
            </div>
          </div>

          {/* Quick DIU Exam Preparation Tip */}
          <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Midterm Focus:</strong> Target top 5 high-probability topics (85%+ probability score) to secure maximum marks.
              </span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40">
              <BookOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
              <span>
                <strong>DIUQBank Insight:</strong> Solve at least 3 recent question papers from the Past Papers section before sitting the exam.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
