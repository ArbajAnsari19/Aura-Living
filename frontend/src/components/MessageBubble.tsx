import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types';
import { SparkleIcon } from './icons';
import { TypingIndicator } from './TypingIndicator';

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  const showTyping = message.pending && message.text === '';

  return (
    <div className={`flex animate-fade-in gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (AI only) */}
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <SparkleIcon className="h-4 w-4" />
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={[
            'rounded-2xl px-3.5 py-2.5 text-[0.92rem] leading-relaxed shadow-bubble',
            isUser
              ? 'rounded-br-md bg-gradient-to-br from-brand-500 to-brand-600 text-white'
              : message.error
                ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-rose-700'
                : 'rounded-bl-md border border-slate-100 bg-white text-slate-700',
          ].join(' ')}
        >
          {showTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="markdown break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
        {!showTyping && (
          <span className="mt-1 px-1 text-[0.65rem] text-slate-400">{formatTime(message.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
