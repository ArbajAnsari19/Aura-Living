import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { ChatIcon, CloseIcon } from './icons';

/**
 * Floating live-chat widget: a launcher button that opens an animated chat panel.
 * Owns open/close UI state; all conversation state lives in `useChat`.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, isBusy, historyLoading, send, reset } = useChat();

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Support chat"
          className="flex h-[min(640px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-[400px] origin-bottom-right animate-slide-up flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-widget"
        >
          <ChatHeader onReset={reset} onClose={() => setOpen(false)} />
          <MessageList
            messages={messages}
            historyLoading={historyLoading}
            onPickSuggestion={send}
          />
          <Composer onSend={send} disabled={isBusy} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-widget transition hover:scale-105 active:scale-95"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-7 w-7" />}
      </button>
    </div>
  );
}
