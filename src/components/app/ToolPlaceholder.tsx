import type { ToolId } from '../../state/types';
import { getToolById } from '../../state/tools';

interface ToolPlaceholderProps {
  toolId: ToolId;
}

export function ToolPlaceholder({ toolId }: ToolPlaceholderProps) {
  const tool = getToolById(toolId);

  return (
    <div className="flex h-full items-center justify-center bg-(--color-bg)">
      <div className="text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text)">
          &#x2310; {tool.label} &#xAC;
        </h2>
        <p className="mt-2 text-xs text-(--color-text-secondary)">
          Coming soon
        </p>
      </div>
    </div>
  );
}
