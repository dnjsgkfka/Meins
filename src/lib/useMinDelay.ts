import { useState, useRef, useEffect } from 'react';

export function useMinDelay(isLoading: boolean, minMs: number = 400): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      loadStartRef.current = Date.now();
      setShowLoading(true);
      return;
    }
    if (loadStartRef.current === null) {
      setShowLoading(false);
      return;
    }
    const elapsed = Date.now() - loadStartRef.current;
    const wait = Math.max(0, minMs - elapsed);
    loadStartRef.current = null;
    if (wait === 0) {
      setShowLoading(false);
      return;
    }
    const id = setTimeout(() => setShowLoading(false), wait);
    return () => clearTimeout(id);
  }, [isLoading, minMs]);

  return showLoading;
}
