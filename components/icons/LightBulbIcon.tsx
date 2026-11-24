
import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const LightBulbIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a11.955 11.955 0 01-5.25 0M12 3v2.25m0 0c-1.47.01-2.882.286-4.228.796M12 5.25c1.47.01 2.882.286 4.228.796M12 5.25v-.004M12 12.75a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15.75A2.25 2.25 0 0112 13.5a2.25 2.25 0 012.25 2.25c0 .501-.16 1.355-.504 2.187a.75.75 0 01-.996.049A14.95 14.95 0 0012 17.25a14.95 14.95 0 00-1.75.536.75.75 0 01-.996-.049A3.752 3.752 0 019.75 15.75z" />
  </svg>
);
