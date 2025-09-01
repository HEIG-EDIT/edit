import { useState, useCallback } from "react";
import { CircularBuffer } from "@/models/editor/utils/CircularBuffer";

interface UndoRedoResult<T> {
  /// The current state held by the hook
  state: T;

  /// Set the current state as a new step in the history. This can be undone with undo
  setState: React.Dispatch<T>;
  /// Set the current state but don't add a new step in the history. This can
  /// be used to group multiple small changes that should be undone or redone as one.
  /// The caller has the responsibility to commit the changes with commitVirtualState when needed.
  setVirtualState: React.Dispatch<T>;
  /// Add the current state as a new history step. This should be used by the caller
  /// to finalize small changes done with setVirtualState.
  commitVirtualState: () => void;

  /// Undo the last step of the history
  /// @throws Error if this operation cannot be performed
  undo: () => void;
  /// Redo a previously undone step of the history
  /// @throws Error if this operation cannot be performed
  redo: () => void;
  /// Check if the current history's state allows performing an undo operation
  canUndo: boolean;
  /// Check if the current history's state allows performing a redo operation
  canRedo: boolean;
}

interface UndoRedoState<T> {
  /// The circular buffer storing all of the states.
  stateHistory: CircularBuffer<T>;
  // This is the value of the state that is being returned, which may have
  // more changes than the last element of stateHistory. The temporary
  // changes made to this virtual state can be added to the history with the
  // commitVirtualState function of the hook.
  virtualState: T;
  // Index of the current state in the stateHistory buffer
  index: number;
  /// True if the current state returned by the hook is the latest change done by the user
  /// i.e. if the user has just made a new change or has redone all undone changes.
  isLatestChange: boolean;
}

/// Hook to store state with undo / redo capabilities.
/// It has the ability to group multiple smaller modifications into one with "virtual" modifications.
/// @tparam T The type of the elements to store in the history
/// @param initialState The initial state to store in the history.
/// @param capacity The maximum number of states to store in the history. Reduce this
///                 to prevent memory consumption issues.
export function useUndoRedo<T>(
  initialState: T,
  capacity: number = 50,
): UndoRedoResult<T> {
  const [state, setState] = useState<UndoRedoState<T>>({
    stateHistory: new CircularBuffer<T>(capacity, [initialState]),
    virtualState: initialState,
    index: 0,
    isLatestChange: true,
  });

  /// Public function to update the state while keeping previous changes in the history
  const setStatePublic = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const func =
        typeof newState === "function"
          ? (newState as (prev: T) => T)
          : () => newState;
      setState((prev) => {
        const { stateHistory, index, virtualState } = prev;
        const newHistory = stateHistory.getCopy();
        const newState = func(virtualState);

        const newIndex = index + 1;
        newHistory.set(newIndex, newState);

        return {
          stateHistory: newHistory,
          virtualState: newState,
          index: newIndex,
          isLatestChange: true,
        };
      });
    },
    [setState],
  );

  /// Public function to update the virtual state. The caller is responsible
  /// for calling commitVirtualState once all grouped changes are added to the
  /// virtual state.
  const setVirtualState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      const func =
        typeof newState === "function"
          ? (newState as (prev: T) => T)
          : () => newState;
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

  const canUndo =
    state.stateHistory.getStartIndex() >= 0 &&
    state.index > state.stateHistory.getStartIndex();
  const canRedo =
    !state.isLatestChange && state.index < state.stateHistory.length - 1;

  /// Undo the last change to the state.
  const undo = useCallback(() => {
    if (!canUndo) {
      throw new Error("Cannot undo in this state");
    }
    setState((prev) => {
      return {
        ...prev,
        index: prev.index - 1,
        virtualState: prev.stateHistory.get(prev.index - 1),
        isLatestChange: false,
      };
    });
  }, [setState, canUndo]);

  /// Redo a previously un-done change
  const redo = useCallback(() => {
    if (!canRedo) {
      throw new Error("Cannot redo in this state");
    }
    setState((prev) => {
      const index = Math.min(prev.stateHistory.length - 1, prev.index + 1);
      return {
        ...prev,
        index: index,
        virtualState: prev.stateHistory.get(index),
        isLatestChange: index == prev.stateHistory.length - 1,
      };
    });
  }, [setState, canRedo]);

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
