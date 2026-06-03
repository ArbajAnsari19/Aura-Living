import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import { SparkleIcon } from './icons';

interface Props {
  messages: ChatMessage[];
  historyLoading: boolean;
  onPickSuggestion: (q: string) => void;
}

export function MessageList({ messages, historyLoading, onPickSuggestion }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message (also fires on each streamed token).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-scroll flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-5">
      {historyLoading && (
        <p className="py-6 text-center text-sm text-slate-400">Loading your conversation…</p>
      )}

      {!historyLoading && isEmpty && (
        <div className="flex flex-col gap-4 pt-2 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <SparkleIcon className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-3.5 py-2.5 text-[0.92rem] leading-relaxed text-slate-700 shadow-bubble">
              Hi! 👋 I'm <span className="font-semibold text-brand-700">Aura</span>, your support
              assistant at Aura Living. Ask me about shipping, returns, payments, or your order.
            </div>
          </div>
          <div className="pl-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Try asking
            </p>
            <SuggestionChips onPick={onPickSuggestion} />
          </div>
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
