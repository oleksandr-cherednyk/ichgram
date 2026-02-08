import { Camera } from 'lucide-react';
import { useRef } from 'react';

import { useUpdateAvatar } from '../../hooks';
import type { UserProfile } from '../../types/user';
import { Button } from '../ui/button';
import { UserAvatar } from '../ui/user-avatar';

type AvatarUploadProps = {
  user: UserProfile;
};

export const AvatarUpload = ({ user }: AvatarUploadProps) => {
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar.mutate(file);
    }
    e.target.value = '';
  };

  return (
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
        className="h-8 px-3 sm:px-8"
        onClick={handleAvatarClick}
        disabled={updateAvatar.isPending}
      >
        <Camera className="size-4 sm:hidden" />
        <span className="hidden sm:inline">
          {updateAvatar.isPending ? 'Uploading...' : 'New photo'}
        </span>
      </Button>
    </div>
  );
};
