import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const UsersIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.602M12 12.75a3 3 0 100-6 3 3 0 000 6zm-4.243 5.507c.328.322.669.627 1.024.901M12 12.75c.091 0 .182.004.272.011M12 12.75c-.091 0-.182.004-.272.011M12 12.75S11.828 11.25 12 11.25s.272 1.501.272 1.501M21.75 8.25c0-3.866-3.134-7-7-7s-7 3.134-7 7c0 1.67.599 3.203 1.582 4.429M12 21a9.094 9.094 0 003.741-.479M12 21c-4.356 0-8.04-.963-9.418-2.068M4.5 8.25c0-3.866 3.134-7 7-7s7 3.134 7 7c0 1.67-.599 3.203-1.582 4.429" />
  </svg>
);