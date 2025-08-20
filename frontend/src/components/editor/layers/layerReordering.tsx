import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import { LayerReorderingProps } from "@/models/editor/layers/layerReorderingProps";

export const LayerReordering = ({
  layers,
  setLayers,
}: LayerReorderingProps) => {
  function bringLayerToFront(): void {
    const nbSelectedLayers = layers.filter((l) => l.isSelected == true).length;

    if (nbSelectedLayers != 1) {
      return;
    }

    const nbLayers = layers.length;
    const reorderedLayers = [...layers];
    const indexSelectedLayer = layers.findIndex((l) => l.isSelected == true);

    if (indexSelectedLayer == reorderedLayers.length - 1) {
      return;
    }

    for (let i = indexSelectedLayer; i < nbLayers - 1; ++i) {
      [reorderedLayers[i], reorderedLayers[i + 1]] = [
        reorderedLayers[i + 1],
        reorderedLayers[i],
      ];
    }

    setLayers(reorderedLayers);
  }

  function moveLayerForward(): void {
    const nbLayers = layers.length;
    const reorderedLayers = [...layers];

    if (
      reorderedLayers.filter((l) => l.isSelected == true).length == 1 &&
      reorderedLayers.findIndex((l) => l.isSelected == true) ==
        reorderedLayers.length - 1
    ) {
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
    const nbLayers = layers.length;
    const reorderedLayers = [...layers];

    if (
      reorderedLayers.filter((l) => l.isSelected == true).length == 1 &&
      reorderedLayers.findIndex((l) => l.isSelected == true) == 0
    ) {
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
    const nbSelectedLayers = layers.filter((l) => l.isSelected == true).length;

    if (nbSelectedLayers != 1) {
      return;
    }

    const reorderedLayers = [...layers];
    const indexSelectedLayer = layers.findIndex((l) => l.isSelected == true);

    if (indexSelectedLayer == 0) {
      return;
    }

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
      <button className="cursor-pointer" onClick={bringLayerToFront}>
        {
          <KeyboardDoubleArrowUpRoundedIcon
            fontSize="large"
            style={{ color: "black" }}
          />
        }
      </button>
      <button className="cursor-pointer" onClick={moveLayerForward}>
        {
          <KeyboardArrowUpRoundedIcon
            fontSize="large"
            style={{ color: "black" }}
          />
        }
      </button>
      <button className="cursor-pointer" onClick={moveLayerBackward}>
        {
          <KeyboardArrowDownRoundedIcon
            fontSize="large"
            style={{ color: "black" }}
          />
        }
      </button>
      <button className="cursor-pointer" onClick={sendLayerToBack}>
        {
          <KeyboardDoubleArrowDownRoundedIcon
            fontSize="large"
            style={{ color: "black" }}
          />
        }
      </button>
    </div>
  );
};
