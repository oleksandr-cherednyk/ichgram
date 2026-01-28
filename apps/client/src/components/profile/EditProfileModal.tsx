import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { UserProfile } from '../../types/user';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const editProfileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(160, 'Bio must be 160 characters or less'),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

type EditProfileModalProps = {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: EditProfileValues) => void;
  isSaving?: boolean;
};

export const EditProfileModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditProfileModalProps) => {
  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      bio: user.bio ?? '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      fullName: user.fullName,
      bio: user.bio ?? '',
    });
  }, [user, form]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input
              id="fullName"
              {...form.register('fullName')}
              placeholder="Your name"
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Write something about yourself..."
              rows={3}
            />
            <div className="flex justify-between text-xs text-zinc-400">
              {form.formState.errors.bio ? (
                <p className="text-red-500">
                  {form.formState.errors.bio.message}
                </p>
              ) : (
                <span />
              )}
              <span>{form.watch('bio')?.length ?? 0}/160</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
