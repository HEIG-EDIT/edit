import react from "react";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ViewCompactRoundedIcon from "@mui/icons-material/ViewCompactRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { LayerConfigurationProps } from "@/models/editor/layers/layerConfigurationProps";

// TODO : ajouter logique (modifier icone quand bouton clique et ajouter fonctions logiques)
// FIXME: Les boutons Material UI sont trop hauts ce qui influence la hauteur du component
// Peut-être changer minHeight / minWidth dans le style ?
// TODO: Trouver une meilleure manière de gérer la couleur dans les composants MUI
// Actuellement "color" est utilisé sur tout le composant, y compris les contours
export const LayerConfiguration = ({
  name,
  isSelected,
  isVisible,
  updateLayer,
}: LayerConfigurationProps) => {
  return (
    <div className="border-2 border-violet-500 bg-violet-50 rounded-2xl p-2 flex justify-between">
      <div className="flex justify-start gap-2">
        <Checkbox
          checked={isSelected}
          style={{ color: "#8b5cf6" }}
          onChange={(event: react.ChangeEvent<HTMLInputElement>) => {
            updateLayer((layer) => {
              return {
                ...layer,
                isSelected: event.target.checked,
              };
            });
          }}
        />
        {name}
      </div>
      <div className="flex justify-end gap-1">
        <ViewCompactRoundedIcon />
        <IconButton
          aria-label="Set layer visibility"
          style={{ color: "#101828" }}
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
        </IconButton>
      </div>
    </div>
  );
};
