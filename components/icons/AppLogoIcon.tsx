import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const AppLogoIcon: React.FC<SVGProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 64 64" // Adjusted viewBox for potentially more detail
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Lightbulb shape */}
    <path d="M32 52 C32 58, 28 62, 22 62 C16 62, 12 58, 12 52 L12 44 Q12 38, 22 32 Q32 38, 32 44 Z" transform="translate(0, -12) scale(1.2 1)" />
    <path d="M22 40 Q16 38, 15 32 C15 20, 29 20, 29 32 Q28 38, 22 40" transform="translate(0, -12) scale(1.2 1)" />
    
    {/* Lightbulb base (simplified) */}
    <rect x="20" y="51" width="8" height="4" rx="1" transform="scale(1.2 1) translate(-3.3, -13)" />
    <line x1="20" y1="56" x2="28" y2="56" transform="scale(1.2 1) translate(-3.3, -13)" />
    <line x1="20" y1="58" x2="28" y2="58" transform="scale(1.2 1) translate(-3.3, -13)" />

    {/* Brain shape (simplified) */}
    <path d="M22 36 q-2 -3 -4 -2 q-3 1 -2 4 q1 3 4 2 q3 -1 2 -4z" transform="translate(2.5, -15) scale(0.6 0.6)" fill="currentColor" opacity="0.3" />
    <path d="M30 35 q-2 -3 -4 -2 q-3 1 -2 4 q1 3 4 2 q3 -1 2 -4z" transform="translate(-0.5, -16) scale(0.6 0.6)" fill="currentColor" opacity="0.3"/>
    <path d="M26 30 q-2 -3 -4 -2 q-3 1 -2 4 q1 3 4 2 q3 -1 2 -4z" transform="translate(1, -13) scale(0.7 0.7)" fill="currentColor" opacity="0.3"/>
    <path d="M24 25 C 20 22, 18 26, 18 30 S 20 38, 24 35 S 28 30, 28 26 S 26 23, 24 25" transform="translate(0, -5) scale(0.9 0.9)" />
    <path d="M24,28 Q20,27 20,31 Q20,34 24,33" transform="translate(0, -5) scale(0.9 0.9)"/>
    <path d="M24,28 Q28,27 28,31 Q28,34 24,33" transform="translate(0, -5) scale(0.9 0.9)"/>
    <path d="M22,26 Q24,24 26,26" transform="translate(0, -5) scale(0.9 0.9)"/>


    {/* Sparkle (four-pointed star) */}
    <path d="M48 12 L50 10 L52 12 L50 14 Z" fill="currentColor" />
    <path d="M50 10 L51 6 L52 10" fill="currentColor" transform="translate(-1,0)" />
    <path d="M50 14 L51 18 L52 14" fill="currentColor" transform="translate(-1,0)" />
    <path d="M48 12 L44 11 L48 10" fill="currentColor" transform="translate(0,1)" />
    <path d="M52 12 L56 11 L52 10" fill="currentColor" transform="translate(0,1)" />

  </svg>
);