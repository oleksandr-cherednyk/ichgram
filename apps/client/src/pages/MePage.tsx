import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingScreen } from '../components/common';
import {
  EditProfileModal,
  ProfileGrid,
  ProfileHeader,
} from '../components/profile';
import { useProfile, useUpdateProfile, useUserPosts } from '../hooks';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export const MePage = () => {
  const navigate = useNavigate();
  const { clear } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: user, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(user?.username ?? '');

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];

  const handleLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    clear();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (values: {
    fullName: string;
    bio: string;
  }) => {
    await updateProfile.mutateAsync(values);
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Failed to load profile</p>
        <button
          onClick={handleLogout}
          className="text-sm text-[#0095F6] hover:underline"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileHeader
        user={user}
        isOwnProfile={true}
        onEditProfile={handleEditProfile}
      />

      {/* Divider */}
      <div className="border-t border-[#DBDBDB]" />

      {/* Posts Grid */}
      <section className="py-4">
        <ProfileGrid
          posts={posts}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      </section>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        isSaving={updateProfile.isPending}
      />
    </div>
  );
};
