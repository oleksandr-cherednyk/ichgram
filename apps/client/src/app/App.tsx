import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '../components/auth';
import { AppShell } from '../layouts/AppShell';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPage } from '../pages/auth/ResetPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { ExplorePage } from '../pages/ExplorePage';
import { FeedPage } from '../pages/FeedPage';
import { MessagesPage } from '../pages/MessagesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PostPage } from '../pages/PostPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TagPage } from '../pages/TagPage';

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
        <Route path="/" element={<FeedPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/tags/:tag?" element={<TagPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/me/edit" element={<EditProfilePage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
