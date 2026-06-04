interface CalendarCheckIconProps {
  className?: string;
}

export function CalendarCheckIcon({ className = 'h-4 w-4' }: CalendarCheckIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="currentColor" d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v1H3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1m-5 8v9a3 3 0 0 0 3 3h7.757l-.878-.879a3 3 0 0 1 3.844-4.577l1.934-2.418A3 3 0 0 1 21 13v-3z"/>
      <path fill="currentColor" d="M21.78 16.625a1 1 0 1 0-1.56-1.25l-3.303 4.128-1.21-1.21a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.488-.082z"/>
    </svg>
  );
}
