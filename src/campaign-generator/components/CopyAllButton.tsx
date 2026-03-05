import { useState, useCallback } from 'react';
import type { Campaign } from '../state/types';

interface CopyAllButtonProps {
  campaign: Campaign;
}

export function CopyAllButton({ campaign }: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = campaign.sections
      .map(s => `${s.label}\n${s.content}`)
      .join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [campaign.sections]);

  return (
    <button
      onClick={handleCopy}
      className="flex flex-shrink-0 items-center gap-1 border border-(--color-border) px-2 py-1 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
      title="Copy all sections"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy All
        </>
      )}
    </button>
  );
}
