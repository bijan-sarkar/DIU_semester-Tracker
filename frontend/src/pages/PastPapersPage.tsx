import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Sparkles, 
  BookOpen,
  ArrowUpDown,
  Layers,
  RotateCcw
} from 'lucide-react';
import { api } from '../api/client';
import { PastQuestionPaper } from '../types';

interface PastPapersPageProps {
  onSelectCourse?: (courseId: string) => void;
}

export const PastPapersPage: React.FC<PastPapersPageProps> = ({ onSelectCourse }) => {
  const [papers, setPapers] = useState<PastQuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('all');

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setIsLoading(true);
    try {
      // Fetch up to 300 question papers
      const res = await api.get<PastQuestionPaper[]>('/papers?limit=300');
      setPapers(res.data || []);
    } catch (err) {
      console.error('Failed to load past papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique filter options
  const uniqueSemesters = useMemo(() => {
    const sems = new Set<string>();
    papers.forEach(p => {
      if (p.semester_name) sems.add(p.semester_name);
    });
    return Array.from(sems).sort();
  }, [papers]);

  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    papers.forEach(p => {
      if (p.course_code) {
        map.set(p.course_code, p.course_title || p.course_code);
      }
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [papers]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCode = p.course_code?.toLowerCase().includes(q) ?? false;
        const matchesCourseTitle = p.course_title?.toLowerCase().includes(q) ?? false;
        const matchesSemester = p.semester_name?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesCode && !matchesCourseTitle && !matchesSemester) {
          return false;
        }
      }

      // Exam type
      if (selectedExamType !== 'all') {
        if (!p.exam_type?.toLowerCase().includes(selectedExamType.toLowerCase())) {
          return false;
        }
      }

      // Semester
      if (selectedSemester !== 'all') {
        if (p.semester_name !== selectedSemester) {
          return false;
        }
      }

      // Course code
      if (selectedCourseCode !== 'all') {
        if (p.course_code !== selectedCourseCode) {
          return false;
        }
      }

      return true;
    });
  }, [papers, searchQuery, selectedExamType, selectedSemester, selectedCourseCode]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedExamType('all');
    setSelectedSemester('all');
    setSelectedCourseCode('all');
  };

  const getExamTypeBadge = (type?: string) => {
    const t = (type || 'Exam').toLowerCase();
    if (t.includes('final')) {
      return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    }
    if (t.includes('mid')) {
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (t.includes('quiz')) {
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>DIUQBank Official Past Question Repository</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Past Exam Questions & <span className="text-gradient">Direct PDFs</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Direct Cloudflare R2 watermarked PDF downloads archive from DIUQBank. Search across all semesters, midterms, finals, and quizzes for Daffodil International University CSE courses.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{papers.length} Indexed Papers</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Direct R2 Cloudflare PDF Links</span>
            </div>
            <span>•</span>
            <a 
              href="https://diuqbank.com/questions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-500 hover:underline inline-flex items-center gap-1"
            >
              <span>Visit DIUQBank Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filtering Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        
        {/* Search Bar & Reset */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper by course name, code (e.g. CSE-123), semester, or title..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {(searchQuery || selectedExamType !== 'all' || selectedSemester !== 'all' || selectedCourseCode !== 'all') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
          
          {/* Exam Type Tabs */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              Exam Stage
            </label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'midterm', 'final', 'quiz'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedExamType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                    selectedExamType === type
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Semesters ({uniqueSemesters.length})</option>
              {uniqueSemesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Course Dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              Course
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Courses ({uniqueCourses.length})</option>
              {uniqueCourses.map(([code, title]) => (
                <option key={code} value={code}>
                  {code} - {title.length > 28 ? title.slice(0, 28) + '...' : title}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{filteredPapers.length}</strong> question papers
        </span>
        <span className="text-[11px] text-slate-400">
          Click "Download PDF" to open directly from Cloudflare R2
        </span>
      </div>

      {/* Question Papers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 6, 7].map(n => (
            <div key={n} className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No question papers found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the semester/exam stage filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {paper.course_code && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        {paper.course_code}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getExamTypeBadge(paper.exam_type)}`}>
                      {paper.exam_type || 'Exam'}
                    </span>
                  </div>

                  {paper.semester_name && (
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{paper.semester_name}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-cyan-500 transition">
                  {paper.title}
                </h3>

                {paper.course_title && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {paper.course_title}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  {paper.view_count ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>{paper.view_count}</span>
                    </>
                  ) : null}
                  {onSelectCourse && paper.course_id && (
                    <button
                      onClick={() => onSelectCourse(paper.course_id)}
                      className="ml-1 text-[10px] font-semibold text-emerald-500 hover:underline inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>Course Syllabus</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {paper.pdf_url ? (
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold shadow-sm hover:brightness-105 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <a
                      href={`https://diuqbank.com/questions/${paper.diuqb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      <span>DIUQBank</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {paper.diuqb_id && paper.pdf_url && (
                    <a
                      href={`https://diuqbank.com/questions/${paper.diuqb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="View original submission on DIUQBank"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
