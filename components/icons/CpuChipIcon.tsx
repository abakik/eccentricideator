import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const CpuChipIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M12 3v1.5M15.75 3v1.5M8.25 19.5V21M12 19.5V21M15.75 19.5V21M3 8.25H1.5M3 12H1.5M3 15.75H1.5M19.5 8.25H21M19.5 12H21M19.5 15.75H21M5.25 5.25h13.5v13.5h-13.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" />
  </svg>
);