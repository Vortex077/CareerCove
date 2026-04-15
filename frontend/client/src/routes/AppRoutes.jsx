import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Placeholder pages — will be replaced with actual page components
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/register" element={<Placeholder title="Register" />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<Placeholder title="Student Dashboard" />} />
        <Route path="/student/jobs" element={<Placeholder title="Browse Jobs" />} />
        <Route path="/student/applications" element={<Placeholder title="My Applications" />} />
        <Route path="/student/profile" element={<Placeholder title="My Profile" />} />

        {/* Admin / Staff */}
        <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
        <Route path="/admin/jobs" element={<Placeholder title="Manage Jobs" />} />
        <Route path="/admin/students" element={<Placeholder title="Manage Students" />} />
        <Route path="/admin/companies" element={<Placeholder title="Manage Companies" />} />
        <Route path="/admin/reports" element={<Placeholder title="Reports" />} />

        {/* Common */}
        <Route path="/unauthorized" element={<Placeholder title="403 — Unauthorized" />} />
        <Route path="*" element={<Placeholder title="404 — Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
