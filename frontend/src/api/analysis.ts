import { api } from './client';

export interface TopicInsight {
  topic: string;
  probability: number;
  reason: string;
}

export interface ExtraTopicInsight {
  topic: string;
  reason: string;
}

export interface GlobalStandardTopic {
  topic: string;
  industry_relevance: string;
}

export interface CourseAnalysisResponse {
  course_id: string;
  important_topics: TopicInsight[];
  extra_topics: ExtraTopicInsight[];
  global_standard_topics: GlobalStandardTopic[];
  generated_at: string;
}

export const analysisApi = {
  getCourseAnalysis: (courseId: string) =>
    api.get<CourseAnalysisResponse>(`/analysis/course/${courseId}`),
    
  generateCourseAnalysis: (courseId: string) =>
    api.post<CourseAnalysisResponse>(`/analysis/course/${courseId}`),
};
