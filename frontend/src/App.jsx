import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

// Post-UTME Pages
import { PostUtme, EnglishCourse, MathematicsCourse, CurrentAffairsCourse, PostUtmeLeaderboard } from './pages/postutme';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />

              <Route path="/courses" element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } />

              <Route path="/courses/:courseId" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />

              <Route path="/quiz/:quizId" element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } />

              <Route path="/quiz/:quizId/result" element={
                <ProtectedRoute>
                  <QuizResult />
                </ProtectedRoute>
              } />

              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Post-UTME Routes */}
              <Route path="/post-utme" element={
                <ProtectedRoute>
                  <PostUtme />
                </ProtectedRoute>
              } />

              <Route path="/post-utme/english" element={
                <ProtectedRoute>
                  <EnglishCourse />
                </ProtectedRoute>
              } />

              <Route path="/post-utme/mathematics" element={
                <ProtectedRoute>
                  <MathematicsCourse />
                </ProtectedRoute>
              } />

              <Route path="/post-utme/current-affairs" element={
                <ProtectedRoute>
                  <CurrentAffairsCourse />
                </ProtectedRoute>
              } />

              <Route path="/post-utme/leaderboard" element={
                <ProtectedRoute>
                  <PostUtmeLeaderboard />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </div>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
