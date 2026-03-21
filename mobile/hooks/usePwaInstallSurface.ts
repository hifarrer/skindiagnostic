import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * True on web when the user is not in standalone/PWA mode and is not a typical
 * wide-viewport + mouse desktop (per PWA install UI plan).
 */
export function usePwaInstallSurface(): boolean {
  const [showSurface, setShowSurface] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const iosStandalone =
      nav != null &&
      'standalone' in nav &&
      (nav as unknown as { standalone?: boolean }).standalone === true;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      iosStandalone;

    const isDesktopLike = () =>
      window.innerWidth > 1024 && window.matchMedia('(pointer: fine)').matches;

    const update = () => {
      if (isStandalone) {
        setShowSurface(false);
        return;
      }
      setShowSurface(!isDesktopLike());
    };

    update();
    window.addEventListener('resize', update);
    const mq = window.matchMedia('(pointer: fine)');
    const onMq = () => update();
    mq.addEventListener?.('change', onMq);
    return () => {
      window.removeEventListener('resize', update);
      mq.removeEventListener?.('change', onMq);
    };
  }, []);

  return showSurface;
}
