import type { ChatMessage } from '../types';

// Empty base = same-origin (dev proxy). Set VITE_API_BASE_URL for a deployed API.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

interface ServerMessageDTO {
  id: string;
  sender: 'USER' | 'AI' | 'SYSTEM';
  text: string;
  createdAt: string;
}

function mapMessage(m: ServerMessageDTO): ChatMessage {
  return {
    id: m.id,
    sender: m.sender === 'USER' ? 'user' : 'ai',
    text: m.text,
    createdAt: m.createdAt,
  };
}

/**
 * Loads prior messages for a session. Returns `null` if the session no longer
 * exists (stale id in localStorage) so the caller can start fresh.
 */
export async function fetchHistory(sessionId: string): Promise<ChatMessage[] | null> {
  const res = await fetch(
    `${API_BASE}/api/conversations/${encodeURIComponent(sessionId)}/messages`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load conversation history');
  const data = (await res.json()) as { messages: ServerMessageDTO[] };
  return data.messages.map(mapMessage);
}

export interface StreamCallbacks {
  /** Session id, delivered as soon as the conversation exists (before the reply). */
  onMeta?: (info: { sessionId: string }) => void;
  onToken: (token: string) => void;
  onDone: (info: { sessionId: string; truncated?: boolean }) => void;
  onError: (message: string) => void;
}

const GENERIC_ERROR = 'Sorry, something went wrong. Please try again.';

/**
 * Sends a message and streams the reply via Server-Sent Events.
 * Resilient: HTTP errors and aborted requests are reported through callbacks,
 * never thrown to the caller.
 */
export async function streamChat(
  message: string,
  sessionId: string | undefined,
  cb: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    cb.onError("I couldn't reach the server. Please check your connection and try again.");
    return;
  }

  if (!res.ok || !res.body) {
    cb.onError(await extractError(res));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) parseFrame(frame, cb);
    }
  } catch (err) {
    if ((err as Error)?.name !== 'AbortError') cb.onError(GENERIC_ERROR);
  }
}

function parseFrame(raw: string, cb: StreamCallbacks): void {
  let event = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data) return;

  try {
    const payload = JSON.parse(data);
    if (event === 'token') cb.onToken(payload.token ?? '');
    else if (event === 'meta') cb.onMeta?.(payload);
    else if (event === 'done') cb.onDone(payload);
    else if (event === 'error') cb.onError(payload.message ?? GENERIC_ERROR);
  } catch {
    /* ignore malformed frame */
  }
}

async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message ?? GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
}
