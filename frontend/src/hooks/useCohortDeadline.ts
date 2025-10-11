// src/hooks/useCohortDeadline.ts
import * as React from "react";

type Options = {
  hours?: number;               // default 72
  storageKey?: string;          // default 'gaja.cohort.deadline'
  // optionally accept a fixed deadline from backend (epoch ms)
  fixedDeadlineMs?: number;     // if provided, overrides rolling
};

export function useCohortDeadline(opts: Options = {}) {
  const {
    hours = 72,
    storageKey = "gaja.cohort.deadline",
    fixedDeadlineMs,
  } = opts;

  const initial = React.useMemo<number>(() => {
    if (fixedDeadlineMs && fixedDeadlineMs > Date.now()) return fixedDeadlineMs;
    const saved = Number(localStorage.getItem(storageKey));
    if (saved && saved > Date.now()) return saved;
    // rolling deadline
    return Date.now() + hours * 60 * 60 * 1000;
  }, [hours, storageKey, fixedDeadlineMs]);

  const [deadline, setDeadline] = React.useState<number>(initial);
  const [remain, setRemain] = React.useState<number>(Math.max(0, initial - Date.now()));

  // persist once if new
  React.useEffect(() => {
    const saved = Number(localStorage.getItem(storageKey));
    if (!saved || saved <= Date.now() || saved !== deadline) {
      localStorage.setItem(storageKey, String(deadline));
    }
  }, [deadline, storageKey]);

  // sync across tabs
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const d = Number(e.newValue);
        if (d && d !== deadline) setDeadline(d);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [deadline, storageKey]);

  // tick on second boundaries
  React.useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, deadline - Date.now());
      setRemain((prev) =>
        Math.floor(prev / 1000) === Math.floor(next / 1000) ? prev : next
      );
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const reset = React.useCallback((newDeadlineMs?: number) => {
    const d = newDeadlineMs && newDeadlineMs > Date.now()
      ? newDeadlineMs
      : Date.now() + hours * 60 * 60 * 1000;
    setDeadline(d);
    localStorage.setItem(storageKey, String(d));
  }, [hours, storageKey]);

  return {
    deadline,
    remain,
    reset,
    isExpired: remain <= 0,
  };
}
