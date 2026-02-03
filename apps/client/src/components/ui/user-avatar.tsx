import { User } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
  '2xl': 'h-20 w-20',
} as const;

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-6 w-6',
  '2xl': 'h-10 w-10',
} as const;

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export const UserAvatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
}: UserAvatarProps) => {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className="bg-zinc-100">
        <User className={cn('text-zinc-400', iconSizes[size])} />
      </AvatarFallback>
    </Avatar>
  );
};
