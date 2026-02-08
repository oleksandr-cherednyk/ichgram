import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { LoadingScreen } from '../components/common';
import { AvatarUpload } from '../components/profile/AvatarUpload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useDeleteAccount, useProfile, useUpdateProfile } from '../hooks';

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(80),
  website: z.string().max(200).optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less'),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-xl font-semibold">Edit profile</h1>

      <div className="space-y-6">
        {/* Avatar section */}
        <AvatarUpload user={user} />

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

        {/* Delete account */}
        <div className="border-t border-zinc-200 pt-6">
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete account
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your account, posts, comments, likes, and conversations will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccount.mutate()}
              disabled={deleteAccount.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
