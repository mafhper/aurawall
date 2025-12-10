import { useState, useCallback, useRef } from 'react';

export function useHistory<T>(initialState: T, maxHistory = 20) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  // Current state is derived from history
  const state = history[currentIndex];

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // If update comes from undo/redo, ignore it for history pushing
    if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
    }

    setHistory((prev) => {
        const current = prev[currentIndex];
        const next = typeof newState === 'function' ? (newState as Function)(current) : newState;
        
        // Deep comparison could be here, but for performance we assume change happened
        // if setState was called by user action.
        
        // Remove future if we are in the middle
        const newHistory = prev.slice(0, currentIndex + 1);
        
        // Add new state
        newHistory.push(next);
        
        // Limit size
        if (newHistory.length > maxHistory) {
            newHistory.shift();
        }
        
        // Sync index immediately in the setter to avoid race conditions with derived state
        setCurrentIndex(newHistory.length - 1);
        
        return newHistory;
    });
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}
