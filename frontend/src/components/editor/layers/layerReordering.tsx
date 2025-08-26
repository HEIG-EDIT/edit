import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import { LayerReorderingProps } from "@/models/editor/layers/layerReorderingProps";
import { LayerReorderingButton } from "./reorderingButton";

export const LayerReordering = ({
  layers,
  setLayers,
}: LayerReorderingProps) => {
  const nbLayers = layers.length;
  const nbSelectedLayers = layers.filter((l) => l.isSelected == true).length;
  const indexSelectedLayer = layers.findIndex((l) => l.isSelected == true);
  const indexBackLayer = 0;
  const indexFrontLayer = nbLayers - 1;

  const canBringLayerToFront =
    nbSelectedLayers == 1 && indexSelectedLayer != indexFrontLayer;
  const canSendLayerToBack =
    nbSelectedLayers == 1 && indexSelectedLayer != indexBackLayer;
  const canMoveLayerForward = nbSelectedLayers > 1 || canBringLayerToFront;
  const canMoveLayerBackward = nbSelectedLayers > 1 || canSendLayerToBack;

  function bringLayerToFront(): void {
    if (!canBringLayerToFront) {
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

  function moveLayerForward(): void {
    const reorderedLayers = [...layers];

    if (!canMoveLayerForward) {
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

  function moveLayerBackward(): void {
    const reorderedLayers = [...layers];

    if (!canMoveLayerBackward) {
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

  function sendLayerToBack(): void {
    if (!canSendLayerToBack) {
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

  return (
    <div>
      <LayerReorderingButton
        onClick={bringLayerToFront}
        icon={KeyboardDoubleArrowUpRoundedIcon}
        canUse={canBringLayerToFront}
      />
      <LayerReorderingButton
        onClick={moveLayerForward}
        icon={KeyboardArrowUpRoundedIcon}
        canUse={canMoveLayerForward}
      />
      <LayerReorderingButton
        onClick={moveLayerBackward}
        icon={KeyboardArrowDownRoundedIcon}
        canUse={canMoveLayerBackward}
      />
      <LayerReorderingButton
        onClick={sendLayerToBack}
        icon={KeyboardDoubleArrowDownRoundedIcon}
        canUse={canSendLayerToBack}
      />
    </div>
  );
};
