import { Platform, useWindowDimensions } from 'react-native';

/**
 * Layout breakpoint for web.
 *
 * Using only Math.min(width, height) > 768 breaks real desktops: browser chrome
 * often leaves viewport height ~700–800px, so PCs look "mobile" until zoom
 * changes reported dimensions. We treat wide viewports as desktop, and still
 * stack for typical phone landscape (wide but short and not desktop-wide).
 */
const DESKTOP_MIN_SHORTEST_SIDE = 769;
/** Below this width, landscape layouts stay stacked (phones in landscape). */
const DESKTOP_MIN_WIDTH = 1024;

export function useIsDesktop(): boolean {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return false;
  }

  const shortestSide = Math.min(width, height);
  if (shortestSide > DESKTOP_MIN_SHORTEST_SIDE) {
    return true;
  }
  return width >= DESKTOP_MIN_WIDTH;
}
