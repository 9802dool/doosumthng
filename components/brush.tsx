export function Brush({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path
        d="M3 12c16-8 27 5 46 2s24-9 42-5 28 7 50 2 26-8 44-3 24 5 49 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8 8c20 6 34-6 54-2s30 8 48 3 22-7 46-2 28 6 42 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
