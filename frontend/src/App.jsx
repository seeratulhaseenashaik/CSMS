import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import ResultsPage from './pages/ResultsPage';
import ProgressionPage from './pages/ProgressionPage';
import QaPage from './pages/QaPage';
import QaDetailPage from './pages/QaDetailPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import MyClubsPage from './pages/MyClubsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import { AdminUsers, AdminPromotionRules, AdminAnnouncements } from './pages/AdminPages';
import { FacultyRecordAttendance, FacultyEnterMarks } from './pages/FacultyPages';

function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/progression" element={<ProgressionPage />} />
            <Route path="/qa" element={<QaPage />} />
            <Route path="/qa/:questionId" element={<QaDetailPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
            <Route path="/my-clubs" element={<MyClubsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/promotion-rules" element={<AdminPromotionRules />} />
              <Route path="/admin/subjects" element={<AdminUsers />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty', 'administrator']} />}>
              <Route path="/faculty/attendance" element={<FacultyRecordAttendance />} />
              <Route path="/faculty/marks" element={<FacultyEnterMarks />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<Layout />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
