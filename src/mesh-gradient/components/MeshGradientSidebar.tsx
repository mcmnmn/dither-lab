import { ColorsPanel } from './panels/ColorsPanel';
import { EffectsPanel } from './panels/EffectsPanel';
import { NoisePanel } from './panels/NoisePanel';
import { PositionPanel } from './panels/PositionPanel';
import { CodePanel } from './panels/CodePanel';
import { useMeshGradientState } from '../state/context';

export function MeshGradientSidebar() {
  const { showCodePanel } = useMeshGradientState();

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <ColorsPanel />
      <EffectsPanel />
      <NoisePanel />
      <PositionPanel />
      {showCodePanel && <CodePanel />}
    </aside>
  );
}
