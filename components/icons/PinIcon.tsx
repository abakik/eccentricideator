
import React from 'react';

interface PinIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const PinIcon: React.FC<PinIconProps> = ({ filled = false, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v10.5A2.25 2.25 0 007.5 18.75h9A2.25 2.25 0 0018.75 16.5V6A2.25 2.25 0 0016.5 3.75z" />
  </svg>
);
// Alternative simpler pin icon (like a thumbtack)
// export const PinIcon: React.FC<PinIconProps> = ({ filled = false, ...props }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.608a8.287 8.287 0 003 2.472A8.288 8.288 0 0015 9.608a8.286 8.286 0 00.362-4.394zM14.25 12a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" />
//     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" visibility={filled ? "visible" : "hidden"} />
//   </svg>
// );
