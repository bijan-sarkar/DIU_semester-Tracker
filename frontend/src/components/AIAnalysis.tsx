import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Brain, Target, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { analysisApi, CourseAnalysisResponse } from '../api/analysis';

interface AIAnalysisProps {
  courseId: string;
}

export function AIAnalysis({ courseId }: AIAnalysisProps) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['courseAnalysis', courseId],
    queryFn: () => analysisApi.getCourseAnalysis(courseId).then(res => res.data),
    retry: false,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const generateMutation = useMutation({
    mutationFn: () => analysisApi.generateCourseAnalysis(courseId).then(res => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['courseAnalysis', courseId], data);
      setIsGenerating(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to generate AI analysis. Please try again.');
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setError(null);
    generateMutation.mutate();
  };

  if (isLoading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#1C1C1E] rounded-xl border border-[#2C2C2E]">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Loading AI Insights...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#1C1C1E] rounded-xl border border-[#2C2C2E] text-center">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
          <Brain className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
        <p className="text-gray-400 max-w-md mb-8">
          Unlock personalized study insights powered by Gemini AI. We'll analyze past question papers to find high-probability topics and global industry standards.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing Papers...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Insights
            </>
          )}
        </button>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI Course Insights
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Generated using Gemini 2.5 Flash on {new Date(analysis.generated_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Important Topics */}
        <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.05)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">High-Yield Topics</h3>
          </div>
          <div className="space-y-4">
            {analysis.important_topics.map((topic, idx) => (
              <div key={idx} className="p-4 bg-[#2C2C2E]/50 rounded-xl border border-[#3C3C3E]/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-200">{topic.topic}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400">
                    {topic.probability}% Probability
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{topic.reason}</p>
              </div>
            ))}
            {analysis.important_topics.length === 0 && (
              <p className="text-gray-500 text-sm italic">No important topics extracted.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Extra Topics for Max Marks */}
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2C2C2E]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Topper's Edge</h3>
            </div>
            <div className="space-y-4">
              {analysis.extra_topics.map((topic, idx) => (
                <div key={idx} className="p-4 bg-[#2C2C2E]/30 rounded-xl border border-[#3C3C3E]/30">
                  <h4 className="font-medium text-gray-200 mb-1">{topic.topic}</h4>
                  <p className="text-sm text-gray-400">{topic.reason}</p>
                </div>
              ))}
              {analysis.extra_topics.length === 0 && (
                <p className="text-gray-500 text-sm italic">No extra topics suggested.</p>
              )}
            </div>
          </div>

          {/* Global Standard Topics */}
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Global Industry Standards</h3>
            </div>
            <div className="space-y-4">
              {analysis.global_standard_topics.map((topic, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-[#2C2C2E]/50 to-[#2C2C2E]/10 rounded-xl border border-[#3C3C3E]/50">
                  <h4 className="font-medium text-blue-300 mb-1">{topic.topic}</h4>
                  <p className="text-sm text-gray-400">{topic.industry_relevance}</p>
                </div>
              ))}
              {analysis.global_standard_topics.length === 0 && (
                <p className="text-gray-500 text-sm italic">No global standard topics suggested.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
