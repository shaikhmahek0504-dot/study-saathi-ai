import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SuspenseFallback from './components/SuspenseFallback';

// Lazy load pages for code splitting and better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Planner = lazy(() => import('./pages/Planner'));
const AICareerMentor = lazy(() => import('./pages/AICareerMentor'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotesSummarizer = lazy(() => import('./pages/NotesSummarizer'));
const QuizGenerator = lazy(() => import('./pages/QuizGenerator'));
const ExamAssistant = lazy(() => import('./pages/ExamAssistant'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Rewards = lazy(() => import('./pages/Rewards'));
const CareerAchievements = lazy(() => import('./pages/CareerAchievements'));
const CareerDashboard = lazy(() => import('./pages/CareerDashboard'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const CareerRoadmap = lazy(() => import('./pages/CareerRoadmap'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SkillGapAnalyzer = lazy(() => import('./pages/SkillGapAnalyzer'));
const InternshipRecommendations = lazy(() => import('./pages/InternshipRecommendations'));
const InterviewCoach = lazy(() => import('./pages/InterviewCoach'));
const LinkedinOptimizer = lazy(() => import('./pages/LinkedinOptimizer'));
const ProjectGenerator = lazy(() => import('./pages/ProjectGenerator'));
const CareerCopilot = lazy(() => import('./pages/CareerCopilot'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  useEffect(() => {
    // Check local storage or system preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="planner" element={<Planner />} />
                  <Route path="mentor" element={<AICareerMentor />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="summarizer" element={<NotesSummarizer />} />
                  <Route path="quiz" element={<QuizGenerator />} />
                  <Route path="exam-assistant" element={<ExamAssistant />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="rewards" element={<Rewards />} />
                  <Route path="achievements" element={<CareerAchievements />} />
                  <Route path="career" element={<CareerDashboard />} />
                  <Route path="roadmap" element={<CareerRoadmap />} />
                  <Route path="skills-gap" element={<SkillGapAnalyzer />} />
                  <Route path="internships" element={<InternshipRecommendations />} />
                  <Route path="interview" element={<InterviewCoach />} />
                  <Route path="linkedin" element={<LinkedinOptimizer />} />
                  <Route path="project-generator" element={<ProjectGenerator />} />
                  <Route path="resume" element={<ResumeBuilder />} />
                  <Route path="career-copilot" element={<CareerCopilot />} />
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>
              </Route>
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
