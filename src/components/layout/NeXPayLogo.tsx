'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NeXPayLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const imageSizes = {
  sm: 24,
  md: 28,
  lg: 36,
  xl: 80,
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

export function NeXPayLogo({ size = 'md', showText = true, className = '' }: NeXPayLogoProps) {
  const imgSize = imageSizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="NeXPay"
        width={imgSize}
        height={imgSize}
        className="rounded shrink-0"
      />
      {showText && (
        <span className={`${textSizes[size]} font-extrabold tracking-tight select-none`}>
          <span className="text-white">Ne</span>
          <span className="text-neon-green">X</span>
          <span className="text-white">Pay</span>
        </span>
      )}
    </Link>
  );
}

export default NeXPayLogo;
