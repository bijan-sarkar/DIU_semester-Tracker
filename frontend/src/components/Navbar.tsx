import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  Flame, 
  BookOpen,
  ChevronDown,
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExamCountdown } from './ExamCountdown';

const ALL_SEMESTERS = [
  'Level 1 Term 1', 'Level 1 Term 2', 'Level 1 Term 3',
  'Level 2 Term 1', 'Level 2 Term 2', 'Level 2 Term 3',
  'Level 3 Term 1', 'Level 3 Term 2', 'Level 3 Term 3',
  'Level 4 Term 1', 'Level 4 Term 2', 'Level 4 Term 3',
];

interface NavbarProps {
  currentTab: 'dashboard' | 'browse' | 'high-yield' | 'global-roadmap' | 'past-papers';
  setCurrentTab: (tab: 'dashboard' | 'browse' | 'high-yield' | 'global-roadmap' | 'past-papers') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout, updateSemester } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const activeSemester = user?.current_semester || 'Level 2 Term 1';

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow-emerald text-white font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  DIU <span className="text-gradient">Tracker</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Official CSE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Semester Roadmap & Exam Question Tracker
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              My Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('browse')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'browse'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              12 Semesters
            </button>
            <button
              onClick={() => setCurrentTab('high-yield')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'high-yield'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Top Exam Questions
            </button>
            <button
              onClick={() => setCurrentTab('global-roadmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'global-roadmap'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              Global Tech & MIT Track
            </button>
            <button
              onClick={() => setCurrentTab('past-papers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'past-papers'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-500" />
              DIUQBank Papers
            </button>
          </div>

          {/* Right Section: Countdown, Semester, Theme, User */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:block">
              <ExamCountdown />
            </div>

            {/* Semester Switcher Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsSemesterMenuOpen(!isSemesterMenuOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Switch Active Semester"
                >
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeSemester}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isSemesterMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto glass-card rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      DIU CSE Semesters
                    </div>
                    {ALL_SEMESTERS.map((sem) => (
                      <button
                        key={sem}
                        onClick={() => {
                          updateSemester(sem);
                          setIsSemesterMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${
                          activeSemester === sem
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Auth Profile / Demo Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {user.student_id || 'Student'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold shadow-glow-emerald hover:brightness-105 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login / Demo</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};
