import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CourseDetail, CourseReadinessAnalytics, Topic, PastQuestionPaper } from '../types';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { TopicItem } from '../components/TopicItem';
import { TopicNotesModal } from '../components/TopicNotesModal';
import { AIAnalysis } from '../components/AIAnalysis';
import { 
  ArrowLeft, 
  Search, 
  Flame, 
  Globe,
  FileText,
  Download,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
  onOpenAuth: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  courseId,
  onBack,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [analytics, setAnalytics] = useState<CourseReadinessAnalytics | null>(null);
  const [papers, setPapers] = useState<PastQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stageFilter, setStageFilter] = useState<'all' | 'midterm' | 'final'>('all');
  const [highYieldOnly, setHighYieldOnly] = useState(false);
  const [industryOnly, setIndustryOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notes Modal state
  const [activeNotesTopic, setActiveNotesTopic] = useState<Topic | null>(null);

  const fetchCourseData = async () => {
    try {
      const [cRes, aRes, pRes] = await Promise.all([
        api.get<CourseDetail>(`/courses/${courseId}`),
        user ? api.get<CourseReadinessAnalytics>(`/analytics/course/${courseId}`) : Promise.resolve({ data: null }),
        api.get<PastQuestionPaper[]>(`/papers/course/${courseId}`),
      ]);
      setCourse(cRes.data);
      if (aRes.data) {
        setAnalytics(aRes.data);
      }
      setPapers(pRes.data);
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user]);

  const handleStatusChange = async (
    topicId: string,
    status: 'completed' | 'in_progress' | 'review' | 'not_started'
  ) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (course) {
      const updatedTopics = course.topics.map((t) =>
        t.id === topicId ? { ...t, status } : t
      );
      setCourse({ ...course, topics: updatedTopics });
    }

    try {
      await api.post('/tracker/progress', { topic_id: topicId, status });
      const aRes = await api.get<CourseReadinessAnalytics>(`/analytics/course/${courseId}`);
      setAnalytics(aRes.data);
    } catch (err) {
      console.error('Failed to update progress', err);
      fetchCourseData();
    }
  };

  const handleSaveNotes = async (topicId: string, notes: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      const currentTopic = course?.topics.find((t) => t.id === topicId);
      const status = currentTopic?.status || 'not_started';
      await api.post('/tracker/progress', { topic_id: topicId, status, notes });

      if (course) {
        const updatedTopics = course.topics.map((t) =>
          t.id === topicId ? { ...t, notes } : t
        );
        setCourse({ ...course, topics: updatedTopics });
      }
    } catch (err) {
      console.error('Failed to save study notes', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Course not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Filtered Topics
  const filteredTopics = course.topics.filter((t) => {
    if (stageFilter === 'midterm' && t.exam_stage !== 'midterm' && t.exam_stage !== 'both') return false;
    if (stageFilter === 'final' && t.exam_stage !== 'final' && t.exam_stage !== 'both') return false;
    if (highYieldOnly && t.probability_score < 85) return false;
    if (industryOnly && !t.is_industry_essential) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {course.code}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {course.semester_level}
          </span>
        </div>
      </div>

      {/* Course Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                DIU CSE Official Syllabus
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500">{course.credits} Credits Theory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Organized by Midterm and Final exam stages, with DIU recurrent questions, past papers, and MIT/Stanford links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
              <span className="block text-xl font-black font-mono text-emerald-500">
                {course.topics.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Syllabus Topics
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
              <span className="block text-xl font-black font-mono text-cyan-500">
                {papers.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Past Papers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Analytics Gauge */}
      {analytics ? (
        <ReadinessGauge analytics={analytics} />
      ) : (
        <div className="glass-card rounded-2xl p-4 text-center border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs text-slate-500">
            Log in to calculate your dynamic Midterm & Final Exam preparedness score.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-2 text-xs font-bold text-emerald-500 hover:underline"
          >
            Sign In or Explore as Demo Student
          </button>
        </div>
      )}

      {/* Topic Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Stage Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                stageFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Topics ({course.topics.length})
            </button>
            <button
              onClick={() => setStageFilter('midterm')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                stageFilter === 'midterm'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Midterm Syllabus
            </button>
            <button
              onClick={() => setStageFilter('final')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                stageFilter === 'final'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Final Syllabus
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* Quick Tag Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => setHighYieldOnly(!highYieldOnly)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
              highYieldOnly
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Top Exam Questions Only (&ge; 85%)</span>
          </button>

          <button
            onClick={() => setIndustryOnly(!industryOnly)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
              industryOnly
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-500" />
            <span>MIT / Harvard / Global Depth</span>
          </button>
        </div>

      </div>

      {/* Topic Checklist Items */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              No topics match the selected filters or search keyword.
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onStatusChange={handleStatusChange}
              onOpenNotes={setActiveNotesTopic}
            />
          ))
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="mt-8">
        <AIAnalysis courseId={courseId} />
      </div>

      {/* Official DIUQBank Past Question Papers Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official DIUQBank Past Question Papers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Cloudflare R2 watermarked PDF downloads archive from DIUQBank
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {papers.length} Papers Available
          </span>
        </div>

        {papers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
            Past question papers are being indexed from DIUQBank for this course.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {papers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 hover:border-cyan-500/50 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                      {p.semester_name || 'DIU Exam'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {p.exam_type || 'Exam'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.title}
                  </h4>
                </div>

                {p.pdf_url ? (
                  <a
                    href={p.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-bold shadow-sm hover:bg-cyan-600 transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open PDF</span>
                  </a>
                ) : (
                  <a
                    href={`https://diuqbank.com/questions/${p.diuqb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 transition shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Notes Modal */}
      <TopicNotesModal
        topic={activeNotesTopic}
        isOpen={activeNotesTopic !== null}
        onClose={() => setActiveNotesTopic(null)}
        onSaveNotes={handleSaveNotes}
      />

    </div>
  );
};
