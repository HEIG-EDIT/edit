import "@testing-library/jest-dom";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { renderHook } from "@testing-library/react";
import { act } from "react";

const renderUndoRedo = <T>(initialState: T, capacity: number = 100) => {
  return renderHook(() => useUndoRedo(initialState, capacity));
};

test("Empty undo/redo cannot undo", () => {
  const { result } = renderUndoRedo(0);
  const { canUndo } = result.current;

  expect(canUndo).toBe(false);
});

test("Empty undo/redo cannot redo", () => {
  const { result } = renderUndoRedo(0);
  const { canRedo } = result.current;

  expect(canRedo).toBe(false);
});

test("Setting state changes returned state", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });

  expect(result.current.state).toBe(1);
});

test("Set state can be undone", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });

  expect(result.current.canUndo).toBe(true);
});

test("Setting virtual state changes returned state", () => {
  const { result } = renderUndoRedo(0);

  act(() => {
    result.current.setVirtualState(1);
  });

  expect(result.current.state).toBe(1);
});

test("Set virtual state cannot be undone", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setVirtualState(1);
  });

  expect(result.current.canUndo).toBe(false);
});

test("Undo undoes the last change", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });
  act(() => {
    result.current.undo();
  });

  expect(result.current.state).toBe(0);
});

test("Cannot redo after setState", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });

  expect(result.current.canRedo).toBe(false);
});

test("Can redo after undo", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });

  act(() => {
    result.current.undo();
  });

  expect(result.current.canRedo).toBe(true);
});

test("Redo redoes the last change", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setState(1);
  });

  act(() => {
    result.current.undo();
  });

  act(() => {
    result.current.redo();
  });

  expect(result.current.state).toBe(1);
});

test("Cannot undo outside of capacity", () => {
  const { result } = renderUndoRedo(0, 2);
  act(() => {
    result.current.setState(1);
  });
  act(() => {
    result.current.setState(2);
  });
  act(() => {
    result.current.undo();
  });

  expect(result.current.canUndo).toBe(false);
});

test("Uncommited virtual changes are discarded", () => {
  const { result } = renderUndoRedo(0);
  act(() => {
    result.current.setVirtualState(1);
  });
  act(() => {
    result.current.setState(2);
  });
  act(() => {
    result.current.undo();
  });

  expect(result.current.canUndo).toBe(false);
  expect(result.current.state).toBe(0);
});
