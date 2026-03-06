import { useEffect, useRef } from 'react';
import { useSFState, useSFDispatch } from '../state/context';
import type { SFBackgroundType, SFPatternId, SFLogoPosition, SFOutputResolution, SFOutputFormat } from '../state/types';

const STORAGE_KEY = 'screenshot-framer-settings';

const VALID_BG_TYPES: SFBackgroundType[] = ['gradient', 'solid', 'pattern'];
const VALID_PATTERNS: SFPatternId[] = ['dots', 'grid', 'diagonal', 'crosses', 'waves', 'triangles'];
const VALID_LOGO_POS: SFLogoPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const VALID_RESOLUTIONS: SFOutputResolution[] = [1080, 2048];
const VALID_FORMATS: SFOutputFormat[] = ['png', 'jpg'];

interface PersistedSettings {
  screenshotScale: number;
  screenshotBorderRadius: number;
  screenshotShadow: number;
  screenshotOffsetX: number;
  screenshotOffsetY: number;
  bgType: string;
  bgSolidColor: string;
  bgGradientPresetId: string;
  bgPatternId: string;
  bgPatternColor: string;
  bgPatternBgColor: string;
  bgPatternScale: number;
  logoEnabled: boolean;
  logoPosition: string;
  logoScale: number;
  logoOpacity: number;
  outputResolution: number;
  outputFormat: string;
}

export function useScreenshotFramerPersistence() {
  const state = useSFState();
  const dispatch = useSFDispatch();
  const saveSkips = useRef(2);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saveSkips.current = 0;
        return;
      }

      const p: PersistedSettings = JSON.parse(saved);
      dispatch({
        type: 'SF_LOAD_STATE',
        state: {
          screenshotScale: clamp(p.screenshotScale, 0.5, 0.95),
          screenshotBorderRadius: clamp(p.screenshotBorderRadius, 0, 32),
          screenshotShadow: clamp(p.screenshotShadow, 0, 100),
          screenshotOffsetX: clamp(p.screenshotOffsetX, -50, 50),
          screenshotOffsetY: clamp(p.screenshotOffsetY, -50, 50),
          bgType: VALID_BG_TYPES.includes(p.bgType as SFBackgroundType) ? p.bgType as SFBackgroundType : 'gradient',
          bgSolidColor: p.bgSolidColor || '#1a1a2e',
          bgGradientPresetId: p.bgGradientPresetId || 'sunset-glow',
          bgPatternId: VALID_PATTERNS.includes(p.bgPatternId as SFPatternId) ? p.bgPatternId as SFPatternId : 'dots',
          bgPatternColor: p.bgPatternColor || '#ffffff',
          bgPatternBgColor: p.bgPatternBgColor || '#1a1a2e',
          bgPatternScale: clamp(p.bgPatternScale, 0.5, 3),
          logoEnabled: typeof p.logoEnabled === 'boolean' ? p.logoEnabled : false,
          logoPosition: VALID_LOGO_POS.includes(p.logoPosition as SFLogoPosition) ? p.logoPosition as SFLogoPosition : 'bottom-right',
          logoScale: clamp(p.logoScale, 0.02, 0.15),
          logoOpacity: clamp(p.logoOpacity, 0, 1),
          outputResolution: VALID_RESOLUTIONS.includes(p.outputResolution as SFOutputResolution) ? p.outputResolution as SFOutputResolution : 1080,
          outputFormat: VALID_FORMATS.includes(p.outputFormat as SFOutputFormat) ? p.outputFormat as SFOutputFormat : 'png',
        },
      });
    } catch {
      saveSkips.current = 0;
    }
  }, [dispatch]);

  useEffect(() => {
    if (saveSkips.current > 0) {
      saveSkips.current--;
      return;
    }

    const settings: PersistedSettings = {
      screenshotScale: state.screenshotScale,
      screenshotBorderRadius: state.screenshotBorderRadius,
      screenshotShadow: state.screenshotShadow,
      screenshotOffsetX: state.screenshotOffsetX,
      screenshotOffsetY: state.screenshotOffsetY,
      bgType: state.bgType,
      bgSolidColor: state.bgSolidColor,
      bgGradientPresetId: state.bgGradientPresetId,
      bgPatternId: state.bgPatternId,
      bgPatternColor: state.bgPatternColor,
      bgPatternBgColor: state.bgPatternBgColor,
      bgPatternScale: state.bgPatternScale,
      logoEnabled: state.logoEnabled,
      logoPosition: state.logoPosition,
      logoScale: state.logoScale,
      logoOpacity: state.logoOpacity,
      outputResolution: state.outputResolution,
      outputFormat: state.outputFormat,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [
    state.screenshotScale, state.screenshotBorderRadius, state.screenshotShadow,
    state.screenshotOffsetX, state.screenshotOffsetY,
    state.bgType, state.bgSolidColor, state.bgGradientPresetId,
    state.bgPatternId, state.bgPatternColor, state.bgPatternBgColor, state.bgPatternScale,
    state.logoEnabled, state.logoPosition, state.logoScale, state.logoOpacity,
    state.outputResolution, state.outputFormat,
  ]);
}

function clamp(val: number, min: number, max: number): number {
  if (typeof val !== 'number' || isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}
