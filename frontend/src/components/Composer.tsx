import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SendIcon } from './icons';

const MAX_LEN = 4000; // matches backend MAX_MESSAGE_LENGTH

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function Composer({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to ~5 lines.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const nearLimit = value.length > MAX_LEN * 0.9;

  return (
    <div className="border-t border-slate-100 bg-white px-3 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_LEN}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Aura is replying…' : 'Type your message…'}
          className="max-h-[120px] flex-1 resize-none bg-transparent text-[0.92rem] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className="text-[0.65rem] text-slate-400">
          Press <kbd className="font-sans font-medium">Enter</kbd> to send ·{' '}
          <kbd className="font-sans font-medium">Shift+Enter</kbd> for a new line
        </span>
        {nearLimit && (
          <span className="text-[0.65rem] text-slate-400">
            {value.length}/{MAX_LEN}
          </span>
        )}
      </div>
    </div>
  );
}
