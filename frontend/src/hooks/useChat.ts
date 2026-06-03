import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatStatus } from '../types';
import { fetchHistory, streamChat } from '../lib/api';

const SESSION_KEY = 'spur_session_id';

const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Owns all chat state: message list, the session id (persisted in localStorage),
 * request status, history restore on load, and the optimistic + streaming send flow.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(
    () => localStorage.getItem(SESSION_KEY) ?? undefined,
  );
  const abortRef = useRef<AbortController | null>(null);

  // Restore prior conversation on first load.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setHistoryLoading(true);
    fetchHistory(sessionId)
      .then((msgs) => {
        if (cancelled) return;
        if (msgs === null) {
          // Stale/unknown session — start clean.
          localStorage.removeItem(SESSION_KEY);
          setSessionId(undefined);
        } else {
          setMessages(msgs);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBusy = status !== 'idle';

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      const userMsg: ChatMessage = {
        id: genId(),
        sender: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      const aiId = genId();
      const aiMsg: ChatMessage = {
        id: aiId,
        sender: 'ai',
        text: '',
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);
      setStatus('sending');

      const controller = new AbortController();
      abortRef.current = controller;

      const patchAi = (patch: Partial<ChatMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, ...patch } : m)));

      const persistSession = (id?: string) => {
        if (id && id !== sessionId) {
          setSessionId(id);
          localStorage.setItem(SESSION_KEY, id);
        }
      };

      await streamChat(
        trimmed,
        sessionId,
        {
          // Persist the session id as soon as it's known, so a reload restores
          // this conversation even if the very first reply fails.
          onMeta: ({ sessionId: id }) => persistSession(id),
          onToken: (token) => {
            setStatus('streaming');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId ? { ...m, text: m.text + token, pending: false } : m,
              ),
            );
          },
          onDone: ({ sessionId: id }) => {
            persistSession(id);
            patchAi({ pending: false });
          },
          onError: (message) => {
            patchAi({ text: message, pending: false, error: true });
          },
        },
        controller.signal,
      );

      // Safety net: if the stream closed with no content and no error.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId && m.text === '' && !m.error
            ? { ...m, text: 'Sorry, I had trouble responding. Please try again.', error: true, pending: false }
            : m,
        ),
      );
      setStatus('idle');
      abortRef.current = null;
    },
    [sessionId, isBusy],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    localStorage.removeItem(SESSION_KEY);
    setSessionId(undefined);
    setMessages([]);
    setStatus('idle');
  }, []);

  return { messages, status, isBusy, historyLoading, send, reset };
}
