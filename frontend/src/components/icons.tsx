import type { SVGProps } from 'react';

export function HBRSLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100" height="100" rx="12" fill="currentColor" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="40"
        fontWeight="bold"
        fill="#FFDA63" // Accent color
      >
        H-BRS
      </text>
    </svg>
  );
}

// Export your icon components here
export { default as SomeIcon } from 'lucide-react';
// Add other icons as needed
