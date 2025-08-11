import { useState, useCallback } from "react";
import { CircularBuffer } from "./utils/CircularBuffer";

/// Hook to store state with undo / redo capabilities.
/// It has the ability to group multiple smaller modifications into one.
/// capacity sets the maximum number of states to keep in memory.
export function useUndoRedo<T>(initialState: T, capacity: number = 1000) {
  interface UndoRedoState {
    stateHistory: CircularBuffer<T>;
    // This is the value of the state that is being returned, which may have
    // more changes than the last element of stateHistory. The temporary
    // changes made to this virtual state can be added to the history with the
    // commitVirtualState function.
    virtualState: T;
    // Index of the current state in the stateHistory
    index: number;
  }

  const [state, setState] = useState<UndoRedoState>({
    stateHistory: new CircularBuffer<T>(capacity, [initialState]),
    virtualState: initialState,
    index: 0,
  });

  /// Public function to update the state while keeping the history
  const setStatePublic = useCallback(
    (newState: T) => {
      const func = typeof newState === "function" ? newState : () => newState;
      setState((prev) => {
        let { stateHistory, index } = prev;
        const newHistory = stateHistory.getCopy();
        const newState = func(stateHistory.get(index));

        newHistory.push(newState);
        return {
          stateHistory: newHistory,
          virtualState: newState,
          index: index + 1,
        };
      });
    },
    [setState],
  );

  /// Public function to update the virtual state. The caller is responsible
  /// for calling commitVirtualState once all grouped changes are added to the
  /// virtual state.
  const setVirtualState = useCallback(
    (newState: T) => {
      const func = typeof newState === "function" ? newState : () => newState;
      setState((prev) => {
        return {
          ...prev,
          virtualState: func(prev.virtualState),
        };
      });
    },
    [setState],
  );

  /// Save the current virutal state as a step in the history.
  const commitVirtualState = useCallback(() => {
    setStatePublic(state.virtualState);
  }, [setStatePublic, state]);

  /// Undo the last change to the state.
  const undo = useCallback(() => {
    setState((prev) => {
      return {
        ...prev,
        index: prev.index - 1,
        virtualState: prev.stateHistory.get(prev.index - 1),
      };
    });
  }, [setState]);

  /// Redo a previously un-done change
  const redo = useCallback(() => {
    setState((prev) => {
      const index = Math.min(prev.stateHistory.length - 1, prev.index + 1);
      return {
        ...prev,
        index: index,
        virtualState: prev.stateHistory.get(index),
      };
    });
  }, [setState]);

  const canUndo =
    state.stateHistory.getStartIndex() > 0 &&
    state.index > state.stateHistory.getStartIndex();
  const canRedo = state.index < state.stateHistory.length - 1;

  return {
    get state() {
      return state.virtualState;
    },
    setState: setStatePublic,
    setVirtualState,
    commitVirtualState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
