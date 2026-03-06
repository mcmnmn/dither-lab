import { ResourcesSidebar } from './ResourcesSidebar';
import { ResourcesContent } from './ResourcesContent';
import { AddBrandModal } from './AddBrandModal';
import { AddResourceModal } from './AddResourceModal';
import { useResourcesPersistence } from '../hooks/use-resources-persistence';
import { useResourcesState } from '../state/context';

interface ResourcesAppProps {
  isNarrow: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
}

export function ResourcesApp({ isNarrow, sidebarOpen, onCloseSidebar, toolSwitcher }: ResourcesAppProps) {
  useResourcesPersistence();
  const { showAddBrandModal, showAddResourceModal } = useResourcesState();

  if (isNarrow) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto">
          <ResourcesContent />
        </main>
        {sidebarOpen && (
          <>
            <div className="absolute inset-0 z-40 bg-black/30" onClick={onCloseSidebar} />
            <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t-2 border-(--color-border) bg-(--color-bg-secondary)">
              <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text-secondary)">Resources</span>
                <button onClick={onCloseSidebar} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {toolSwitcher}
              <ResourcesSidebar />
            </div>
          </>
        )}
        {showAddBrandModal && <AddBrandModal />}
        {showAddResourceModal && <AddResourceModal />}
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ResourcesSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <ResourcesContent />
      </main>
      {showAddBrandModal && <AddBrandModal />}
      {showAddResourceModal && <AddResourceModal />}
    </div>
  );
}
