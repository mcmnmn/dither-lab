import { useState, useCallback } from 'react';

const FORMSPREE_URL = 'https://formspree.io/f/xbdzrwwo';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setEmail('');
          setMessage('');
          setStatus('idle');
          onClose();
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [email, message, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[400px] border-2 border-(--color-border) bg-(--color-bg) p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text)">
            Feedback
          </span>
          <button
            onClick={onClose}
            className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <p className="py-8 text-center text-xs uppercase tracking-wider text-(--color-text-secondary)">
            Thank you for your feedback!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border border-(--color-border) bg-(--color-bg) px-2 py-1.5 font-mono text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">
                Feedback
              </label>
              <textarea
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="What's on your mind?"
                className="resize-none border border-(--color-border) bg-(--color-bg) px-2 py-1.5 font-mono text-xs text-(--color-text) outline-none placeholder:text-(--color-text-secondary)/50"
              />
            </div>

            {status === 'error' && (
              <p className="text-[10px] uppercase tracking-wider text-red-500">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="border border-(--color-accent) bg-(--color-accent) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
