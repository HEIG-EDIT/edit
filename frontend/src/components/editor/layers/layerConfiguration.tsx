import react from "react";
import ViewCompactRoundedIcon from "@mui/icons-material/ViewCompactRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { LayerConfigurationProps } from "@/models/editor/layers/layerConfigurationProps";

export const LayerConfiguration = ({
  name,
  isSelected,
  isVisible,
  updateLayer,
}: LayerConfigurationProps) => {
  return (
    <div className="border-2 border-violet-500 bg-violet-50 rounded-2xl p-2 flex flex-row items-center justify-between gap-2">
      <div className="flex flex-row justify-start gap-2">
        <input
          type="checkbox"
          className="accent-violet-500"
          checked={isSelected}
          onChange={(e: react.ChangeEvent<HTMLInputElement>) => {
            updateLayer((layer) => {
              return {
                ...layer,
                isSelected: e.target.checked,
              };
            }, true);
          }}
        />
        <p>{name}</p>
      </div>
      <div className="flex flex-row justify-end gap-2">
        <ViewCompactRoundedIcon />
        <button
          onClick={() => {
            updateLayer((layer) => {
              return {
                ...layer,
                isVisible: !layer.isVisible,
                isSelected: layer.isVisible ? false : layer.isSelected,
              };
            });
          }}
        >
          {isVisible ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
        </button>
      </div>
    </div>
  );
};
