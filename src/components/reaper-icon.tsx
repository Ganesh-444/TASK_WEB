import * as React from 'react';

export const ReaperIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2v10" />
    <path d="M4 12H2" />
    <path d="M22 12h-2" />
    <path d="M12 12 6.5 6.5" />
    <path d="m17.5 6.5-5.5 5.5" />
    <path d="M12 12 6.5 17.5" />
    <path d="m17.5 17.5-5.5-5.5" />
    <path d="M7 3.2a9 9 0 1 0 10 0" />
  </svg>
);
