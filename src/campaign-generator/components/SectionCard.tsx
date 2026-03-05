import { useState, useCallback } from 'react';
import type { CampaignSection } from '../state/types';

interface SectionCardProps {
  section: CampaignSection;
  onRegenerate: (sectionId: string) => void;
}

export function SectionCard({ section, onRegenerate }: SectionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [section.content]);

  const handleRegenerate = useCallback(() => {
    onRegenerate(section.id);
  }, [onRegenerate, section.id]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-secondary)">
          {section.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRegenerate}
            className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)"
            title="Regenerate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)"
            title="Copy"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-(--color-text)">
        {section.content}
      </div>
    </div>
  );
}
