import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../components/auth';
import { PlaceholderPage } from '../components/common';
import { AppShell } from '../layouts/AppShell';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPage } from '../pages/auth/ResetPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { MePage } from '../pages/MePage';
import { ProfilePage } from '../pages/ProfilePage';

export const App = () => (
  <Routes>
    {/* Auth routes (no sidebar) */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset" element={<ResetPage />} />
    </Route>

    {/* Protected app routes (with sidebar) */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/" element={<PlaceholderPage title="Home Feed" />} />
        <Route path="/explore" element={<PlaceholderPage title="Explore" />} />
        <Route path="/search" element={<PlaceholderPage title="Search" />} />
        <Route
          path="/messages"
          element={<PlaceholderPage title="Messages" />}
        />
        <Route
          path="/notifications"
          element={<PlaceholderPage title="Notifications" />}
        />
        <Route
          path="/create"
          element={<PlaceholderPage title="Create Post" />}
        />
        <Route path="/me" element={<MePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
