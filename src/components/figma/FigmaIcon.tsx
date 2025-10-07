interface FigmaIconProps {
  className?: string;
}

export function FigmaIcon({ className = "h-4 w-4" }: FigmaIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#F24E1E" d="M8.668 2.005A3.333 3.333 0 0 0 8.668 8.668h3.334V2.005H8.668Z"/>
      <path fill="#FF7262" d="M12.002 2.005V8.668h3.334a3.333 3.333 0 0 0 0-6.663h-3.334Z"/>
      <path fill="#A259FF" d="M12.002 8.668V15.331h3.334a3.333 3.333 0 0 0 0-6.663h-3.334Z"/>
      <path fill="#1ABCFE" d="M8.668 8.668a3.333 3.333 0 0 0 0 6.663h3.334V8.668H8.668Z"/>
      <path fill="#0ACF83" d="M8.668 15.331a3.333 3.333 0 1 0 3.334 3.334v-3.334H8.668Z"/>
    </svg>
  );
}