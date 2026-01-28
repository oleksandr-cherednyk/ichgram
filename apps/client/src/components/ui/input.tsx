import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-12 w-full rounded border border-[#DBDBDB] bg-[#fafafa] px-3 text-sm text-[#737373] outline-none ring-offset-2 transition focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-500/30',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
