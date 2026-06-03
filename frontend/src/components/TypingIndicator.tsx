/** Three bouncing dots shown while the agent is preparing a reply. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1.5" aria-label="Agent is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-brand-400 animate-bounce-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
