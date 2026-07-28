import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
};

function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-muted font-medium text-muted-foreground',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
      ) : (
        <span aria-hidden>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

export { Avatar };
