import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/auth/Login';

import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotificationsPage from './pages/Notifications';
const NotFound = () => <div>404 Not Found</div>;

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import JobList from './pages/student/Jobs';
import JobDetail from './pages/student/JobDetail';
import MyApplications from './pages/student/MyApplications';

import AdminDashboard from './pages/admin/Dashboard';
import Companies from './pages/admin/Companies';
import ManageJobs from './pages/admin/Jobs';
import ManageApplications from './pages/admin/Applications';
import JobApplications from './pages/admin/JobApplications';
import AdminDrives from './pages/admin/Drives';
import AdminStudents from './pages/admin/Students';

// Placeholder HOD components for pending specs
import Reports from './pages/admin/Reports';

import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Authenticated Routes wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/jobs" element={<JobList />} />
              <Route path="/student/jobs/:id" element={<JobDetail />} />
              <Route path="/student/applications" element={<MyApplications />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/companies" element={<Companies />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/jobs" element={<ManageJobs />} />
              <Route path="/admin/drives" element={<AdminDrives />} />
              <Route path="/admin/applications" element={<ManageApplications />} />
              <Route path="/admin/applications/:jobId" element={<JobApplications />} />

              {/* HOD Routes */}
              <Route path="/reports" element={<Reports />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
