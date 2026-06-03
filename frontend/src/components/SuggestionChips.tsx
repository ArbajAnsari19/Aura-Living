const SUGGESTIONS = [
  "What's your return policy?",
  'Do you ship to the USA?',
  'What are your support hours?',
  'What payment methods do you accept?',
];

/** Quick-start example questions shown on the empty state. */
export function SuggestionChips({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-[0.8rem] font-medium text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
