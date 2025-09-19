import { useCallback, useMemo, useRef } from 'react';

export class PerformanceOptimizer {
  private static debounceTimers = new Map<string, NodeJS.Timeout>();

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key: string
  ): T {
    return ((...args: Parameters<T>) => {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    }) as T;
  }

  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
}

export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  debounceMs: number = 300
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(() => {
    return PerformanceOptimizer.debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      debounceMs,
      `callback-${Math.random()}`
    ) as T;
  }, deps);
}