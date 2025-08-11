import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import ViewCompactRoundedIcon from "@mui/icons-material/ViewCompactRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { LayerUpdateCallback } from "@/components/editor/types";

type LayerConfigurationProps = {
  name: string;
  isSelected: boolean;
  isVisible: boolean;
  updateLayer: (callback: LayerUpdateCallback) => void;
};

// TODO : ajouter logique (modifier icone quand bouton clique et ajouter fonctions logiques)
export const LayerConfiguration = ({
  name,
  isSelected,
  isVisible,
  updateLayer,
}: LayerConfigurationProps) => {
  return (
    <div className="border-2 border-violet-500 bg-violet-50 rounded-2xl p-2 flex justify-between">
      <div className="flex justify-start gap-2">
        <CheckBoxOutlineBlankRoundedIcon />
        {name}
      </div>
      <div className="flex justify-end gap-1">
        <ViewCompactRoundedIcon />
        <SettingsRoundedIcon />
        <button
          onClick={() => {
            updateLayer((layer) => {
              return {
                ...layer,
                isVisible: !layer.isVisible,
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
