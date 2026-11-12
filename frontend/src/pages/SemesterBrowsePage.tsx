import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Layers, Sparkles, Filter, Check } from 'lucide-react';

const SEMESTERS = [
  'Level 1 Term 1', 'Level 1 Term 2', 'Level 1 Term 3',
  'Level 2 Term 1', 'Level 2 Term 2', 'Level 2 Term 3',
  'Level 3 Term 1', 'Level 3 Term 2', 'Level 3 Term 3',
  'Level 4 Term 1', 'Level 4 Term 2', 'Level 4 Term 3',
];

interface SemesterBrowsePageProps {
  onSelectCourse: (courseId: string) => void;
  onOpenAuth: () => void;
}

export const SemesterBrowsePage: React.FC<SemesterBrowsePageProps> = ({
  onSelectCourse,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>(
    user?.current_semester || 'Level 2 Term 1'
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Course[]>(`/courses?semester_level=${encodeURIComponent(selectedSemester)}`);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load semester courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedSemester, user]);

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
      fetchCourses();
    } catch (err) {
      console.error('Failed to toggle enrollment', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Complete 12-Semester DIU CSE Framework</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Explore DIU CSE Curriculum by Term
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select any academic term to view syllabus topics and add courses to your personal study dashboard.
        </p>
      </div>

      {/* Semester Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {SEMESTERS.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`p-3 rounded-2xl text-xs font-bold transition text-left flex flex-col justify-between h-20 border ${
              selectedSemester === sem
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-emerald border-transparent'
                : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">
              {sem.includes('Level 1') ? 'Year 1' : sem.includes('Level 2') ? 'Year 2' : sem.includes('Level 3') ? 'Year 3' : 'Year 4'}
            </span>
            <span className="font-extrabold text-sm">{sem.replace('Level ', 'L').replace(' Term ', 'T')}</span>
          </button>
        ))}
      </div>

      {/* Courses in selected semester */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Courses in {selectedSemester}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {courses.length} courses
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-500">
            No courses found for this term.
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

    </div>
  );
};
