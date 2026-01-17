import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-11 w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-100 shadow-sm outline-none ring-offset-2 transition focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-500/40',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
