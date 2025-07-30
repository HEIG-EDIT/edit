import { useState, useCallback } from "react";

export const imageToImageData = (image: HTMLImageElement): ImageData => {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = image.width;
  tmpCanvas.height = image.height;

  const ctx = tmpCanvas.getContext("2d");
  ctx?.drawImage(image, 0, 0);
  const result = ctx?.getImageData(0, 0, image.width, image.height);

  if (result) {
    return result;
  }

  throw Error("Could not extract imageData from the input image.");
};

export const imageDataToImage = (imageData: ImageData): HTMLImageElement => {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

export function useUndoRedo<T>(initialState: T) {
  interface UndoRedoState {
    stateHistory: Array<T>;
    virtualState: T;
    index: number;
  }

  const [state, setState] = useState<UndoRedoState>({
    stateHistory: [initialState],
    virtualState: initialState,
    index: 0,
  });

  const setStatePublic = useCallback(
    (newState: T) => {
      const func = typeof newState === "function" ? newState : () => newState;
      setState((prev) => {
        let { stateHistory, index } = prev;
        const newStates = stateHistory.slice(0, index + 1);
        const newState = func(stateHistory[index]);
        console.log(newState);
        return {
          stateHistory: [...newStates, newState],
          virtualState: newState,
          index: index + 1,
        };
      });
    },
    [setState],
  );

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

  const commitVirtualState = useCallback(() => {
    setStatePublic(state.virtualState);
  }, [setStatePublic, state]);

  const undo = useCallback(() => {
    setState((prev) => {
      return {
        ...prev,
        index: prev.index - 1,
        virtualState: prev.stateHistory[prev.index - 1],
      };
    });
  }, [setState]);

  const redo = useCallback(() => {
    setState((prev) => {
      const index = Math.min(prev.stateHistory.length - 1, prev.index + 1);
      return {
        ...prev,
        index: index,
        virtualState: prev.stateHistory[index],
      };
    });
  }, [setState]);

  const canUndo = state.index > 0;
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
