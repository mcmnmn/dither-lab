import { useEffect } from 'react';
import { AppProvider, useAppState, useAppDispatch } from '../../state/app-context';
import { Layout } from './Layout';
import { useDither } from '../../hooks/use-dither';
import { usePersistence } from '../../hooks/use-persistence';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { loadSampleImage } from '../../utils/sample-image';

function AppInner() {
  const { theme, sourceImage } = useAppState();
  const dispatch = useAppDispatch();

  // Apply theme class to document
  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.forEach(c => { if (c.startsWith('theme-')) cl.remove(c); });
    cl.add(`theme-${theme}`);
  }, [theme]);

  // Preload sample image when no source is set
  useEffect(() => {
    if (!sourceImage) {
      loadSampleImage().then(sample => {
        dispatch({ type: 'SET_SOURCE', imageData: sample, file: null, fileName: 'sample.jpg' });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
