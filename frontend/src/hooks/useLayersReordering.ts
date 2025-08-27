import { Layer } from "@/models/editor/layers/layer";

export interface LayersReorderingLogic {
  bringLayersToFront: () => void;
  canBringLayersToFront: boolean;

  moveLayersForward: () => void;
  canMoveLayersForward: boolean;

  sendLayersToBack: () => void;
  canSendLayersToBack: boolean;

  moveLayersBackward: () => void;
  canMoveLayersBackward: boolean;
}

// TODO: Use type for setLayers
export default function useLayersReordering(layers: Layer[], setLayers) {
  const nbLayers = layers.length;
  const nbSelectedLayers = layers.filter((l) => l.isSelected == true).length;
  const indexSelectedLayer = layers.findIndex((l) => l.isSelected == true);
  const indexBackLayer = 0;
  const indexFrontLayer = nbLayers - 1;

  const canBringLayersToFront =
    nbSelectedLayers == 1 && indexSelectedLayer != indexFrontLayer;
  const canSendLayersToBack =
    nbSelectedLayers == 1 && indexSelectedLayer != indexBackLayer;
  const canMoveLayersForward = nbSelectedLayers > 1 || canBringLayersToFront;
  const canMoveLayersBackward = nbSelectedLayers > 1 || canSendLayersToBack;

  function bringLayersToFront(): void {
    if (!canBringLayersToFront) {
      return;
    }

    const reorderedLayers = [...layers];

    for (let i = indexSelectedLayer; i < indexFrontLayer; ++i) {
      [reorderedLayers[i], reorderedLayers[i + 1]] = [
        reorderedLayers[i + 1],
        reorderedLayers[i],
      ];
    }

    setLayers(reorderedLayers);
  }

  function moveLayersForward(): void {
    const reorderedLayers = [...layers];

    if (!canMoveLayersForward) {
      // no need to iterate over layers if only the first layer is selected
      return;
    }

    for (let i = nbLayers - 2; i >= 0; --i) {
      if (reorderedLayers[i].isSelected) {
        [reorderedLayers[i], reorderedLayers[i + 1]] = [
          reorderedLayers[i + 1],
          reorderedLayers[i],
        ];
      }
    }

    setLayers(reorderedLayers);
  }

  function moveLayersBackward(): void {
    const reorderedLayers = [...layers];

    if (!canMoveLayersBackward) {
      // no need to iterate over layers if only the last layer is selected
      return;
    }

    for (let i = 1; i < nbLayers; ++i) {
      if (reorderedLayers[i].isSelected) {
        [reorderedLayers[i - 1], reorderedLayers[i]] = [
          reorderedLayers[i],
          reorderedLayers[i - 1],
        ];
      }
    }

    setLayers(reorderedLayers);
  }

  function sendLayersToBack(): void {
    if (!canSendLayersToBack) {
      return;
    }

    const reorderedLayers = [...layers];

    for (let i = indexSelectedLayer; i > 0; --i) {
      [reorderedLayers[i], reorderedLayers[i - 1]] = [
        reorderedLayers[i - 1],
        reorderedLayers[i],
      ];
    }

    setLayers(reorderedLayers);
  }

  return {
    bringLayersToFront,
    canBringLayersToFront,

    moveLayersForward,
    canMoveLayersForward,

    sendLayersToBack,
    canSendLayersToBack,

    moveLayersBackward,
    canMoveLayersBackward,
  };
}
