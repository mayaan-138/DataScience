import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, mockAuth } from './utils/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/student/Dashboard';
import Topics from './pages/student/Topics';
import VideoLectures from './pages/student/VideoLectures';
import Simulators from './pages/student/Simulators';
import ProjectLab from './pages/student/ProjectLab';
import Certificates from './pages/student/Certificates';
import Leaderboard from './pages/student/Leaderboard';
import AIMentor from './pages/student/AIMentor';
import ResumeBuilder from './pages/student/ResumeBuilder';
import ResumeEditor from './pages/student/ResumeEditor';
import InterviewDashboard from './pages/student/InterviewDashboard';
import MockInterview from './pages/student/MockInterview';
import QuestionBank from './pages/student/QuestionBank';
import BehavioralPractice from './pages/student/BehavioralPractice';
import PerformanceReports from './pages/student/PerformanceReports';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLectures from './pages/admin/AdminLectures';
import AdminStudents from './pages/admin/AdminStudents';
import AdminProjects from './pages/admin/AdminProjects';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : (mockAuth.isAdmin(user) ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)} />
        <Route path="/login" element={!user ? <Login /> : (mockAuth.isAdmin(user) ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {user && mockAuth.isAdmin(user) ? (
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="lectures" element={<AdminLectures />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="projects" element={<AdminProjects />} />
          </Route>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/admin/login" />} />
        )}

        {user ? (
          <Route path="/*" element={<StudentLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="topics" element={<Topics />} />
            <Route path="lectures" element={<VideoLectures />} />
            <Route path="simulators" element={<Simulators />} />
            <Route path="projects" element={<ProjectLab />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="ai-mentor" element={<AIMentor />} />
            <Route path="resume" element={<ResumeBuilder />} />
            <Route path="resume/editor" element={<ResumeEditor />} />
            <Route path="interview" element={<InterviewDashboard />} />
            <Route path="interview/mock" element={<MockInterview />} />
            <Route path="interview/questions" element={<QuestionBank />} />
            <Route path="interview/behavioral" element={<BehavioralPractice />} />
            <Route path="interview/performance" element={<PerformanceReports />} />
            <Route path="" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
