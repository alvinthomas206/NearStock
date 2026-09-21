import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showTagline = false }) => {
  const imgHeight = {
    sm: 32,
    md: 44,
    lg: 60,
  };

  const imgWidth = {
    sm: 120,
    md: 160,
    lg: 220,
  };

  return (
    <div className={cn('flex flex-col items-start', className)}>
      <Image
        src="/logo.png"
        alt="NearStock Logo"
        width={imgWidth[size]}
        height={imgHeight[size]}
        className="object-contain"
        priority
      />
      {showTagline && (
        <span className="text-[10px] font-medium text-brand-muted tracking-wider uppercase mt-1">
          Find it. Reserve it. Get it.
        </span>
      )}
    </div>
  );
};
