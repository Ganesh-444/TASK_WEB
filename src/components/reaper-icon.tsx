import * as React from 'react';

export const ReaperIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M12.193 2.324a2.25 2.25 0 0 0-2.386 0L3 7.843V14.25c0 3.296 2.263 6.64 6.01 8.242a2.25 2.25 0 0 0 1.98 0c3.747-1.602 6.01-4.946 6.01-8.242V7.843l-6.807-5.519Z"
      stroke="#dc2626"
      strokeWidth="1"
      strokeLinejoin="round"
      fill="#171717"
    />
    <path
      d="M13.25 12.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"
      fill="#dc2626"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.562 10.37a.75.75 0 0 1 .938.938l-3.25 3.25a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.782-2.781Z"
      fill="#fff"
    />
  </svg>
);
