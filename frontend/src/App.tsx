import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { SemesterBrowsePage } from './pages/SemesterBrowsePage';
import { HighYieldPage } from './pages/HighYieldPage';
import { GlobalRoadmapPage } from './pages/GlobalRoadmapPage';
import { PastPapersPage } from './pages/PastPapersPage';
import { GraduationCap, ShieldCheck, Globe } from 'lucide-react';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'browse' | 'high-yield' | 'global-roadmap' | 'past-papers'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleBackToDashboard = () => {
    setSelectedCourseId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedCourseId(null);
          setCurrentTab(tab);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {selectedCourseId ? (
          <CourseDetailPage
            courseId={selectedCourseId}
            onBack={handleBackToDashboard}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardPage
            onSelectCourse={handleSelectCourse}
            onNavigateBrowse={() => setCurrentTab('browse')}
            onNavigateHighYield={() => setCurrentTab('high-yield')}
            onNavigateGlobal={() => setCurrentTab('global-roadmap')}
            onNavigatePapers={() => setCurrentTab('past-papers')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : currentTab === 'browse' ? (
          <SemesterBrowsePage
            onSelectCourse={handleSelectCourse}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : currentTab === 'high-yield' ? (
          <HighYieldPage onSelectCourse={handleSelectCourse} />
        ) : currentTab === 'global-roadmap' ? (
          <GlobalRoadmapPage />
        ) : (
          <PastPapersPage onSelectCourse={handleSelectCourse} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 glass-card py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Daffodil International University (DIU) CSE Semester & Exam Tracker
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              PWA Offline Ready
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              MIT & Harvard Global Standards
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
