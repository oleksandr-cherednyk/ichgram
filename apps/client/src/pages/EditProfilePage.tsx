import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { LoadingScreen } from '../components/common';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { UserAvatar } from '../components/ui/user-avatar';
import { useProfile, useUpdateAvatar, useUpdateProfile } from '../hooks';

const editProfileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  website: z.string().max(200).optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less'),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: {
      fullName: user?.fullName ?? '',
      website: user?.website ?? '',
      bio: user?.bio ?? '',
    },
  });

  const handleSubmit = async (values: EditProfileValues) => {
    await updateProfile.mutateAsync(values);
    navigate('/me');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-xl font-semibold">Edit profile</h1>

      <div className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4">
          <div className="flex items-center gap-4">
            <UserAvatar src={user.avatarUrl} alt={user.username} size="xl" />
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-zinc-500">{user.fullName}</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            className="h-8 px-8"
            onClick={handleAvatarClick}
            disabled={updateAvatar.isPending}
          >
            {updateAvatar.isPending ? 'Uploading...' : 'New photo'}
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-bold text-[#262626]">
              Username
            </Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="font-bold text-[#262626]">
              Website
            </Label>
            <Input
              id="website"
              {...form.register('website')}
              placeholder="https://example.com"
            />
            {form.formState.errors.website && (
              <p className="text-xs text-red-500">
                {form.formState.errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-bold text-[#262626]">
              About
            </Label>
            <div className="relative">
              <Textarea
                id="bio"
                {...form.register('bio')}
                placeholder="Write something about yourself..."
                rows={4}
              />
              <span className="absolute bottom-2 right-3 text-xs text-zinc-400">
                {form.watch('bio')?.length ?? 0}/160
              </span>
            </div>
            {form.formState.errors.bio && (
              <p className="text-xs text-red-500">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex">
            <Button
              type="submit"
              className="h-8 w-full max-w-[268px]"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
