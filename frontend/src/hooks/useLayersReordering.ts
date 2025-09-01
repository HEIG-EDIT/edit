import { Layer } from "@/models/editor/layers/layer";

export interface LayersReorderingLogic {
  /// Move all selected layers to the front of the canvas.
  bringLayersToFront: () => void;
  /// Move all selected layers one "step" to the front.
  moveLayersForward: () => void;
  /// True if the selected layers can be moved forward or to the front.
  canMoveLayersForward: boolean;

  /// Move all selected layers to the back of the canvas.
  sendLayersToBack: () => void;
  /// Move all selected layers one "step" backward.
  moveLayersBackward: () => void;
  /// True if the selected layers can be moved backward or to the back.
  canMoveLayersBackward: boolean;
}

export default function useLayersReordering(
  layers: Layer[],
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
  removeSelectedLayers: () => void,
) {
  const selectedLayers = layers.filter((layer) => layer.isSelected);

  // If there is at least one selected layer not already at the front/back
  const canMoveLayer = (toFront: boolean) => {
    let foundUnselected = false;

    for (const layer of toFront ? layers.slice().reverse() : layers) {
      if (!layer.isSelected) {
        foundUnselected = true;
      } else if (foundUnselected) {
        return true;
      }
    }
    return false;
  };

  const canMoveLayersForward = canMoveLayer(true);
  const canMoveLayersBackward = canMoveLayer(false);

  function bringLayersToFront(): void {
    if (!canMoveLayersForward) {
      return;
    }

    removeSelectedLayers();
    setLayers((prev) => {
      return [...prev, ...selectedLayers];
    });
  }

  function moveLayersForward(): void {
    if (!canMoveLayersForward) {
      return;
    }

    setLayers((layers) => {
      const result = layers.slice();
      for (let i = result.length - 2; i >= 0; --i) {
        if (result[i].isSelected) {
          [result[i], result[i + 1]] = [result[i + 1], result[i]];
        }
      }
      return result;
    });
  }

  function moveLayersBackward(): void {
    if (!canMoveLayersBackward) {
      return;
    }

    setLayers((layers) => {
      const result = layers.slice();
      for (let i = 1; i < layers.length; ++i) {
        if (result[i].isSelected) {
          [result[i - 1], result[i]] = [result[i], result[i - 1]];
        }
      }
      return result;
    });
  }

  function sendLayersToBack(): void {
    if (!canMoveLayersBackward) {
      return;
    }

    removeSelectedLayers();
    setLayers((prev) => [...selectedLayers, ...prev]);
  }

  return {
    bringLayersToFront,
    moveLayersForward,
    canMoveLayersForward,

    sendLayersToBack,
    moveLayersBackward,
    canMoveLayersBackward,
  };
}
