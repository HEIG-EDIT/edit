import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import { LayerReorderingButton } from "./reorderingButton";
import { useEditorContext } from "../editorContext";

export const LayerReordering = () => {
  const { layersReorderingLogic } = useEditorContext();
  const {
    bringLayersToFront,
    moveLayersForward,
    canMoveLayersForward,

    sendLayersToBack,
    moveLayersBackward,
    canMoveLayersBackward,
  } = layersReorderingLogic;
  return (
    <div>
      <LayerReorderingButton
        onClick={bringLayersToFront}
        icon={KeyboardDoubleArrowUpRoundedIcon}
        canUse={canMoveLayersForward}
      />
      <LayerReorderingButton
        onClick={moveLayersForward}
        icon={KeyboardArrowUpRoundedIcon}
        canUse={canMoveLayersForward}
      />
      <LayerReorderingButton
        onClick={moveLayersBackward}
        icon={KeyboardArrowDownRoundedIcon}
        canUse={canMoveLayersBackward}
      />
      <LayerReorderingButton
        onClick={sendLayersToBack}
        icon={KeyboardDoubleArrowDownRoundedIcon}
        canUse={canMoveLayersBackward}
      />
    </div>
  );
};
