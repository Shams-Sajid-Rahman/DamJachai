export function LogoIcon({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#14B8A6"
        d="M3 12.2V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2z"
      />
      <circle cx="7.6" cy="7.6" r="1.5" fill="#0B1F3A" />
      <path
        d="M9.4 12.6l2.3 2.3 4.6-4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
