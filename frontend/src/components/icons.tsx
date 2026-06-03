/** Small inline icon set (no icon dependency). */
type IconProps = { className?: string };

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.6 4.8a4 4 0 002.6 2.6L21 11l-4.8 1.6a4 4 0 00-2.6 2.6L12 20l-1.6-4.8a4 4 0 00-2.6-2.6L3 11l4.8-1.6a4 4 0 002.6-2.6L12 2z" />
      <path d="M19 3l.7 2.1a2 2 0 001.2 1.2L23 7l-2.1.7a2 2 0 00-1.2 1.2L19 11l-.7-2.1a2 2 0 00-1.2-1.2L15 7l2.1-.7a2 2 0 001.2-1.2L19 3z" opacity=".7" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 19.5l15-7.5-15-7.5 2.5 7.5-2.5 7.5z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8A2.5 2.5 0 0117.5 16H9l-4 3.5V16H6.5A2.5 2.5 0 014 13.5v-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 12a8 8 0 10-2.3 5.6M20 19v-4h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
