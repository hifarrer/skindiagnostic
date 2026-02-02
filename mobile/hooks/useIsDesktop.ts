import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIsDesktop(false);
      return;
    }

    const checkIsDesktop = () => {
      if (typeof window !== 'undefined') {
        // Consider desktop if width is greater than 768px (tablet breakpoint)
        const width = window.innerWidth || Dimensions.get('window').width;
        setIsDesktop(width > 768);
      }
    };

    checkIsDesktop();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIsDesktop);
      return () => window.removeEventListener('resize', checkIsDesktop);
    }
  }, []);

  return isDesktop;
}
