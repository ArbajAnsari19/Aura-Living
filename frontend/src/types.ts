export type Sender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
  /** AI message currently streaming / awaiting first token. */
  pending?: boolean;
  /** This AI message is a surfaced error (rendered with an error style). */
  error?: boolean;
}

export type ChatStatus = 'idle' | 'sending' | 'streaming';
