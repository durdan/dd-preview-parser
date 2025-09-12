import { useState, useEffect } from 'react';

export interface LayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  splitOrientation: 'horizontal' | 'vertical';
}

export function useResponsiveLayout(): LayoutConfig {
  const [layout, setLayout] = useState<LayoutConfig>(() => {
    const width = window.innerWidth;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      splitOrientation: width < 768 ? 'vertical' : 'horizontal'
    };
  });

  useEffect(() => {
    const handleResize = PerformanceOptimizer.debounce(() => {
      const width = window.innerWidth;
      setLayout({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        splitOrientation: width < 768 ? 'vertical' : 'horizontal'
      });
    }, 150, 'resize');

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return layout;
}

import { PerformanceOptimizer } from '../utils/PerformanceOptimizer';