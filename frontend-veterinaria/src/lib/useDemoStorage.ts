"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function useDemoStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setValue(JSON.parse(saved));
      }
    } catch {
      // Fallback to initialValue if localStorage is unavailable or malformed
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota errors in demo mode
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
