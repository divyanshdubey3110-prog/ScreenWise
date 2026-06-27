import React from 'react';

interface ScreenWiseLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'horizontal' | 'vertical';
  theme?: 'light' | 'dark' | 'white';
}

export default function ScreenWiseLogo({
  className = '',
  size = 'md',
  showText = true,
  variant = 'horizontal',
  theme = 'light'
}: ScreenWiseLogoProps) {
  // Size mapping
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-20 w-auto',
    xl: 'h-32 w-auto'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const subTextSizes = {
    xs: 'hidden',
    sm: 'hidden',
    md: 'text-[9px] tracking-wider',
    lg: 'text-xs tracking-widest',
    xl: 'text-base tracking-widest'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${variant === 'vertical' ? 'flex-col text-center' : 'flex-row text-left'} ${className}`}>
      {/* Icon Graphic */}
      <svg
        viewBox="0 0 160 160"
        className={`${sizeClasses[size]} shrink-0 drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" /> {/* Green-400 */}
            <stop offset="100%" stopColor="#16a34a" /> {/* Green-600 */}
          </linearGradient>
          
          <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" /> {/* Blue-600 */}
            <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo-600 */}
          </linearGradient>
          
          <linearGradient id="parentBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
            <stop offset="100%" stopColor="#1d4ed8" /> {/* Blue-700 */}
          </linearGradient>
          
          <linearGradient id="parentPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" /> {/* Purple-500 */}
            <stop offset="100%" stopColor="#6d28d9" /> {/* Purple-700 */}
          </linearGradient>
          
          <linearGradient id="childGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
            <stop offset="100%" stopColor="#0891b2" /> {/* Cyan-600 */}
          </linearGradient>

          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" /> {/* Amber-500 */}
            <stop offset="100%" stopColor="#ea580c" /> {/* Orange-600 */}
          </linearGradient>
        </defs>

        {/* 1. Leaves sprouting from the top notch of the phone */}
        <g id="leaves" transform="translate(0, 5)">
          {/* Left Leaf */}
          <path
            d="M 80 34 C 68 22 55 32 58 42 C 68 42 77 38 80 34 Z"
            fill="url(#leafGrad)"
          />
          {/* Right Leaf */}
          <path
            d="M 80 34 C 92 22 105 32 102 42 C 92 42 83 38 80 34 Z"
            fill="url(#leafGrad)"
          />
          {/* Stem/Base */}
          <path
            d="M 78 33 Q 80 38 80 43"
            stroke="#15803d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Smartphone Frame */}
        <rect
          x="36"
          y="42"
          width="88"
          height="88"
          rx="18"
          stroke="url(#phoneGrad)"
          strokeWidth="6"
          fill="#f8fafc" // soft slate bg inside phone
        />
        {/* Notch/Speaker detail at the top */}
        <rect
          x="68"
          y="42"
          width="24"
          height="5"
          rx="2.5"
          fill="url(#phoneGrad)"
        />

        {/* 3. Celestial Icons inside screen (Sun and Moon) */}
        {/* Crescent Moon + Mini Stars (Left side) */}
        <g id="night-theme" transform="translate(48, 56)">
          <path
            d="M 12 0 A 7 7 0 0 1 2 10 A 6 6 0 1 0 12 0 Z"
            fill="#3b82f6"
            opacity="0.85"
          />
          {/* Mini Star */}
          <path
            d="M -2 -6 L -1 -4 L 1 -4 L 0 -2 L 1 0 L -1 0 L -2 2 L -3 0 L -5 0 L -4 -2 L -5 -4 L -3 -4 Z"
            fill="#60a5fa"
            transform="scale(0.6)"
          />
        </g>

        {/* Bright Sun (Right side) */}
        <g id="day-theme" transform="translate(100, 60)">
          <circle cx="0" cy="0" r="7" fill="url(#sunGrad)" />
          {/* Sun Rays */}
          <path
            d="M 0 -11 L 0 -14 M 0 11 L 0 14 M -11 0 L -14 0 M 11 0 L 14 0 M -8 -8 L -10 -10 M 8 8 L 10 10 M -8 8 L -10 10 M 8 -8 L 10 -10"
            stroke="url(#sunGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 4. Family Members Group overlapping the bottom frame */}
        {/* Blue Parent (Left) */}
        <g id="parent-blue">
          {/* Head */}
          <circle cx="58" cy="100" r="12" fill="url(#parentBlueGrad)" />
          {/* Shoulders */}
          <path
            d="M 32 136 C 32 120 44 113 58 113 C 72 113 84 120 84 136 Z"
            fill="url(#parentBlueGrad)"
          />
        </g>

        {/* Purple Parent (Right) */}
        <g id="parent-purple">
          {/* Hair/Head backing */}
          <path
            d="M 102 100 C 111 96 116 105 112 114 Z"
            fill="#7c3aed"
          />
          {/* Head */}
          <circle cx="102" cy="100" r="12" fill="url(#parentPurpleGrad)" />
          {/* Shoulders */}
          <path
            d="M 76 136 C 76 120 88 113 102 113 C 116 113 128 120 128 136 Z"
            fill="url(#parentPurpleGrad)"
          />
        </g>

        {/* White outline backdrop for the Child to pop over parents */}
        <g id="child-backdrop">
          <circle cx="80" cy="112" r="13" fill="#ffffff" />
          <path
            d="M 52 142 C 52 122 66 122 80 122 C 94 122 108 122 108 142 Z"
            fill="#ffffff"
          />
        </g>

        {/* Cyan Child (Center & Front) */}
        <g id="child">
          {/* Head */}
          <circle cx="80" cy="112" r="10" fill="url(#childGrad)" />
          {/* Shoulders */}
          <path
            d="M 56 142 C 56 126 68 125 80 125 C 92 125 104 126 104 142 Z"
            fill="url(#childGrad)"
          />
        </g>
      </svg>

      {/* Brand Text Block */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className={`${textSizes[size]} font-black tracking-tight leading-none flex items-center`}>
            <span className={theme === 'white' ? 'text-white' : 'text-blue-600'}>Screen</span>
            <span className={theme === 'white' ? 'text-white opacity-90' : 'text-indigo-800'}>Wise</span>
          </div>
          <span className={`${subTextSizes[size]} font-bold uppercase mt-1 leading-none ${
            theme === 'white' ? 'text-blue-100/80' : 'text-slate-400'
          }`}>
            Smart Screen-Time Balance
          </span>
        </div>
      )}
    </div>
  );
}
