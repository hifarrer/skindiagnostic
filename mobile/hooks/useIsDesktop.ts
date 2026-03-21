import { Platform, useWindowDimensions } from 'react-native';

/**
 * Layout breakpoint for web: use the shortest viewport edge, not width alone.
 * Otherwise phones in landscape (e.g. width > 768) get the two-column landing
 * layout and the hero visual collapses to a thin strip with a large empty area.
 */
export function useIsDesktop(): boolean {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return false;
  }

  const shortestSide = Math.min(width, height);
  return shortestSide > 768;
}
