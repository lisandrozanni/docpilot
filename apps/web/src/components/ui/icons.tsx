import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function DocumentIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3.75h8l4 4V20.25H6z" />
      <path d="M14 3.75v4h4M9 12h6M9 15.5h6" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3.5 13.9 9l5.6 2-5.6 2-1.9 5.5-2-5.5-5.5-2 5.5-2L12 3.5ZM19 16l.7 2 2 .7-2 .8-.7 2-.8-2-2-.8 2-.7.8-2Z" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 15V4m-4 4 4-4 4 4M4.5 15v4.5h15V15" />
    </svg>
  );
}
