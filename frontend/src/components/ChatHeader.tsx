import { CloseIcon, RefreshIcon, SparkleIcon } from './icons';

interface Props {
  onReset: () => void;
  onClose: () => void;
}

export function ChatHeader({ onReset, onClose }: Props) {
  return (
    <header className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3.5 text-white">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
          <SparkleIcon className="h-5 w-5" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-700 bg-emerald-400" />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold leading-tight">Aura · Support</h2>
        <p className="truncate text-xs text-brand-100">Online · typically replies instantly</p>
      </div>

      <button
        type="button"
        onClick={onReset}
        title="Start a new chat"
        aria-label="Start a new chat"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-100 transition hover:bg-white/10 hover:text-white"
      >
        <RefreshIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onClose}
        title="Close chat"
        aria-label="Close chat"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-100 transition hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </header>
  );
}
