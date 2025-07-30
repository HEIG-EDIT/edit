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
    index: number;
  }

  const [states, setStates] = useState<UndoRedoState>({
    stateHistory: [initialState],
    index: 0,
  });

  const setState = useCallback(
    (newState: T) => {
      const func = typeof newState === "function" ? newState : () => newState;

      setStates((prev) => {
        let { stateHistory, index } = prev;
        const newStates = stateHistory.slice(0, index + 1);
        console.log("Prev: ", stateHistory[index]);
        return {
          stateHistory: [...newStates, func(stateHistory[index])],
          index: index + 1,
        };
      });
    },
    [setStates],
  );

  const undo = useCallback(() => {
    setStates((prev) => {
      return { ...prev, index: prev.index + 1 };
    });
  }, [setStates]);

  const redo = useCallback(() => {
    setStates((prev) => {
      return {
        ...prev,
        index: Math.min(prev.stateHistory.length - 1, prev.index + 1),
      };
    });
  }, [setStates]);

  const canUndo = states.index > 0;
  const canRedo = states.index < states.stateHistory.length - 1;

  return {
    state: states.stateHistory[states.index],
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
