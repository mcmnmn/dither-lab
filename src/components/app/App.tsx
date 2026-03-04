import { useEffect } from 'react';
import { AppProvider, useAppState } from '../../state/app-context';
import { Layout } from './Layout';
import { useDither } from '../../hooks/use-dither';
import { usePersistence } from '../../hooks/use-persistence';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';

function AppInner() {
  const { theme } = useAppState();

  // Apply theme class to document
  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.forEach(c => { if (c.startsWith('theme-')) cl.remove(c); });
    cl.add(`theme-${theme}`);
  }, [theme]);

  // Run dither engine on settings change
  useDither();

  // Persist settings to localStorage
  usePersistence();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  return <Layout />;
}

export function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
